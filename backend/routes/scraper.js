const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

// ── IST helpers ───────────────────────────────────────────────────────────────
function getISTDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split('T')[0]; // "2024-07-27"
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
  const { data: html } = await axios.get('https://dpbossss.boston', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
      'Cache-Control': 'no-cache',
    },
    timeout: 15000
  });

  const $ = cheerio.load(html);
  const games = [];

  // h4 tags mein game names + results hain
  $('h4').each((i, el) => {
    const $el = $(el);
    const gameName = $el.text().trim().toUpperCase()
      .replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

    if (!gameName || gameName.length < 2) return;

    // Next sibling text (result line)
    let resultText = '';
    let nextNode = el.nextSibling;
    while (nextNode) {
      if (nextNode.nodeType === 3) { // text node
        const t = nextNode.data.trim().replace(/\s/g, '');
        if (/\d/.test(t)) { resultText = t; break; }
      }
      nextNode = nextNode.nextSibling;
    }

    // Agar text node se nahi mila toh next element dekho
    if (!resultText) {
      const nextEl = $el.next();
      resultText = nextEl.text().trim().replace(/\s/g, '');
    }

    // Pattern: 469-99-667 ya 200-2 ya 469-9 (partial)
    const fullMatch  = resultText.match(/^(\d{3})-(\d{2})-(\d{3})$/);
    const openOnly   = resultText.match(/^(\d{3})-(\d{1,2})$/);

    if (fullMatch) {
      games.push({
        gameName,
        result: resultText,
        open_result:  fullMatch[1],
        jodi_result:  fullMatch[2],
        close_result: fullMatch[3],
        is_complete:  true
      });
    } else if (openOnly) {
      games.push({
        gameName,
        result: resultText,
        open_result:  openOnly[1],
        jodi_result:  null,
        close_result: null,
        is_complete:  false
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

// ── MAIN SYNC FUNCTION (scheduler bhi use karega) ────────────────────────────
async function syncResults() {
  const games = await scrapeAllGames();
  if (!games.length) return { success: false, message: 'Kuch scrape nahi hua' };

  const todayDate  = getISTDate();
  const nowMinutes = getCurrentISTMinutes();

  const [dbGames] = await db.query(
    `SELECT id, name, open_time, close_time, open_result, close_result, result_date
     FROM games 
     WHERE status != 'deleted' AND (result_date = ? OR result_date IS NULL)`,
    [todayDate]
  );

  let updated = 0, skipped = 0;
  const log = [];

  for (const item of games) {
    const dbGame = dbGames.find(g => isExactMatch(g.name, item.gameName));
    if (!dbGame) continue;

    // ── TIME-BASED UPDATE LOGIC ────────────────────────────────────────────
    const openMin  = timeToMinutes(dbGame.open_time);
    const closeMin = timeToMinutes(dbGame.close_time);

    // Open result tabhi update karo jab open_time guzar chuka ho
    const openAllowed = !openMin || nowMinutes >= openMin;
    // Close result tabhi update karo jab close_time guzar chuka ho
    const closeAllowed = !closeMin || nowMinutes >= closeMin;

    const openChanged  = openAllowed && !dbGame.open_result  && item.open_result;
    const closeChanged = closeAllowed && !dbGame.close_result && item.close_result;
    
    if (!openChanged && !closeChanged) { skipped++; continue; }

    // ✅ FIX: Yaha result_date = CURDATE() add kiya hai 12 AM Reset ke liye
    await db.query(
      `UPDATE games SET
        open_result        = COALESCE(open_result, ?),
        jodi_result        = COALESCE(jodi_result, ?),
        close_result       = COALESCE(close_result, ?),
        result_date        = CURDATE(),
        result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
       WHERE id = ?`,
      [item.open_result, item.jodi_result, item.close_result, dbGame.id]
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
