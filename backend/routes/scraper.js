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

async function scrapeGame(slug) {
  try {
    const url = `${BASE}/${slug}.php`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36' },
      timeout: 10000
    });

    const $ = cheerio.load(html);

    // Aaj ki date
    const now      = new Date();
    const day      = String(now.getDate()).padStart(2, '0');
    const month    = String(now.getMonth() + 1).padStart(2, '0');
    const year     = now.getFullYear();
    const todayStr = `${day}/${month}/${year}`; // "27/07/2026"

    let result = null;

    // Table mein aaj ki date wali row dhundo
    $('table tr').each((i, row) => {
      const rowText = $(row).text().replace(/\s+/g, ' ').trim();
      if (!rowText.includes(todayStr)) return;

      let jodi  = '';
      let panas = [];

      $(row).find('td').each((j, td) => {
        const t = $(td).text().trim();

        // Jodi = exactly 2 digits, red/bold
        if (/^\d{2}$/.test(t) && !jodi) {
          const isRed = $(td).find('font[color], b').length > 0 ||
                        $(td).css('color') === 'red';
          if (isRed) jodi = t;
        }

        // Pana = exactly 3 digits
        if (/^\d{3}$/.test(t)) panas.push(t);
      });

      if (panas.length >= 2 && jodi) {
        result = `${panas[0]}-${jodi}-${panas[1]}`;
      } else if (panas.length === 1 && jodi) {
        result = `${panas[0]}-${jodi}`;
      } else if (jodi) {
        result = jodi;
      }

      return false; // break
    });

    return result; // null agar aaj ka result nahi mila

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

      // Result nahi mila toh skip — DB touch mat karo
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
