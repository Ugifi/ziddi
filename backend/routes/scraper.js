const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

// ── IST helpers ───────────────────────────────────────────────────────────────
function getISTDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  
  // ✅ 2 AM Reset Logic: Agar time raat 2 baje se pehle hai, toh pichli date manni hai
  if (ist.getUTCHours() < 2) {
    ist.setUTCDate(ist.getUTCDate() - 1);
  }
  return ist.toISOString().split('T')[0];
}

function getCurrentISTMinutes() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// ── Main page se sab games scrape karo ───────────────────────────────────────
async function scrapeAllGames() {
  const fetchSite = async () => {
    return await axios.get('https://dpbossss.boston', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 20000
    });
  };

  let html;
  try {
    const response = await fetchSite();
    html = response.data;
  } catch (err1) {
    console.log('⚠️ Scraper Error (Attempt 1):', err1.message, '| Retrying in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const response = await fetchSite();
      html = response.data;
    } catch (err2) {
      console.log('❌ Scraper Error (Attempt 2):', err2.message);
      return [];
    }
  }

  const $ = cheerio.load(html);
  const games = [];

  $('h4').each((i, el) => {
    const $el = $(el);
    const gameName = $el.text().trim().toUpperCase()
      .replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

    if (!gameName || gameName.length < 2) return;

    let resultText = '';
    let nextNode = el.nextSibling;
    while (nextNode) {
      if (nextNode.nodeType === 3) {
        const t = nextNode.data.trim().replace(/\s/g, '');
        if (/\d/.test(t)) { resultText = t; break; }
      }
      nextNode = nextNode.nextSibling;
    }

    if (!resultText) {
      const nextEl = $el.next();
      resultText = nextEl.text().trim().replace(/\s/g, '');
    }

    if (resultText.toLowerCase().includes('loading') || resultText.toLowerCase().includes('wait')) {
      return; 
    }

    const fullMatch  = resultText.match(/^(\d{3})-(\d{2})-(\d{3})$/);
    const openOnly   = resultText.match(/^(\d{3})-(\d{1,2})$/);

    if (fullMatch) {
      games.push({
        gameName, result: resultText,
        open_result: fullMatch[1], jodi_result: fullMatch[2], close_result: fullMatch[3],
        is_complete: true
      });
    } else if (openOnly) {
      games.push({
        gameName, result: resultText,
        open_result: openOnly[1], jodi_result: null, close_result: null,
        is_complete: false
      });
    }
  });

  return games;
}

// ── Name matching ─────────────────────────────────────────────────────────────
function isExactMatch(dbName, scrapedName) {
  const a = dbName.toLowerCase().trim().replace(/\s+/g, ' ');
  const b = scrapedName.toLowerCase().trim().replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
  return a === b;
}

