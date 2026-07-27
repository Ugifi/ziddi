const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../config/db');

const BASE = 'https://dpbossss.boston/panel-chart-record';

const GAME_SLUGS = {
  'kalyan':             'kalyan',
  'kalyan morning':     'kalyan-morning',
  'kalyan night':       'kalyan-night',
  'milan morning':      'milan-morning',
  'milan day':          'milan-day',
  'milan night':        'milan-night',
  'rajdhani day':       'rajdhani-day',
  'rajdhani morning':   'rajdhani-morning',
  'rajdhani night':     'rajdhani-night',
  'main bazar':         'main-bazar',
  'main bazar morning': 'main-bazar-morning',
  'sridevi':            'sridevi',
  'sridevi morning':    'sridevi-morning',
  'sridevi night':      'sridevi-night',
  'time bazar':         'time-bazar',
  'madhuri':            'madhuri',
  'madhur day':         'madhur-day',
  'madhur night':       'madhur-night',
  'supreme day':        'supreme-day',
  'supreme night':      'supreme-night',
  'maharani':           'maharani',
  'karnataka day':      'karnataka-day',
};

// ─── Result parser ────────────────────────────────────────────────────────────
function parseResult(str) {
  const clean = (str || '').replace(/\s/g, '');
  const parts = clean.split('-');
  if (parts.length === 3) return { open_result: parts[0], jodi_result: parts[1], close_result: parts[2] };
  if (parts.length === 2) return { open_result: parts[0], jodi_result: parts[1], close_result: null };
  return null;
}

// ─── Single game page scrape ──────────────────────────────────────────────────
async function scrapeGame(slug) {
  try {
    const url = `${BASE}/${slug}.php`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36' },
      timeout: 10000
    });

    const $ = cheerio.load(html);
    let result = '';

    // Result format: "247-30-226" ya "260-8"
    $('font, b, strong, h2, h3, p, div, td').each((i, el) => {
      const text = $(el).text().trim();
      if (/^\d{3}-\d{2}-\d{3}$/.test(text) || /^\d{3}-\d{1,2}$/.test(text)) {
        result = text;
        return false;
      }
    });

    // Fallback: body text mein dhundo
    if (!result) {
      const bodyText = $('body').text();
      const match = bodyText.match(/\d{3}-\d{2}-\d{3}|\d{3}-\d{1,2}/);
      if (match) result = match[0];
    }

    return result || null;
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
      if (!result) {
        unmatched.push({ db_game: dbGame.name, slug, reason: 'No result on page' });
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
