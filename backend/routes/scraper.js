const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

// ─── Result string parser ─────────────────────────────────────────────────────
function parseResult(str) {
  const clean = (str || '').replace(/\s/g, '');
  const parts = clean.split('-');
  if (parts.length === 3) {
    return { open_result: parts[0], jodi_result: parts[1], close_result: parts[2] };
  } else if (parts.length === 2) {
    return { open_result: parts[0], jodi_result: parts[1], close_result: null };
  }
  return null;
}

// ─── Scrape dpbossss.boston ───────────────────────────────────────────────────
async function scrapeDpboss() {
  const { data: html } = await axios.get('https://dpbossss.boston', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
    },
    timeout: 15000
  });

  const $       = cheerio.load(html);
  const results = [];

  // dpboss site mein game name bold/heading hota hai, result uske neeche
  // Har game block ko dhundo — game name text hai jo TIME nahi hai
  const timeRegex  = /^\d{1,2}:\d{2}/;         // "10:30 am" jaisa
  const resultRegex = /\d{3}-\d{1,2}/;          // "247-30" ya "247-30-226" jaisa
  const hindiRegex  = /[\u0900-\u097F]/;         // Hindi characters

  $('table').each((ti, table) => {
    $(table).find('tr').each((ri, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      // Pehla cell: game name
      // Doosra/teesra cell: result
      let gameName = '';
      let result   = '';

      // Try: center cell mein game name hota hai dpboss layout mein
      if (cells.length >= 3) {
        gameName = $(cells[1]).text().trim();
        result   = $(cells[1]).find('font, b, strong').first().text().trim() ||
                   $(cells[2]).text().trim();
      } else {
        gameName = $(cells[0]).text().trim();
        result   = $(cells[1]).text().trim();
      }

      // Skip: time format, Hindi text, empty, numbers only
      if (!gameName) return;
      if (timeRegex.test(gameName)) return;
      if (hindiRegex.test(gameName)) return;
      if (/^\d+$/.test(gameName)) return;
      if (gameName.length < 3) return;

      // Result valid hai?
      if (!resultRegex.test(result)) return;

      results.push({
        gameName: gameName.toLowerCase().replace(/\[.*?\]/g, '').trim(),
        result:   result.trim()
      });
    });
  });

  // Deduplicate
  const seen = new Set();
  return results.filter(r => {
    const key = r.gameName;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Fuzzy name match ─────────────────────────────────────────────────────────
function isMatch(dbName, scrapedName) {
  const a = dbName.toLowerCase().trim().replace(/\s+/g, ' ');
  const b = scrapedName.toLowerCase().trim().replace(/\s+/g, ' ');
  return a === b || a.includes(b) || b.includes(a);
}

// ─── GET /api/scraper/preview ─────────────────────────────────────────────────
router.get('/preview', async (req, res) => {
  try {
    const scraped = await scrapeDpboss();
    res.json({ success: true, total: scraped.length, data: scraped });
  } catch (err) {
    console.error('Preview error:', err.message);
    res.status(500).json({ success: false, message: 'Scrape failed: ' + err.message });
  }
});

// ─── GET /api/scraper/sync ────────────────────────────────────────────────────
router.get('/sync', async (req, res) => {
  try {
    const scraped = await scrapeDpboss();

    if (!scraped.length) {
      return res.json({
        success: false,
        message: 'Kuch scrape nahi hua — /api/scraper/preview se check karo'
      });
    }

    const [dbGames] = await db.query(
      "SELECT id, name FROM games WHERE status != 'deleted'"
    );

    let updated = 0;
    const matched   = [];
    const unmatched = [];

    for (const item of scraped) {
      const parsed = parseResult(item.result);
      if (!parsed) { unmatched.push(item); continue; }

      const dbGame = dbGames.find(g => isMatch(g.name, item.gameName));

      if (dbGame) {
        await db.query(
          `UPDATE games SET
            open_result  = COALESCE(?, open_result),
            jodi_result  = COALESCE(?, jodi_result),
            close_result = COALESCE(?, close_result),
            result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
           WHERE id = ?`,
          [parsed.open_result, parsed.jodi_result, parsed.close_result, dbGame.id]
        );
        updated++;
        matched.push({ db_game: dbGame.name, scraped: item.gameName, result: item.result });
      } else {
        unmatched.push(item);
      }
    }

    res.json({
      success: true,
      message: `✅ ${updated} games updated`,
      total_scraped: scraped.length,
      matched,
      unmatched
    });

  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ success: false, message: 'Sync failed: ' + err.message });
  }
});

module.exports = router;
