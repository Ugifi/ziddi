const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
require('dotenv').config();

// ✅ 2 AM Reset Logic: Date 2 baje badlegi
function getMatkaDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  if (ist.getUTCHours() < 2) {
    ist.setUTCDate(ist.getUTCDate() - 1);
  }
  return ist.toISOString().split('T')[0];
}

// All game types with payout multipliers
const GAME_TYPES = {
  'single_digit':      { name: 'Single Digit',       payout: 9.5,   min_digits: 1, max_digits: 1 },
  'jodi':              { name: 'Jodi',               payout: 95,    min_digits: 2, max_digits: 2 },
  'single_pana':       { name: 'Single Pana',        payout: 150,   min_digits: 3, max_digits: 3 },
  'double_pana':       { name: 'Double Pana',        payout: 300,   min_digits: 3, max_digits: 3 },
  'triple_pana':       { name: 'Triple Pana',        payout: 700,   min_digits: 3, max_digits: 3 },
  'half_sangam_a':     { name: 'Half Sangam A',      payout: 1000,  min_digits: 4, max_digits: 4 },
  'half_sangam_b':     { name: 'Half Sangam B',      payout: 1000,  min_digits: 4, max_digits: 4 },
  'full_sangam':       { name: 'Full Sangam',        payout: 10000, min_digits: 6, max_digits: 6 },
  'sp_motor':          { name: 'SP Motor',           payout: 150,   min_digits: 3, max_digits: 3 },
  'dp_motor':          { name: 'DP Motor',           payout: 300,   min_digits: 3, max_digits: 3 },
  'tp_motor':          { name: 'TP Motor',           payout: 700,   min_digits: 3, max_digits: 3 },
  'odd_even':          { name: 'Odd Even',           payout: 2,     min_digits: 1, max_digits: 1 },
  'family_jodi':       { name: 'Family Jodi',        payout: 95,    min_digits: 2, max_digits: 2 },
  'cycle_pana':        { name: 'Cycle Pana',         payout: 150,   min_digits: 3, max_digits: 3 },
  'sp_dp_tp':          { name: 'SP DP TP',           payout: 150,   min_digits: 3, max_digits: 3 },
  'red_bracket':       { name: 'Red Bracket',        payout: 9.5,   min_digits: 1, max_digits: 1 },
  'common_digit':      { name: 'Common Digit',       payout: 9.5,   min_digits: 1, max_digits: 1 },
  'choice_sangam':     { name: 'Choice Sangam',      payout: 10000, min_digits: 6, max_digits: 6 },
  'open_close':        { name: 'Open/Close',         payout: 9.5,   min_digits: 1, max_digits: 1 },
  'jackpot':           { name: 'Jackpot',            payout: 9000,  min_digits: 3, max_digits: 3 },
  'panel_group':       { name: 'Panel Group',        payout: 150,   min_digits: 3, max_digits: 3 },
  'gunule':            { name: 'Gunule',             payout: 9.5,   min_digits: 1, max_digits: 1 },
  'jodi_digit':        { name: 'Jodi Digit',         payout: 95,    min_digits: 2, max_digits: 2 },
  'single_digit_bulk': { name: 'Single Digit Bulk',  payout: 9.5,   min_digits: 1, max_digits: 1 },
  'jodi_bulk':         { name: 'Jodi Bulk',          payout: 95,    min_digits: 2, max_digits: 2 },
  'red_jodi':          { name: 'Red Jodi',           payout: 95,    min_digits: 2, max_digits: 2 },
  'cycle_jodi':        { name: 'Cycle Jodi',         payout: 95,    min_digits: 2, max_digits: 2 },
  'digit_jodi':        { name: 'Digit Jodi',         payout: 95,    min_digits: 2, max_digits: 2 },
  'sp_common':         { name: 'SP Common',          payout: 150,   min_digits: 3, max_digits: 3 },
  'dp_common':         { name: 'DP Common',          payout: 300,   min_digits: 3, max_digits: 3 },
  'single_pana_bulk':  { name: 'Single Pana Bulk',   payout: 150,   min_digits: 3, max_digits: 3 },
  'double_pana_bulk':  { name: 'Double Pana Bulk',   payout: 300,   min_digits: 3, max_digits: 3 },
  'two_digit_pana':    { name: 'Two Digit Pana',     payout: 300,   min_digits: 3, max_digits: 3 }
};

