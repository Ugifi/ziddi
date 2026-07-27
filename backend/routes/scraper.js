const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

// ─── Result string parser ─────────────────────────────────────────────────────
// "247-30-226" → open=247, jodi=30, close=226
// "257-4"      → open=257, jodi=4,  close=null
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

  // Try multiple selectors — site structure ke hisaab se
  $('table tr').each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const gameName = $(cells[0]).text().trim().toLowerCase().replace(/\[.*?\]/g, '').trim();
      const result   = $(cells[1]).text().trim();
      if (gameName && result && result !== '-' && result !== '**') {
        results.push({ gameName, result });
      }
    }
  });

  // Fallback: div/span based layout
  if (!results.length) {
    $('.game-name, .market-name').each((i, el) => {
      const gameName = $(el).text().trim().toLowerCase();
      const result   = $(el).next().text().trim();
      if (gameName && result) results.push({ gameName, result });
    });
  }

  return results;
}

// ─── Fuzzy name match ─────────────────────────────────────────────────────────
function isMatch(dbName, scrapedName) {
  const a = dbName.toLowerCase().trim().replace(/\s+/g, ' ');
  const b = scrapedName.toLowerCase().trim().replace(/\s+/g, ' ').replace(/\[.*?\]/g, '').trim();
  return a === b || a.includes(b) || b.includes(a);
}

// ─── GET /api/scraper/preview ─────────────────────────────────────────────────
// Sirf dekho kya scrape ho raha hai — DB touch nahi hoga
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
// Scrape karo + apne DB games update karo
router.get('/sync', async (req, res) => {
  try {
    const scraped = await scrapeDpboss();

    if (!scraped.length) {
      return res.json({
        success: false,
        message: 'Kuch scrape nahi hua — /api/scraper/preview se site structure check karo'
      });
    }

    // DB ke saare active games lo
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
        matched.push({
          db_game:  dbGame.name,
          scraped:  item.gameName,
          result:   item.result,
          parsed
        });
      } else {
        unmatched.push(item);
      }
    }

    res.json({
      success:        true,
      message:        `✅ ${updated} games updated`,
      total_scraped:  scraped.length,
      matched,
      unmatched // yeh dekh ke DB game names adjust karo
    });

  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ success: false, message: 'Sync failed: ' + err.message });
  }
});

module.exports = router;