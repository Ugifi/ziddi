const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
require('dotenv').config();

// Multer config for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `dep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// ─── GET BALANCE ──────────────────────────────────────────────────────────────
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({
      success: true,
      wallet_balance: parseFloat(rows[0].wallet_balance),
      winning_balance: parseFloat(rows[0].winning_balance),
      total: parseFloat(rows[0].wallet_balance) + parseFloat(rows[0].winning_balance)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DEPOSIT REQUEST ──────────────────────────────────────────────────────────
router.post('/deposit', authMiddleware, upload.single('payment_proof'), [
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const amount = parseFloat(req.body.amount);
  const minDeposit = parseFloat(process.env.MIN_DEPOSIT || 100);

  if (amount < minDeposit) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: `Minimum deposit ₹${minDeposit}` });
  }

  const payment_proof = req.file ? req.file.filename : null;
  const utr = req.body.utr || null;

  try {
    // Get payment settings
    const [settings] = await db.query("SELECT setting_value FROM site_settings WHERE setting_key = 'upi_id'");
    const upi_id = settings.length ? settings[0].setting_value : 'N/A';

    const [result] = await db.query(
      'INSERT INTO deposit_requests (user_id, amount, payment_proof, utr_number, status) VALUES (?, ?, ?, ?, "pending")',
      [req.user.id, amount, payment_proof, utr]
    );

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted. Admin will approve shortly.',
      request_id: result.insertId,
      upi_id
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── WITHDRAWAL REQUEST ───────────────────────────────────────────────────────
router.post('/withdraw', authMiddleware, [
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('upi_id').notEmpty().withMessage('UPI ID required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const amount = parseFloat(req.body.amount);
  const { upi_id, bank_name, account_number, ifsc } = req.body;

  const minWithdraw = parseFloat(process.env.MIN_WITHDRAWAL || 500);
  const maxWithdraw = parseFloat(process.env.MAX_WITHDRAWAL || 50000);

  if (amount < minWithdraw) return res.status(400).json({ success: false, message: `Minimum withdrawal ₹${minWithdraw}` });
  if (amount > maxWithdraw) return res.status(400).json({ success: false, message: `Maximum withdrawal ₹${maxWithdraw}` });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock user row
    const [rows] = await conn.query('SELECT winning_balance FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    const winBalance = parseFloat(rows[0].winning_balance);

    if (winBalance < amount) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Insufficient winning balance. Available: ₹${winBalance}` });
    }

    // Check pending withdrawal
    const [pending] = await conn.query(
      "SELECT id FROM deposit_requests WHERE user_id = ? AND type = 'withdrawal' AND status = 'pending'",
      [req.user.id]
    );
    if (pending.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'You already have a pending withdrawal request' });
    }

    // Deduct winning balance
    await conn.query('UPDATE users SET winning_balance = winning_balance - ? WHERE id = ?', [amount, req.user.id]);

    // Create withdrawal request
    const [result] = await conn.query(
      'INSERT INTO deposit_requests (user_id, amount, type, upi_id, bank_name, account_number, ifsc_code, status) VALUES (?, ?, "withdrawal", ?, ?, ?, ?, "pending")',
      [req.user.id, amount, upi_id, bank_name || null, account_number || null, ifsc || null]
    );

    // Log transaction
    await conn.query(
      'INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id) VALUES (?, "debit", "winning_wallet", ?, "Withdrawal Request", ?)',
      [req.user.id, amount, result.insertId]
    );

    await conn.commit();
    res.json({
      success: true,
      message: 'Withdrawal request submitted. Processing within 24 hours.',
      request_id: result.insertId
    });
  } catch (err) {
    await conn.rollback();
    console.error('Withdraw error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ─── TRANSACTION HISTORY ──────────────────────────────────────────────────────
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT id, type, wallet_type, amount, description, status, created_at
       FROM transactions WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const [count] = await db.query('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      transactions: rows,
      pagination: { page, limit, total: count[0].total, pages: Math.ceil(count[0].total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DEPOSIT/WITHDRAWAL HISTORY ───────────────────────────────────────────────
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const type = req.query.type || 'deposit'; // deposit or withdrawal
    const [rows] = await db.query(
      `SELECT id, amount, type, status, upi_id, utr_number, created_at, updated_at
       FROM deposit_requests WHERE user_id = ? AND type = ?
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id, type]
    );
    res.json({ success: true, requests: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
