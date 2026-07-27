const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

const BASE = 'https://dpbossss.boston/panel-chart-record';

const GAME_SLUGS = {
  'karnataka day':  'karnataka-day',
  'milan morning':  'milan-morning',
  'sridevi':        'sridevi',
  'time bazar':     'time-bazar',
  'madhur day':     'madhur-day',
  'rajdhani day':   'rajdhani-day',
  'milan day':      'milan-day',
  'supreme day':    'supreme-day',
  'kalyan':         'kalyan',
};

function parseResult(str) {
  const clean = (str || '').replace(/\s/g, '');
  const parts = clean.split('-');
  if (parts.length === 3) return { open_result: parts[0], jodi_result: parts[1], close_result: parts[2] };
  if (parts.length === 2) return { open_result: parts[0], jodi_result: parts[1], close_result: null };
  return null;
}

// Today's date check — DD/MM/YYYY ya D/M/YYYY format
function isTodayRow(dateText) {
  const now = new Date();
  const day   = now.getDate();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  // e.g. "27/07/2026"
  const pattern = new RegExp(`\\b${day}[/.-]0?${month}[/.-]${year}\\b`);
  return pattern.test(dateText);
}

async function scrapeGame(slug) {
  try {
    const url = `${BASE}/${slug}.php`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36' },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    let result = null;

    // ── Strategy 1: Bottom result box (agar aaj ka declare hua ho) ──
    // dpboss pe game name ke neeche result hota hai page ke bottom mein
    let bottomResult = '';
    $('font, b, strong, h2, h3, p, div, td').each((i, el) => {
      const text = $(el).text().trim();
      if (/^\d{3}-\d{2}-\d{3}$/.test(text) || /^\d{3}-\d{1,2}$/.test(text)) {
        bottomResult = text;
        return false;
      }
    });

    // ── Strategy 2: Table mein aaj ki date wali row dhundo ──
    let tableResult = '';
    $('table tr').each((i, row) => {
      const rowText = $(row).text();

      // Aaj ki date is row mein hai?
      if (isTodayRow(rowText)) {
        // Is row ya next rows mein jodi/result dhundo (bold red number)
        const jodiEl = $(row).find('b, font[color="red"], strong');
        jodiEl.each((j, el) => {
          const t = $(el).text().trim();
          if (/^\d{2}$/.test(t)) { // jodi = 2 digit
            tableResult = t;
            return false;
          }
        });

        // Pana bhi dhundo
        const cells = $(row).find('td');
        let panas = [];
        cells.each((j, td) => {
          const t = $(td).text().trim();
          if (/^\d{3}$/.test(t)) panas.push(t);
        });

        if (panas.length >= 2 && tableResult) {
          tableResult = `${panas[0]}-${tableResult}-${panas[1]}`;
        } else if (panas.length >= 1 && tableResult) {
          tableResult = `${panas[0]}-${tableResult}`;
        }
        return false;
      }
    });

    // ── Priority: bottom result > table result ──
    // Bottom result = aaj ka live declared result
    // Table result = aaj ki row se
    result = bottomResult || tableResult || null;

    // ── Agar result nahi mila toh null return karo ──
    return result;

  } catch (e) {
    console.log(`❌ Scrape failed for ${slug}:`, e.message);
    return null;
  }
}

// ─── GET /api/scraper/preview ─────────────────────────────────────────────────
router.get('/preview', async (req, res) => {
  try {
    const results = [];
    for (const [gameName, slug] of Object.entries(GAME_SLUGS)) {
      const result = await scrapeGame(slug);
      results.push({ gameName, slug, result });
    }
    res.json({ success: true, total: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/scraper/sync ────────────────────────────────────────────────────
router.get('/sync', async (req, res) => {
  try {
    const [dbGames] = await db.query("SELECT id, name FROM games WHERE status != 'deleted'");

    let updated = 0;
    const matched   = [];
    const unmatched = [];

    for (const dbGame of dbGames) {
      const dbNameLower = dbGame.name.toLowerCase().trim();
      const slug = GAME_SLUGS[dbNameLower];

      if (!slug) {
        unmatched.push({ db_game: dbGame.name, reason: 'No slug mapping' });
        continue;
      }

      const result = await scrapeGame(slug);

      // ✅ Result nahi mila toh skip karo — DB touch mat karo
      if (!result) {
        unmatched.push({ db_game: dbGame.name, slug, reason: 'No result declared yet' });
        continue;
      }

      const parsed = parseResult(result);
      if (!parsed) {
        unmatched.push({ db_game: dbGame.name, result, reason: 'Parse failed' });
        continue;
      }

      await db.query(
        `UPDATE games SET
          open_result  = ?,
          jodi_result  = ?,
          close_result = ?,
          result_declared_at = CONVERT_TZ(NOW(), '+00:00', '+05:30')
         WHERE id = ?`,
        [parsed.open_result, parsed.jodi_result, parsed.close_result, dbGame.id]
      );

      updated++;
      matched.push({ db_game: dbGame.name, slug, result, parsed });
    }

    res.json({
      success: true,
      message: `✅ ${updated} games updated`,
      matched,
      unmatched
    });

  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ success: false, message: 'Sync failed: ' + err.message });
  }
});

module.exports = router;