// ─── GET ALL GAMES (with optional category filter & 2AM Reset Logic) ────────
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || null;

    const matkaDate = getMatkaDate();
    let query = `SELECT id, name, game_category, open_time, close_time, result_time, status,
                        CASE WHEN result_date = ? THEN open_result ELSE NULL END as open_result,
                        CASE WHEN result_date = ? THEN close_result ELSE NULL END as close_result,
                        CASE WHEN result_date = ? THEN jodi_result ELSE NULL END as jodi_result,
                        min_bid, max_bid, created_at
                 FROM games WHERE status != 'deleted'`;
    const params = [matkaDate, matkaDate, matkaDate];

    if (category) {
      query += ' AND game_category = ?';
      params.push(category);
    }

    query += ' ORDER BY open_time ASC';

    const [games] = await db.query(query, params);

    const gameTypes = Object.entries(GAME_TYPES).map(([key, val]) => ({
      type: key, ...val
    }));

    res.json({ success: true, games, game_types: gameTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PLACE BID ────────────────────────────────────────────────────────────────
router.post('/bid', authMiddleware, [
  body('game_id').isInt().withMessage('Valid game ID required'),
  body('game_type').notEmpty().withMessage('Game type required'),
  body('number').notEmpty().withMessage('Number required'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('session').isIn(['open', 'close']).withMessage('Session must be open or close')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { game_id, game_type, number, amount, session } = req.body;
  const bidAmount = parseFloat(amount);

  if (!GAME_TYPES[game_type]) {
    return res.status(400).json({ success: false, message: 'Invalid game type: ' + game_type });
  }

  const minBid = parseFloat(process.env.MIN_BID_AMOUNT || 10);
  const maxBid = parseFloat(process.env.MAX_BID_AMOUNT || 10000);

  if (bidAmount < minBid) return res.status(400).json({ success: false, message: `Minimum bid ₹${minBid}` });
  if (bidAmount > maxBid) return res.status(400).json({ success: false, message: `Maximum bid ₹${maxBid}` });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [games] = await conn.query('SELECT * FROM games WHERE id = ?', [game_id]);
    if (!games.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const game = games[0];

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];

    if (session === 'open' && currentTime >= game.open_time) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Open Betting Time is Over!' });
    }
    if (session === 'close' && currentTime >= game.close_time) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Close Betting Time is Over!' });
    }

    const matkaDate = getMatkaDate();
    const isTodayResult = game.result_date === matkaDate;

    const openDeclared  = isTodayResult && !!game.open_result && currentTime >= game.open_time;
    const closeDeclared = isTodayResult && !!game.close_result && currentTime >= game.close_time;

    if (openDeclared && closeDeclared) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'Game is closed for today. Results have been declared.'
      });
    }

    if (game.status !== 'open') {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Betting is ${game.status} for this game`
      });
    }

    if (openDeclared && !closeDeclared) {
      if (session === 'open') {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: 'Open result has been declared. Only Close session betting is allowed now.'
        });
      }
    }

    const gameMinBid = game.min_bid || minBid;
    const gameMaxBid = game.max_bid || maxBid;
    if (bidAmount < gameMinBid) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Minimum bid for this game: ₹${gameMinBid}` });
    }
    if (bidAmount > gameMaxBid) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Maximum bid for this game: ₹${gameMaxBid}` });
    }

    const [users] = await conn.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );
    const user = users[0];
    const walletBal    = parseFloat(user.wallet_balance);
    const winBal       = parseFloat(user.winning_balance);
    const totalBalance = walletBal + winBal;

    if (totalBalance < bidAmount) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${totalBalance.toFixed(2)}`
      });
    }

    let remainingDeduction = bidAmount;
    let walletDeducted = 0;
    let winDeducted    = 0;

    if (walletBal >= remainingDeduction) {
      walletDeducted    = remainingDeduction;
      remainingDeduction = 0;
    } else {
      walletDeducted    = walletBal;
      remainingDeduction -= walletBal;
      winDeducted       = remainingDeduction;
    }

    await conn.query(
      'UPDATE users SET wallet_balance = wallet_balance - ?, winning_balance = winning_balance - ? WHERE id = ?',
      [walletDeducted, winDeducted, req.user.id]
    );

    const payout           = GAME_TYPES[game_type].payout;
    const potential_winning = bidAmount * payout;

    const categoryLabel = game.game_category === 'starline' ? '⭐ Starline' :
                          game.game_category === 'disawar'  ? '🎰 Disawar'  : '';

    const [bidResult] = await conn.query(
      `INSERT INTO bids (user_id, game_id, game_type, session, number, amount, potential_winning, wallet_deducted, winning_deducted, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CONVERT_TZ(NOW(), '+00:00', '+05:30'))`,
      [req.user.id, game_id, game_type, session, number, bidAmount, potential_winning, walletDeducted, winDeducted]
    );

    await conn.query(
      `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status)
       VALUES (?, 'debit', 'wallet', ?, ?, ?, 'completed')`,
      [req.user.id, bidAmount,
       `Bid: ${categoryLabel} ${game.name} | ${GAME_TYPES[game_type].name} | ${number}`,
       bidResult.insertId]
    );

    await conn.commit();

    const [updatedUser] = await db.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ?',
      [req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully!',
      bid_id: bidResult.insertId,
      amount_deducted: bidAmount,
      potential_winning,
      payout_ratio: `${payout}x`,
      new_balance: {
        wallet_balance:  parseFloat(updatedUser[0].wallet_balance),
        winning_balance: parseFloat(updatedUser[0].winning_balance)
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Bid error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ─── BULK BID ─────────────────────────────────────────────────────────────────
router.post('/bid/bulk', authMiddleware, async (req, res) => {
  const { bids, session, game_id, game_type } = req.body;

  if (!Array.isArray(bids) || bids.length === 0)
    return res.status(400).json({ success: false, message: 'Bids array required' });
  if (bids.length > 100)
    return res.status(400).json({ success: false, message: 'Max 100 bids at once' });

  const minBid = parseFloat(process.env.MIN_BID_AMOUNT || 10);
  const maxBid = parseFloat(process.env.MAX_BID_AMOUNT || 10000);

  if (!GAME_TYPES[game_type])
    return res.status(400).json({ success: false, message: 'Invalid game type: ' + game_type });

  for (const bid of bids) {
    if (!bid.num || !bid.amt)
      return res.status(400).json({ success: false, message: 'Invalid bid data' });
    const a = parseFloat(bid.amt);
    if (isNaN(a) || a < minBid || a > maxBid)
      return res.status(400).json({ success: false, message: `Amount ₹${minBid}–₹${maxBid} hona chahiye` });
  }

  const totalAmount = bids.reduce((s, b) => s + parseFloat(b.amt), 0);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [games] = await conn.query('SELECT * FROM games WHERE id = ?', [game_id]);
    if (!games.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Game not found' }); }
    const game = games[0];

    if (game.status !== 'open') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Game ${game.status} hai` });
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const matkaDate = getMatkaDate();

    if (session === 'open' && currentTime >= game.open_time) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Open Betting Time is Over!' });
    }
    if (session === 'close' && currentTime >= game.close_time) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Close Betting Time is Over!' });
    }

    const isTodayResult = game.result_date === matkaDate;
    const openDeclared  = isTodayResult && !!game.open_result && currentTime >= game.open_time;
    const closeDeclared = isTodayResult && !!game.close_result && currentTime >= game.close_time;

    if (openDeclared && closeDeclared) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Game closed. Results declared.' });
    }
    if (openDeclared && session === 'open') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Only Close session allowed now.' });
    }

    const [users] = await conn.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );
    const user = users[0];
    const walletBal = parseFloat(user.wallet_balance);
    const winBal    = parseFloat(user.winning_balance);
    const totalBal  = walletBal + winBal;

    if (totalBal < totalAmount) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${totalBal.toFixed(2)}, Required: ₹${totalAmount.toFixed(2)}`
      });
    }

    let walletDeducted = 0, winDeducted = 0;
    if (walletBal >= totalAmount) {
      walletDeducted = totalAmount;
    } else {
      walletDeducted = walletBal;
      winDeducted    = totalAmount - walletBal;
    }

    await conn.query(
      'UPDATE users SET wallet_balance = wallet_balance - ?, winning_balance = winning_balance - ? WHERE id = ?',
      [walletDeducted, winDeducted, req.user.id]
    );

    const payout = GAME_TYPES[game_type].payout;
    const categoryLabel = game.game_category === 'starline' ? '⭐ Starline' :
                          game.game_category === 'disawar'  ? '🎰 Disawar'  : '';

    const placeholders = bids.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CONVERT_TZ(NOW(), '+00:00', '+05:30'))`).join(',');
    const values = bids.flatMap(bid => {
      const a = parseFloat(bid.amt);
      return [req.user.id, game_id, game_type, session, bid.num, a, a * payout, 0, 0];
    });

    await conn.query(
      `INSERT INTO bids (user_id, game_id, game_type, session, number, amount, potential_winning, wallet_deducted, winning_deducted, status, created_at) VALUES ${placeholders}`,
      values
    );

    await conn.query(
      `INSERT INTO transactions (user_id, type, wallet_type, amount, description, status)
       VALUES (?, 'debit', 'wallet', ?, ?, 'completed')`,
      [req.user.id, totalAmount, `Bulk Bid: ${categoryLabel} ${game.name} | ${GAME_TYPES[game_type].name} | ${bids.length} bets`]
    );

    await conn.commit();

    const [updatedUser] = await db.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ?',
      [req.user.id]
    );

    res.status(201).json({
      success: true,
      message: `${bids.length} bids placed successfully!`,
      total_amount: totalAmount,
      bids_placed: bids.length,
      new_balance: {
        wallet_balance:  parseFloat(updatedUser[0].wallet_balance),
        winning_balance: parseFloat(updatedUser[0].winning_balance)
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('Bulk bid error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ─── MY BIDS ──────────────────────────────────────────────────────────────────
router.get('/bids/my', authMiddleware, async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 500;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;

    let query = `
      SELECT b.id, b.game_type, b.session, b.number, b.amount, b.potential_winning,
             b.status, b.win_amount, b.created_at,
             g.name as game_name, g.game_category,
             g.open_result, g.close_result, g.jodi_result
      FROM bids b
      JOIN games g ON b.game_id = g.id
      WHERE b.user_id = ?`;
    const params = [req.user.id];

    if (status) { query += ' AND b.status = ?'; params.push(status); }

    query += ' ORDER BY b.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [bids] = await db.query(query, params);

    const [count] = await db.query(
      'SELECT COUNT(*) as total FROM bids WHERE user_id = ?' + (status ? ' AND status = ?' : ''),
      status ? [req.user.id, status] : [req.user.id]
    );

    const [stats] = await db.query(
      `SELECT
        COUNT(id) as total_bids,
        SUM(CASE WHEN status = 'win' THEN 1 ELSE 0 END) as won_bids,
        SUM(CASE WHEN status = 'loss' THEN 1 ELSE 0 END) as lost_bids,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bids,
        SUM(CASE WHEN status = 'win' THEN win_amount ELSE 0 END) as total_win_amount
       FROM bids WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      bids,
      summary: stats[0] || {},
      pagination: { page, limit, total: count[0].total, pages: Math.ceil(count[0].total / limit) }
    });
  } catch (err) {
    console.error('My bids error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── PAST RESULTS ─────────────────────────────────────────────────────────────
router.get('/results/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await db.query(
      `SELECT id, name, game_category, open_result, close_result, jodi_result, result_declared_at
       FROM games WHERE jodi_result IS NOT NULL
       ORDER BY result_declared_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ success: true, results: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET SINGLE GAME ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM games WHERE id = ? AND status != "deleted"',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, game: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GAME RESULTS ─────────────────────────────────────────────────────────────
router.get('/:id/results', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.id, g.name, g.game_category, g.open_result, g.close_result, g.jodi_result,
              g.result_declared_at, g.open_time, g.close_time
       FROM games g WHERE g.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, result: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
