const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// ─── HELPER: Generate unique referral code ────────────────────────────────────
function generateReferralCode(userId) {
  return 'MK' + String(userId).padStart(6, '0');
}

// ─── 1. REGISTER ──────────────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid 10-digit mobile required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, mobile, password, referral_code } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Mobile already registered' });

    const hashed = await bcrypt.hash(password, 10);

    let referrerId = null;
    if (referral_code && referral_code.trim()) {
      const [ref] = await db.query('SELECT id FROM users WHERE referral_code = ?', [referral_code.trim().toUpperCase()]);
      if (ref.length) {
        referrerId = ref[0].id;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }
    }

    const avatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=King&backgroundColor=ffcc00',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro&backgroundColor=00cc44',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero&backgroundColor=ff2244',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Boss&backgroundColor=00aaff',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Star&backgroundColor=8800ff',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=ff8800'
    ];
    const randomProfilePic = avatars[Math.floor(Math.random() * avatars.length)];

    const [result] = await db.query(
      'INSERT INTO users (name, mobile, password, referred_by, profile_pic) VALUES (?, ?, ?, ?, ?)',
      [name, mobile, hashed, referrerId, randomProfilePic]
    );

    const newUserId = result.insertId;
    const newReferralCode = generateReferralCode(newUserId);
    await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [newReferralCode, newUserId]);

    if (referrerId) {
      await db.query(
        'INSERT INTO referral_bonuses (referrer_id, joiner_id, bonus_amount, status) VALUES (?, ?, 50, "pending")',
        [referrerId, newUserId]
      );
    }

    const token = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: newUserId, name, mobile, role: 'user', profile_pic: randomProfilePic, referral_code: newReferralCode }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 2. LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', [
  body('mobile').notEmpty().withMessage('Mobile required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { mobile, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE mobile = ?', [mobile]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid mobile or password' });

    const user = rows[0];
    if (user.is_blocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid mobile or password' });

    let referralCode = user.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode(user.id);
      await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [referralCode, user.id]);
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        profile_pic: user.profile_pic,
        wallet_balance: user.wallet_balance,
        winning_balance: user.winning_balance,
        referral_code: referralCode
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 3. GET PROFILE ───────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, mobile, role, profile_pic, wallet_balance, winning_balance, referral_code FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    let user = rows[0];

    if (!user.referral_code) {
      const newCode = generateReferralCode(user.id);
      await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [newCode, user.id]);
      user.referral_code = newCode;
    }

    const [statsRows] = await db.query(`
      SELECT 
        COUNT(id) AS total_bids,
        SUM(CASE WHEN status = 'win' THEN 1 ELSE 0 END) AS games_won,
        MAX(CASE WHEN status = 'win' THEN win_amount ELSE 0 END) AS highest_win,
        AVG(amount) AS avg_bid
      FROM bids WHERE user_id = ?
    `, [req.user.id]);
    const stats = statsRows[0] || {};

    user.total_bids  = stats.total_bids || 0;
    user.games_won   = stats.games_won || 0;
    user.highest_win = stats.highest_win || 0;
    user.avg_bid     = stats.avg_bid ? Math.round(Number(stats.avg_bid)) : 0;

    const [refStats] = await db.query(
      'SELECT COUNT(*) as total_referrals, SUM(CASE WHEN status="credited" THEN bonus_amount ELSE 0 END) as total_earned FROM referral_bonuses WHERE referrer_id = ?',
      [req.user.id]
    );
    user.total_referrals = refStats[0].total_referrals || 0;
    user.referral_earned = refStats[0].total_earned || 0;

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 4. UPDATE PROFILE NAME ───────────────────────────────────────────────────
router.post('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 5. UPDATE PASSWORD ───────────────────────────────────────────────────────
router.post('/update-password', authMiddleware, async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body;
    const userId = req.user.id;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Min 6 characters required' });

    if (oldPassword) {
      const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
      const match = await bcrypt.compare(oldPassword, rows[0].password);
      if (!match) return res.status(401).json({ success: false, message: 'Current password galat hai' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 6. REFERRAL STATS ────────────────────────────────────────────────────────
router.get('/referral-stats', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.query('SELECT id, referral_code FROM users WHERE id = ?', [req.user.id]);

    let referralCode = user[0]?.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode(req.user.id);
      await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [referralCode, req.user.id]);
    }

    const [rows] = await db.query(
      `SELECT rb.*, u.name as joiner_name 
       FROM referral_bonuses rb 
       JOIN users u ON u.id = rb.joiner_id 
       WHERE rb.referrer_id = ?
       ORDER BY rb.created_at DESC`,
      [req.user.id]
    );
    const total_earned  = rows.filter(r => r.status === 'credited').reduce((a, r) => a + Number(r.bonus_amount), 0);
    const pending_bonus = rows.filter(r => r.status === 'pending').reduce((a, r) => a + Number(r.bonus_amount), 0);

    res.json({
      success: true,
      data: {
        referral_code:   referralCode,
        total_referrals: rows.length,
        total_earned,
        pending_bonus,
        referrals: rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 7. CHANGE PASSWORD ───────────────────────────────────────────────────────
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;
    if (!new_password || new_password.length < 6)
      return res.status(400).json({ success: false, message: 'Min 6 characters required' });
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    const match = await bcrypt.compare(old_password, rows[0].password);
    if (!match) return res.status(401).json({ success: false, message: 'Current password galat hai' });
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 8. FORGOT PASSWORD (Mobile + Name verify karke reset) ───────────────────
// POST /api/auth/forgot-password
// Body: { mobile, name, new_password }
router.post('/forgot-password', [
  body('mobile').notEmpty().withMessage('Mobile required'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('new_password').isLength({ min: 6 }).withMessage('Password min 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { mobile, name, new_password } = req.body;

  try {
    // Mobile se user dhundo
    const [rows] = await db.query('SELECT id, name, is_blocked FROM users WHERE mobile = ?', [mobile]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Yeh mobile number registered nahi hai' });
    }

    const user = rows[0];

    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Account blocked hai. Support se contact karo.' });
    }

    // Name verify karo (case-insensitive)
    const dbName    = user.name.trim().toLowerCase();
    const inputName = name.trim().toLowerCase();

    if (dbName !== inputName) {
      return res.status(401).json({ success: false, message: 'Mobile aur naam match nahi karta' });
    }

    // Sab sahi hai — password reset karo
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);

    res.json({ success: true, message: 'Password successfully reset kar diya gaya! Ab login karo.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
