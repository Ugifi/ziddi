const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { adminMiddleware } = require('../middleware/auth');

// All admin routes require admin token
router.use(adminMiddleware);

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[users]]        = await db.query('SELECT COUNT(*) as total FROM users WHERE role = "user"');
    const [[activeGames]]  = await db.query('SELECT COUNT(*) as total FROM games WHERE status = "open"');
    const [[todayBids]]    = await db.query('SELECT COUNT(*) as total, SUM(amount) as volume FROM bids WHERE DATE(created_at) = CURDATE()');
    const [[pendingDep]]   = await db.query('SELECT COUNT(*) as total, SUM(amount) as volume FROM deposit_requests WHERE type="deposit" AND status="pending"');
    const [[pendingWith]]  = await db.query('SELECT COUNT(*) as total, SUM(amount) as volume FROM deposit_requests WHERE type="withdrawal" AND status="pending"');
    const [[totalDeposit]] = await db.query('SELECT SUM(amount) as total FROM deposit_requests WHERE type="deposit" AND status="approved"');
    const [[totalWin]]     = await db.query('SELECT SUM(win_amount) as total FROM bids WHERE status="won"');
    const [[totalWallet]]  = await db.query('SELECT SUM(wallet_balance) as w, SUM(winning_balance) as ww FROM users');

    res.json({
      success: true,
      stats: {
        total_users: users.total,
        active_games: activeGames.total,
        today_bids: { count: todayBids.total || 0, volume: todayBids.volume || 0 },
        pending_deposits: { count: pendingDep.total || 0, volume: pendingDep.volume || 0 },
        pending_withdrawals: { count: pendingWith.total || 0, volume: pendingWith.volume || 0 },
        total_deposited: totalDeposit.total || 0,
        total_winnings_paid: totalWin.total || 0,
        platform_wallet_total: (totalWallet.w || 0) + (totalWallet.ww || 0)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.get('/users', async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = `SELECT id, name, mobile, role, wallet_balance, winning_balance,
                        is_blocked, last_login, created_at
                 FROM users WHERE role = 'user'`;
    const params = [];
    if (search) { query += ' AND (name LIKE ? OR mobile LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [users] = await db.query(query, params);
    const [count] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "user"' + (search ? ' AND (name LIKE ? OR mobile LIKE ?)' : ''),
      search ? [`%${search}%`, `%${search}%`] : []
    );

    res.json({ success: true, users, pagination: { page, limit, total: count[0].total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const [user] = await db.query(
      'SELECT id, name, mobile, role, wallet_balance, winning_balance, is_blocked, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });

    const [bids]  = await db.query('SELECT COUNT(*) as total, SUM(amount) as volume FROM bids WHERE user_id = ?', [req.params.id]);
    const [wins]  = await db.query('SELECT COUNT(*) as total, SUM(win_amount) as volume FROM bids WHERE user_id = ? AND status = "won"', [req.params.id]);
    const [txns]  = await db.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.id]);

    res.json({
      success: true,
      user: user[0],
      stats: { total_bids: bids[0].total, bid_volume: bids[0].volume || 0, wins: wins[0].total, win_amount: wins[0].volume || 0 },
      recent_transactions: txns
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/block', [
  body('block').isBoolean()
], async (req, res) => {
  try {
    const { block } = req.body;
    await db.query('UPDATE users SET is_blocked = ? WHERE id = ? AND role = "user"', [block ? 1 : 0, req.params.id]);
    res.json({ success: true, message: `User ${block ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id/coins', [
  body('amount').isFloat({ min: 1 }),
  body('action').isIn(['add', 'deduct']),
  body('wallet').isIn(['wallet', 'winning'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { amount, action, wallet, note } = req.body;
  const amountF = parseFloat(amount);
  const walletCol = wallet === 'winning' ? 'winning_balance' : 'wallet_balance';
  const walletType = wallet === 'winning' ? 'winning_wallet' : 'wallet';

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [user] = await conn.query(`SELECT ${walletCol} FROM users WHERE id = ? FOR UPDATE`, [req.params.id]);
    if (!user.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'User not found' }); }

    if (action === 'deduct' && parseFloat(user[0][walletCol]) < amountF) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Insufficient balance to deduct' });
    }

    const op = action === 'add' ? '+' : '-';
    await conn.query(`UPDATE users SET ${walletCol} = ${walletCol} ${op} ? WHERE id = ?`, [amountF, req.params.id]);

    await conn.query(
      `INSERT INTO transactions (user_id, type, wallet_type, amount, description, status)
       VALUES (?, ?, ?, ?, ?, 'completed')`,
      [req.params.id, action === 'add' ? 'credit' : 'debit', walletType, amountF,
       note || `Admin ${action === 'add' ? 'credited' : 'deducted'} ₹${amountF}`]
    );

    await conn.commit();
    res.json({ success: true, message: `₹${amountF} ${action === 'add' ? 'added to' : 'deducted from'} user wallet` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

router.put('/users/:id/reset-password', [
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.params.id]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════
//  GAME MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.get('/games', async (req, res) => {
  try {
    const [games] = await db.query('SELECT * FROM games WHERE status != "deleted" ORDER BY created_at DESC');
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/games', [
  body('name').notEmpty(),
  body('open_time').notEmpty(),
  body('close_time').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array(), message: "Invalid Input" });

  const { name, open_time, close_time, category } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO games (name, open_time, close_time, result_time, game_category, min_bid, max_bid, status, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, "closed", 0)',
      [name, open_time, close_time, close_time, category || 'regular', 10, 10000]
    );
    res.status(201).json({
      success: true,
      message: 'Game created',
      game: { id: result.insertId, name, open_time, close_time, status: 'closed', is_hidden: 0 }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

router.put('/games/:id', async (req, res) => {
  const { name, open_time, close_time, result_time, min_bid, max_bid } = req.body;
  try {
    await db.query(
      'UPDATE games SET name=?, open_time=?, close_time=?, result_time=?, min_bid=?, max_bid=? WHERE id=?',
      [name, open_time, close_time, result_time, min_bid, max_bid, req.params.id]
    );
    res.json({ success: true, message: 'Game updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/games/:id/status', [
  body('status').isIn(['open', 'closed'])
], async (req, res) => {
  try {
    await db.query('UPDATE games SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ success: true, message: `Game ${req.body.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/games/:id/hide', async (req, res) => {
  const { hide } = req.body;
  try {
    await db.query('UPDATE games SET is_hidden = ? WHERE id = ?', [hide ? 1 : 0, req.params.id]);
    res.json({ success: true, message: `Game ${hide ? 'hidden' : 'visible'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/games/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM games WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Game deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DECLARE RESULT ───────────────────────────────────────────────────────────
router.put('/games/:id/result', [
  body('open_result').notEmpty().withMessage('Open result required'),
  body('close_result').notEmpty().withMessage('Close result required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { open_result, close_result } = req.body;
  const gameId = req.params.id;

  const openDigit  = parseInt(open_result.trim().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0)) % 10;
  const closeDigit = parseInt(close_result.trim().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0)) % 10;
  const jodi_result = `${String(openDigit).padStart(1, '0')}${String(closeDigit).padStart(1, '0')}`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE games SET open_result=?, close_result=?, jodi_result=?, status='closed', result_declared_at=NOW() WHERE id=?`,
      [open_result, close_result, jodi_result, gameId]
    );

    const [bids] = await conn.query(
      "SELECT * FROM bids WHERE game_id = ? AND status = 'pending'",
      [gameId]
    );

    const GAME_PAYOUTS = {
      single_digit: 9, jodi: 90, single_pana: 150, double_pana: 300, triple_pana: 600,
      half_sangam_a: 1500, half_sangam_b: 1500, full_sangam: 10000, sp_motor: 150,
      dp_motor: 300, tp_motor: 600, odd_even: 2, family_jodi: 90, cycle_pana: 150,
      sp_dp_tp: 150, red_bracket: 9, common_digit: 9, choice_sangam: 10000,
      open_close: 9, jackpot: 9000, panel_group: 150, gunule: 9
    };

    let totalWinners = 0;
    let totalPaid = 0;

    for (const bid of bids) {
      let isWinner = false;
      const result = bid.session === 'open' ? open_result : close_result;

      switch (bid.game_type) {
        case 'single_digit':
        case 'single_digit_bulk':
        case 'gunule':
        case 'red_bracket':
        case 'common_digit':
        case 'open_close': {
          const digit = parseInt(bid.session === 'open' ? String(openDigit) : String(closeDigit));
          isWinner = String(digit) === String(bid.number);
          break;
        }
        case 'jodi':
        case 'family_jodi':
        case 'jodi_digit':
        case 'jodi_bulk':
        case 'red_jodi':
        case 'cycle_jodi':
        case 'digit_jodi':
          isWinner = bid.number === jodi_result;
          break;
        case 'single_pana':
        case 'single_pana_bulk':
        case 'double_pana':
        case 'double_pana_bulk':
        case 'triple_pana':
        case 'sp_motor':
        case 'dp_motor':
        case 'tp_motor':
        case 'cycle_pana':
        case 'sp_dp_tp':
        case 'panel_group':
          isWinner = bid.number === result;
          break;
        case 'full_sangam':
        case 'choice_sangam':
          isWinner = bid.number === `${open_result}-${close_result}`;
          break;
        case 'half_sangam_a':
          isWinner = bid.number === `${open_result}-${closeDigit}`;
          break;
        case 'half_sangam_b':
          isWinner = bid.number === `${openDigit}-${close_result}`;
          break;
        case 'odd_even':
          isWinner = (bid.number === 'odd' && openDigit % 2 !== 0) || (bid.number === 'even' && openDigit % 2 === 0);
          break;
        case 'jackpot':
          isWinner = bid.number === result;
          break;
        default:
          isWinner = bid.number === result;
      }

      if (isWinner) {
        const payout = GAME_PAYOUTS[bid.game_type] || 9;
        const winAmount = parseFloat(bid.amount) * payout;
        await conn.query('UPDATE users SET winning_balance = winning_balance + ? WHERE id = ?', [winAmount, bid.user_id]);
        await conn.query("UPDATE bids SET status='won', win_amount=? WHERE id=?", [winAmount, bid.id]);
        await conn.query(
          `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status)
           VALUES (?, 'credit', 'winning_wallet', ?, ?, ?, 'completed')`,
          [bid.user_id, winAmount, `Won: Game result ${jodi_result}`, bid.id]
        );
        totalWinners++;
        totalPaid += winAmount;
      } else {
        await conn.query("UPDATE bids SET status='lost' WHERE id=?", [bid.id]);
      }
    }

    await conn.commit();
    res.json({
      success: true,
      message: 'Result declared successfully',
      result: { open_result, close_result, jodi_result },
      summary: { total_bids_processed: bids.length, winners: totalWinners, losers: bids.length - totalWinners, total_payout: totalPaid }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Result declare error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ══════════════════════════════════════════════════════════════
//  DEPOSIT MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.get('/deposits', async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;

    // ✅ FIX: comma added, CONVERT_TZ for IST time
    const [rows] = await db.query(
      `SELECT d.*, u.name, u.mobile,
        DATE_FORMAT(CONVERT_TZ(d.created_at, '+00:00', '+05:30'), '%Y-%m-%d %H:%i:%s') as created_at
       FROM deposit_requests d
       JOIN users u ON d.user_id = u.id
       WHERE d.type = 'deposit' AND d.status = ?
       ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
      [status, limit, offset]
    );
    const [count] = await db.query(
      "SELECT COUNT(*) as total FROM deposit_requests WHERE type = 'deposit' AND status = ?",
      [status]
    );

    res.json({ success: true, deposits: rows, pagination: { page, limit, total: count[0].total } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/deposits/:id', [
  body('action').isIn(['approve', 'reject'])
], async (req, res) => {
  const { action, note } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT * FROM deposit_requests WHERE id = ? AND type = 'deposit' FOR UPDATE",
      [req.params.id]
    );
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Request not found' }); }

    const dep = rows[0];
    if (dep.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Already ${dep.status}` });
    }

    await conn.query(
      'UPDATE deposit_requests SET status = ?, admin_note = ?, updated_at = NOW() WHERE id = ?',
      [action === 'approve' ? 'approved' : 'rejected', note || null, req.params.id]
    );

    if (action === 'approve') {
      await conn.query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [dep.amount, dep.user_id]);
      await conn.query(
        `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status)
         VALUES (?, 'credit', 'wallet', ?, 'Deposit approved by Admin', ?, 'completed')`,
        [dep.user_id, dep.amount, dep.id]
      );
    }

    await conn.commit();
    res.json({ success: true, message: `Deposit ${action}d successfully` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ══════════════════════════════════════════════════════════════
//  WITHDRAWAL MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.get('/withdrawals', async (req, res) => {
  try {
    const status = req.query.status || 'pending';

    // ✅ FIX: comma added, CONVERT_TZ for IST time
    const [rows] = await db.query(
      `SELECT d.*, u.name, u.mobile,
        DATE_FORMAT(CONVERT_TZ(d.created_at, '+00:00', '+05:30'), '%Y-%m-%d %H:%i:%s') as created_at
       FROM deposit_requests d
       JOIN users u ON d.user_id = u.id
       WHERE d.type = 'withdrawal' AND d.status = ?
       ORDER BY d.created_at DESC LIMIT 100`,
      [status]
    );
    res.json({ success: true, withdrawals: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/withdrawals/:id', [
  body('action').isIn(['approve', 'reject'])
], async (req, res) => {
  const { action, note } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT * FROM deposit_requests WHERE id = ? AND type = 'withdrawal' FOR UPDATE",
      [req.params.id]
    );
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Not found' }); }

    const wd = rows[0];
    if (wd.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Already ${wd.status}` });
    }

    if (action === 'reject') {
      await conn.query('UPDATE users SET winning_balance = winning_balance + ? WHERE id = ?', [wd.amount, wd.user_id]);
      await conn.query(
        `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status)
         VALUES (?, 'credit', 'winning_wallet', ?, 'Withdrawal rejected - refunded', ?, 'completed')`,
        [wd.user_id, wd.amount, wd.id]
      );
    }

    await conn.query(
      'UPDATE deposit_requests SET status = ?, admin_note = ?, updated_at = NOW() WHERE id = ?',
      [action === 'approve' ? 'approved' : 'rejected', note || null, req.params.id]
    );

    await conn.commit();
    res.json({ success: true, message: `Withdrawal ${action}d` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ══════════════════════════════════════════════════════════════
//  BIDS MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.get('/bids', async (req, res) => {
  try {
    const page   = parseInt(req.query.page) || 1;
    const limit  = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const game_id = req.query.game_id || null;

    // ✅ FIX: CONVERT_TZ for IST time
    let query = `SELECT b.*, u.name, u.mobile, g.name as game_name,
      DATE_FORMAT(CONVERT_TZ(b.created_at, '+00:00', '+05:30'), '%Y-%m-%d %H:%i:%s') as created_at
      FROM bids b
      JOIN users u ON b.user_id = u.id
      JOIN games g ON b.game_id = g.id WHERE 1=1`;
    const params = [];
    if (game_id) { query += ' AND b.game_id = ?'; params.push(game_id); }
    if (req.query.status) { query += ' AND b.status = ?'; params.push(req.query.status); }
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [bids] = await db.query(query, params);
    res.json({ success: true, bids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ══════════════════════════════════════════════════════════════
//  SITE SETTINGS
// ══════════════════════════════════════════════════════════════

router.get('/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });

    if (!settings.whatsapp && settings.whatsapp_support) settings.whatsapp = settings.whatsapp_support;
    if (!settings.whatsapp_support && settings.whatsapp)  settings.whatsapp_support = settings.whatsapp;
    if (!settings.phone && settings.support_phone) settings.phone = settings.support_phone;
    if (!settings.site_name) settings.site_name = 'SAKTA MATKA';

    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const incoming = req.body;
    const toSave = { ...incoming };

    if (toSave.whatsapp)         toSave.whatsapp_support = toSave.whatsapp;
    if (toSave.whatsapp_support) toSave.whatsapp         = toSave.whatsapp_support;
    if (toSave.phone)            toSave.support_phone    = toSave.phone;
    if (toSave.support_phone)    toSave.phone            = toSave.support_phone;

    for (const [key, value] of Object.entries(toSave)) {
      if (key === undefined || key === 'undefined') continue;
      await db.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()',
        [key, value ?? '', value ?? '']
      );
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ══════════════════════════════════════════════════════════════
//  NOTICES MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.get('/notices', async (req, res) => {
  try {
    const [notices] = await db.query('SELECT * FROM notices ORDER BY created_at DESC');
    res.json({ success: true, notices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/notices', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message required' });
    }
    await db.query(
      'INSERT INTO notices (message, is_active, created_at) VALUES (?, 1, NOW())',
      [message.trim()]
    );
    res.json({ success: true, message: 'Notice sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

router.delete('/notices/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;