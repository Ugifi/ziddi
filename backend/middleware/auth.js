const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Regular user auth
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query('SELECT id, name, mobile, role, is_blocked FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'User not found' });

    const user = rows[0];
    if (user.is_blocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Admin only auth
const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query('SELECT id, name, mobile, role FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'User not found' });

    if (rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access only' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