// ── GET /api/scraper/preview ──────────────────────────────────────────────────
router.get('/preview', async (req, res) => {
  try {
    const games = await scrapeAllGames();
    res.json({ success: true, total: games.length, date: getISTDate(), data: games });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/scraper/sync ─────────────────────────────────────────────────────
router.get('/sync', async (req, res) => {
  try {
    const result = await syncResults();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PAYOUT MAP ────────────────────────────────────────────────────────────────
const PAYOUTS = {
  'single_digit': 9.5, 'single_digit_bulk': 9.5, 'red_bracket': 9.5, 'common_digit': 9.5, 'gunule': 9.5,
  'jodi': 95, 'jodi_bulk': 95, 'red_jodi': 95, 'cycle_jodi': 95, 'digit_jodi': 95, 'family_jodi': 95,
  'single_pana': 150, 'single_pana_bulk': 150, 'sp_motor': 150, 'sp_common': 150, 'panel_group': 150, 'cycle_pana': 150,
  'double_pana': 300, 'double_pana_bulk': 300, 'dp_motor': 300, 'dp_common': 300,
  'triple_pana': 700, 'tp_motor': 700, 'jackpot': 9000,
  'half_sangam_a': 1000, 'half_sangam_b': 1000,
  'full_sangam': 10000, 'choice_sangam': 10000,
  'odd_even': 2, 'two_digit_pana': 300
};

// ── BID SETTLEMENT LOGIC ─────────────────────────────────────────────────────
async function settleGameBids(gameId, openRes, closeRes) {
  try {
    const [bids] = await db.query('SELECT * FROM bids WHERE game_id = ? AND (status IS NULL OR status = "" OR status = "pending")', [gameId]);  
    if (!bids.length) return;

    let openDigit = null, closeDigit = null, jodi = null;
    if (openRes) openDigit = String(openRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
    if (closeRes) closeDigit = String(closeRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
    if (openDigit !== null && closeDigit !== null) jodi = `${openDigit}${closeDigit}`;

    for (const bid of bids) {
      try {
        let isWin = false;
        let canSettle = false; 
        
        const num = String(bid.number).trim();
        const type = bid.game_type;
        const isJodiOrSangam = type.includes('jodi') || type.includes('sangam') || type === 'two_digit_pana';

        if (isJodiOrSangam) {
          if (openRes && closeRes) canSettle = true;
        } else {
          if (bid.session === 'open' && openRes) canSettle = true;
          if (bid.session === 'close' && closeRes) canSettle = true;
        }

        if (!canSettle) continue;

        if (bid.session === 'open' && openRes && !isJodiOrSangam) {
          if (['single_digit', 'single_digit_bulk', 'red_bracket', 'common_digit', 'gunule'].includes(type)) {
            if (num == openDigit) isWin = true;
          } else if (['single_pana', 'double_pana', 'triple_pana', 'single_pana_bulk', 'double_pana_bulk', 'sp_motor', 'dp_motor', 'tp_motor', 'jackpot', 'sp_common', 'dp_common', 'sp_dp_tp', 'panel_group', 'cycle_pana'].includes(type)) {
            if (num == openRes) isWin = true;
          } else if (type === 'odd_even') {
            if ((openDigit % 2 === 0 && num === 'EVEN') || (openDigit % 2 !== 0 && num === 'ODD')) isWin = true;
          }
        } 
        else if (bid.session === 'close' && closeRes && !isJodiOrSangam) {
          if (['single_digit', 'single_digit_bulk', 'red_bracket', 'common_digit', 'gunule'].includes(type)) {
            if (num == closeDigit) isWin = true;
          } else if (['single_pana', 'double_pana', 'triple_pana', 'single_pana_bulk', 'double_pana_bulk', 'sp_motor', 'dp_motor', 'tp_motor', 'jackpot', 'sp_common', 'dp_common', 'sp_dp_tp', 'panel_group', 'cycle_pana'].includes(type)) {
            if (num == closeRes) isWin = true;
          } else if (type === 'odd_even') {
            if ((closeDigit % 2 === 0 && num === 'EVEN') || (closeDigit % 2 !== 0 && num === 'ODD')) isWin = true;
          }
        }
        else if (isJodiOrSangam && openRes && closeRes) {
          if (['jodi', 'jodi_bulk', 'red_jodi', 'cycle_jodi', 'digit_jodi'].includes(type) && jodi) {
            if (num == jodi) isWin = true;
          }
          if (type === 'half_sangam_a') {
            if (num === `${openDigit}-${closeRes}`) isWin = true; 
          }
          if (type === 'half_sangam_b') {
            if (num === `${openRes}-${closeDigit}`) isWin = true; 
          }
          if (type === 'full_sangam') {
            if (num === `${openRes}-${closeRes}`) isWin = true;
          }
          if (type === 'two_digit_pana') {
            if (num === `${jodi}|${closeRes}`) isWin = true;
          }
        }

        if (isWin) {
          const payout = PAYOUTS[type] || 1;
          const winAmt = parseFloat(bid.amount) * payout; 
          
          await db.query('UPDATE bids SET status = "win", win_amount = ? WHERE id = ?', [winAmt, bid.id]);
          await db.query('UPDATE users SET winning_balance = winning_balance + ? WHERE id = ?', [winAmt, bid.user_id]);
          await db.query(
            `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status) VALUES (?, 'credit', 'winning_wallet', ?, ?, ?, 'completed')`,
            [bid.user_id, winAmt, `Win: Game ID ${gameId} | ${type} | ${num}`, bid.id]
          );
        } else {
          await db.query('UPDATE bids SET status = "loss" WHERE id = ?', [bid.id]);
        }
      } catch (bidErr) {
        console.error(`❌ Error settling bid ID ${bid.id}:`, bidErr.message);
      }
    }
  } catch (err) {
    console.error('Settle Bids Fetch Error:', err.message);
  }
}

// ── FORCE SETTLE ROUTE ───────────────────────────────────────────────────────
router.get('/force-settle', async (req, res) => {
  try {
    const [games] = await db.query("SELECT id, open_result, close_result FROM games WHERE open_result IS NOT NULL OR close_result IS NOT NULL");
    let settledCount = 0;
    for (const g of games) {
      if (g.open_result || g.close_result) {
        await settleGameBids(g.id, g.open_result, g.close_result);
        settledCount++;
      }
    }
    res.json({ success: true, message: `Force Settle complete! ${settledCount} games processed. Saare bids settle ho gaye.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── MAIN SYNC FUNCTION ───────────────────────────────────────────────────────
async function syncResults() {
  const games = await scrapeAllGames();
  if (!games.length) return { success: false, message: 'Kuch scrape nahi hua' };

  const todayDate  = getISTDate(); // 2 AM wali date function
  const nowMinutes = getCurrentISTMinutes();

  const [dbGames] = await db.query(
    `SELECT id, name, open_time, close_time, open_result, close_result, result_date
     FROM games 
     WHERE status != 'deleted'`
  );

  let updated = 0, skipped = 0;
  const log = [];

  for (const item of games) {
    const dbGame = dbGames.find(g => isExactMatch(g.name, item.gameName));
    if (!dbGame) continue;

    const openMin  = timeToMinutes(dbGame.open_time);
    const closeMin = timeToMinutes(dbGame.close_time);

    const openTimePassed = !openMin || nowMinutes >= openMin;
    const closeTimePassed = !closeMin || nowMinutes >= closeMin;

    let updateOpen = false;
    let updateClose = false;

    // ── TUMHARA STRICT RULE YAHAN HAI ──────────────────────────────────────
    if (item.is_complete) {
      // Site par dono (Open+Close) sath aaye hain (e.g., 469-99-667)
      if (!closeTimePassed) {
        // Agar close time nahi hua, toh ye purana data hai. SKIP KARO!
        skipped++;
        continue;
      }
      // Agar close time ho gaya hai, toh dono update karo (agar DB se alag hai)
      if (dbGame.close_result !== item.close_result) {
        updateClose = true;
        updateOpen = true; 
      }
    } else {
      // Site par sirf Open aaya hai (e.g., 469-9)
      if (openTimePassed && dbGame.open_result !== item.open_result) {
        updateOpen = true;
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    if (!updateOpen && !updateClose) {
      const [pendingBids] = await db.query(
        'SELECT COUNT(*) as cnt FROM bids WHERE game_id = ? AND (status IS NULL OR status = "" OR status = "pending")',
        [dbGame.id]
      );
      if (pendingBids[0].cnt > 0) {
        await settleGameBids(dbGame.id, dbGame.open_result, dbGame.close_result);
      }
      skipped++;
      continue;
    }

    if (updateOpen) {
      await db.query(
        `UPDATE games SET 
          open_result = ?, 
          jodi_result = COALESCE(?, jodi_result), 
          result_date = ?, 
          result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') 
         WHERE id = ?`,
        [item.open_result, item.jodi_result, todayDate, dbGame.id] // 2 AM wali date save hogi
      );
    }
    
    if (updateClose) {
      await db.query(
        `UPDATE games SET 
          close_result = ?, 
          jodi_result = COALESCE(?, jodi_result), 
          result_date = ?, 
          result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') 
         WHERE id = ?`,
        [item.close_result, item.jodi_result, todayDate, dbGame.id]
      );
    }

    const finalOpenRes = updateOpen ? item.open_result : dbGame.open_result;
    const finalCloseRes = updateClose ? item.close_result : dbGame.close_result;
    
    await settleGameBids(dbGame.id, finalOpenRes, finalCloseRes);

    updated++;
    log.push({ game: dbGame.name, result: item.result });
  }

  return {
    success:   true,
    message:   `${updated} games updated`,
    ist_date:  todayDate,
    ist_time:  `${Math.floor(nowMinutes/60)}:${String(nowMinutes%60).padStart(2,'0')}`,
    updated,
    skipped,
    log
  };
}

module.exports = router;
module.exports.scrapeAllGames = scrapeAllGames;
module.exports.syncResults    = syncResults;
