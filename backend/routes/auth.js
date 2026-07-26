const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth'); 

// 🚫 MULTER SETUP HATA DIYA GAYA HAI KYUNKI USER PHOTO UPLOAD NAHI KAREGA 🚫

// ─── 1. REGISTER (WITH AUTO AVATAR) ──────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid 10-digit mobile required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, mobile, password, referred_by } = req.body;

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Mobile already registered' });

    const hashed = await bcrypt.hash(password, 10);

    let referrerId = null;
    if (referred_by) {
      const [ref] = await db.query('SELECT id FROM users WHERE mobile = ?', [referred_by]);
      if (ref.length) referrerId = ref[0].id;
    }

    // 🔥 6 PREMIUM AVATARS KI LIST 🔥
    const avatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=King&backgroundColor=ffcc00',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro&backgroundColor=00cc44',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero&backgroundColor=ff2244',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Boss&backgroundColor=00aaff',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Star&backgroundColor=8800ff',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=ff8800'
    ];

    // 🔥 RANDOM AVATAR SELECT KAREN 🔥
    const randomProfilePic = avatars[Math.floor(Math.random() * avatars.length)];

    // 🔥 DB MEIN PROFILE PIC BHI INSERT KAREN 🔥
    const [result] = await db.query(
      'INSERT INTO users (name, mobile, password, referred_by, profile_pic) VALUES (?, ?, ?, ?, ?)',
      [name, mobile, hashed, referrerId, randomProfilePic]
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: result.insertId, name, mobile, role: 'user', profile_pic: randomProfilePic }
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
        winning_balance: user.winning_balance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 3. GET PROFILE (UPDATED WITH STATS) ──────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // 1. Basic user details fetch
    const [rows] = await db.query('SELECT id, name, mobile, role, profile_pic, wallet_balance, winning_balance FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    let user = rows[0];

    // 2. Bids table se user ke stats calculate karo
    const statsQuery = `
      SELECT 
        COUNT(id) AS total_bids,
        SUM(CASE WHEN status = 'win' THEN 1 ELSE 0 END) AS games_won,
        MAX(CASE WHEN status = 'win' THEN win_amount ELSE 0 END) AS highest_win,
        AVG(amount) AS avg_bid
      FROM bids 
      WHERE user_id = ?
    `;
    
    const [statsRows] = await db.query(statsQuery, [req.user.id]);
    const stats = statsRows[0] || {};

    // 3. Stats ko user object ke andar add kar do
    user.total_bids = stats.total_bids || 0;
    user.games_won = stats.games_won || 0;
    user.highest_win = stats.highest_win || 0;
    
    // Average bid ko integer/decimal banake handle karna taaki null na ho
    user.avg_bid = stats.avg_bid ? Math.round(Number(stats.avg_bid)) : 0; 

    res.json({ success: true, user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 4. UPDATE PROFILE NAME (NO IMAGE UPLOAD) ────────────────────────────────
router.post('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        
        if (!name) return res.status(400).json({ success: false, message: 'Name required' });

        // Sirf naam update hoga, photo nahi
        await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── 5. UPDATE PASSWORD ────────────────────────────────────────────────────────
router.post('/update-password', authMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id;

        if (!newPassword || newPassword.length < 6)
            return res.status(400).json({ success: false, message: 'Min 6 characters required' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;