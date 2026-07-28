const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

// ── IST helpers ───────────────────────────────────────────────────────────────
function getISTDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split('T')[0]; // "2024-07-28"
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
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec wait
    try {
      const response = await fetchSite();
      html = response.data;
    } catch (err2) {
      console.log('❌ Scraper Error (Attempt 2):', err2.message);
      return []; // Agar dobara fail hua toh khali return
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
      if (nextNode.nodeType === 3) { // text node
        const t = nextNode.data.trim().replace(/\s/g, '');
        if (/\d/.test(t)) { resultText = t; break; }
      }
      nextNode = nextNode.nextSibling;
    }

    if (!resultText) {
      const nextEl = $el.next();
      resultText = nextEl.text().trim().replace(/\s/g, '');
    }

    // ✅ FIX 1: Agar site par Loading ya Wait likha hai, toh usko skip karo
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

// ── BID SETTLEMENT LOGIC (Result aane par user ko payment do) ───────────────
async function settleGameBids(gameId, openRes, closeRes) {
  try {
    const [bids] = await db.query('SELECT * FROM bids WHERE game_id = ? AND status = "pending"', [gameId]);
    if (!bids.length) return;

    let openDigit = null, closeDigit = null, jodi = null;
    if (openRes) openDigit = String(openRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
    if (closeRes) closeDigit = String(closeRes).split('').reduce((s, d) => s + parseInt(d), 0) % 10;
    if (openDigit !== null && closeDigit !== null) jodi = `${openDigit}${closeDigit}`;

    for (const bid of bids) {
      let isWin = false;
      const num = String(bid.number).trim();
      const type = bid.game_type;

      if (bid.session === 'open' && openRes) {
        if (type.includes('digit') && !type.includes('jodi') && !type.includes('sangam') && !type.includes('bulk')) {
          if (num == openDigit) isWin = true;
        } else if (type.includes('pana') || type.includes('motor') || type.includes('jackpot') || type.includes('common') || type.includes('group')) {
          if (num == openRes) isWin = true;
        }
      } 
      else if (bid.session === 'close' && closeRes) {
        if (type.includes('digit') && !type.includes('jodi') && !type.includes('sangam') && !type.includes('bulk')) {
          if (num == closeDigit) isWin = true;
        } else if (type.includes('pana') || type.includes('motor') || type.includes('jackpot') || type.includes('common') || type.includes('group')) {
          if (num == closeRes) isWin = true;
        }
      }

      if (type.includes('jodi') && jodi) {
        if (num == jodi) isWin = true;
      }
      if (type === 'half_sangam_a' && openRes && closeDigit !== null) {
        if (num == `${openRes}${closeDigit}`) isWin = true;
      }
      if (type === 'half_sangam_b' && openDigit !== null && closeRes) {
        if (num == `${openDigit}${closeRes}`) isWin = true;
      }
      if ((type === 'full_sangam' || type.includes('sangam')) && openRes && closeRes) {
        if (num == `${openRes}${closeRes}`) isWin = true;
      }

      if (isWin) {
        const winAmt = parseFloat(bid.potential_winning);
        await db.query('UPDATE bids SET status = "win", win_amount = ? WHERE id = ?', [winAmt, bid.id]);
        await db.query('UPDATE users SET winning_balance = winning_balance + ? WHERE id = ?', [winAmt, bid.user_id]);
        await db.query(
          `INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id, status) VALUES (?, 'credit', 'winning', ?, ?, ?, 'completed')`,
          [bid.user_id, winAmt, `Win: Game ID ${gameId} | ${type} | ${num}`, bid.id]
        );
      } else {
        let canMarkLoss = false;
        if (bid.session === 'open' && openRes) canMarkLoss = true;
        if (bid.session === 'close' && closeRes) canMarkLoss = true;
        if (type.includes('jodi') && jodi) canMarkLoss = true;
        if (type.includes('sangam') && openRes && closeRes) canMarkLoss = true;

        if (canMarkLoss) {
          await db.query('UPDATE bids SET status = "loss" WHERE id = ?', [bid.id]);
        }
      }
    }
  } catch (err) {
    console.error('Settle Bids Error:', err.message);
  }
}

// ── MAIN SYNC FUNCTION ───────────────────────────────────────────────────────
async function syncResults() {
  const games = await scrapeAllGames();
  if (!games.length) return { success: false, message: 'Kuch scrape nahi hua' };

  const todayDate  = getISTDate();
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

    // ── TUMHARA LOGIC: Purana Data Block ──────────────────────────────────────
    if (item.is_complete) {
      // Site par Open + Close dono sath mein aaye hain (e.g., 469-99-667)
      if (!closeTimePassed) {
        // Agar close time nahi hua, toh ye kal ka purana data hai. SKIP KARO!
        skipped++;
        continue;
      }
      // Agar close time ho gaya hai, toh close result update karo (agar DB se alag hai)
      if (dbGame.close_result !== item.close_result) {
        updateClose = true;
        updateOpen = true;
      }
    } else {
      // Site par sirf Open aaya hai (e.g., 469-9)
      if (openTimePassed) {
        // Open time ho gaya hai, toh open result update karo (agar DB se alag hai)
        if (dbGame.open_result !== item.open_result) {
          updateOpen = true;
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    if (!updateOpen && !updateClose) { skipped++; continue; }

    if (updateOpen) {
      await db.query(
        `UPDATE games SET 
          open_result = ?, 
          jodi_result = ?, 
          result_date = CURDATE(), 
          result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') 
         WHERE id = ?`,
        [item.open_result, item.jodi_result, dbGame.id]
      );
    }
    
    if (updateClose) {
      await db.query(
        `UPDATE games SET 
          close_result = ?, 
          jodi_result = ?, 
          result_date = CURDATE(), 
          result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30') 
         WHERE id = ?`,
        [item.close_result, item.jodi_result, dbGame.id]
      );
    }

    // ✅ YAHAN BID SETTLE FUNCTION CALL HOGA
    // Result update hote hi turant users ke bids check honge aur payment milegi
    await settleGameBids(
      dbGame.id, 
      item.open_result || dbGame.open_result, 
      item.close_result || dbGame.close_result
    );

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
