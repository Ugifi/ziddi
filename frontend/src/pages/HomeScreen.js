import React, { useState, useEffect } from 'react';
import { DepositModal } from './OtherPages';

export default function HomeScreen({ wallet, onAdd, onWith, onPlay, navigate, apiCall }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [disawarGames, setDisawarGames] = useState([]);
  const [showDisawar, setShowDisawar] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  const [settings, setSettings] = useState({
    site_name: 'MATKA KING',
    whatsapp: '9999999999',
    telegram: 'matkaking_support',
    phone: '9999999999',
    ticker_text: '',
  });

  const banners = [
    { bg: 'linear-gradient(135deg, #1a3a6e, #2356b0)', text: 'DAILY Disawar', sub: 'Win Big Every Day!', emoji: '🏆', eyebrow: 'MATKAKING PRESENTS' },
    { bg: 'linear-gradient(135deg, #0f2d5e, #1e4fa0)', text: '100% SAFE & TRUSTED', sub: 'Instant Withdrawal', emoji: '🔒', eyebrow: 'MATKAKING PRESENTS' },
    { bg: 'linear-gradient(135deg, #163368, #2a5bbf)', text: 'FAST WITHDRAWAL', sub: 'Instant Money Transfer', emoji: '⚡', eyebrow: 'MATKAKING PRESENTS' },
    { bg: 'linear-gradient(135deg, #0d2a58, #1e4a9e)', text: 'NEW GAMES ADDED', sub: 'Play & Win Now!', emoji: '🎯', eyebrow: 'MATKAKING PRESENTS' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://ziddi-1-we11.onrender.com';
        const res = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data?.success && data?.settings) {
          const s = data.settings;
          setSettings({
            site_name:   s.site_name   || 'MATKA KING',
            whatsapp:    s.whatsapp    || s.whatsapp_support || '9999999999',
            telegram:    s.telegram    || 'matkaking_support',
            phone:       s.phone       || s.support_phone   || '9999999999',
            ticker_text: s.ticker_text || s.notice_text     || '',
          });
        }
      } catch (err) {
        console.log('Settings fetch failed, using defaults');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://ziddi-1-we11.onrender.com';
        const res = await fetch(`${API_URL}/api/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        let allGames = [];
        if (Array.isArray(data)) allGames = data;
        else if (data?.games) allGames = data.games;
        else if (data?.data) allGames = data.data;

        const disawar = allGames.filter(g =>
          g.name?.toLowerCase().includes('disawar') ||
          g.category?.toLowerCase() === 'disawar' ||
          g.game_category?.toLowerCase() === 'disawar'
        );
        const main = allGames.filter(g =>
          !g.name?.toLowerCase().includes('disawar') &&
          g.category?.toLowerCase() !== 'disawar' &&
          g.game_category?.toLowerCase() !== 'disawar'
        );

        setGames(main);
        setDisawarGames(disawar.length > 0 ? disawar : allGames.filter(g => g.name?.toLowerCase().includes('disawar')));
      } catch (err) {
        setGames([
          { id: 1, name: 'STARLINE MORNING', open_time: '09:00:00', close_time: '09:30:00', status: 'open',   result: null },
          { id: 2, name: 'TIME BAZAR',       open_time: '01:00:00', close_time: '02:00:00', status: 'closed', result: null },
        ]);
        setDisawarGames([
          { id: 10, name: 'DISAWAR', open_time: '05:00:00', close_time: '04:30:00', status: 'open', result: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // ✅ 30 Second Delay Logic
  const isTimePassed = (timeStr, delaySeconds = 30) => {
    if (!timeStr) return false;
    try {
      const now = new Date();
      const [h, m, s] = timeStr.split(':').map(Number);
      const gameDate = new Date();
      gameDate.setHours(h, m, s || 0, 0);
      
      const diff = (now.getTime() - gameDate.getTime()) / 1000;
      return diff >= delaySeconds;
    } catch { return false; }
  };

  // ✅ Result Format with 30 Sec Delay & Date Filter
  const formatResult = (g) => {
    let openRes = g.open_result;
    let closeRes = g.close_result;

    if (openRes && !isTimePassed(g.open_time, 30)) {
      openRes = null;
    }
    if (closeRes && !isTimePassed(g.close_time, 30)) {
      closeRes = null;
    }

    const open  = openRes  || '***';
    const close = closeRes || '***';

    let jodi = '**';
    if (openRes) {
      const openDigit = String(openRes).split('').reduce((sum, d) => sum + parseInt(d, 10), 0) % 10;
      if (closeRes) {
        const closeDigit = String(closeRes).split('').reduce((sum, d) => sum + parseInt(d, 10), 0) % 10;
        jodi = `${openDigit}${closeDigit}`;
      } else {
        jodi = `${openDigit}*`;
      }
    }

    return `${open}-${jodi}-${close}`;
  };

  // ✅ NEW STATUS LOGIC: Time aur Result ke hisaab se status decide karega
  const getGameStatus = (g) => {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // "HH:MM:SS"
    
    // 1. Agar close time guzar gaya ya dono result aa gaye
    if (currentTime >= g.close_time || (g.open_result && g.close_result)) {
      return { text: 'Closed for today', canPlay: false, className: 'hs-status-closed' };
    }
    
    // 2. Agar open result aa gaya hai (close time nahi hua)
    if (g.open_result) {
      return { text: 'Running for close', canPlay: true, className: 'hs-status-running' };
    }
    
    // 3. Agar open result nahi aaya hai
    return { text: 'Market is open', canPlay: true, className: 'hs-status-running' };
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    } catch { return timeStr; }
  };

  const tickerContent = settings.ticker_text
    ? settings.ticker_text
    : `📞 Contact: ${settings.phone} &nbsp;&nbsp;&nbsp; 💳 Instant Withdrawal | 100% Safe &nbsp;&nbsp;&nbsp; 📞 Contact: ${settings.phone} &nbsp;&nbsp;&nbsp; 💳 Instant Withdrawal | 100% Safe`;

  // ✅ ADMIN IMPERSONATION CHECK
  const isAdminImpersonating = localStorage.getItem('mk_admin_token');
  const backToAdmin = () => {
    localStorage.setItem('mk_token', localStorage.getItem('mk_admin_token'));
    localStorage.removeItem('mk_admin_token');
    window.location.href = '/?admin=1'; // Wapas admin panel
  };

  // ── DISAWAR PAGE ──────────────────────────────────────────────
  if (showDisawar) {
    return (
      <div style={{ background: '#eef2f7', minHeight: '100vh', paddingBottom: 80, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        {/* ✅ BACK TO ADMIN BUTTON */}
        {isAdminImpersonating && (
          <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#0d1b5e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
            ⬅️ Back to Admin
          </button>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
          * { box-sizing: border-box; }
          .hs-card { background:#fff; border-radius:14px; margin:8px 12px 0; overflow:hidden; box-shadow:0 2px 10px rgba(26,58,110,0.08); border:1px solid #e2e9f4; padding:3px 8px; transition:box-shadow 0.2s; }
          .hs-card:hover { box-shadow:0 6px 20px rgba(26,58,110,0.13); }
          .hs-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:4px; }
          .hs-card-name { font-family:'Nunito',sans-serif; font-size:16px; font-weight:900; color:#0d1f40; letter-spacing:0.3px; text-transform:uppercase; }
          .hs-card-cal { width:32px; height:32px; background:#eef2f7; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
          .hs-status-running { font-size:12px; font-weight:700; color:#1e8a3c; display:flex; align-items:center; gap:5px; margin-bottom:8px; }
          .hs-status-running::before { content:''; width:7px; height:7px; border-radius:50%; background:#1e8a3c; display:inline-block; }
          .hs-status-closed { font-size:12px; font-weight:700; color:#c0392b; display:flex; align-items:center; gap:5px; margin-bottom:8px; }
          .hs-status-closed::before { content:''; width:7px; height:7px; border-radius:50%; background:#c0392b; display:inline-block; }
          .hs-result { margin-bottom:10px; }
          .hs-result-text { font-size:15px; font-weight:700; color:#2a6dd9; letter-spacing:3px; }
          .hs-card-divider { height:1px; background:#eef2f7; margin-bottom:10px; }
          .hs-bottom-row { display:flex; align-items:center; justify-content:space-between; }
          .hs-time-wrap { display:flex; align-items:center; gap:0; }
          .hs-time-block { width:90px; flex-shrink:0; }
          .hs-time-lbl { font-size:11px; color:#8a9bb5; font-weight:600; margin-bottom:2px; }
          .hs-time-val { font-size:14px; font-weight:800; color:#2a6dd9; }
          .hs-time-sep { width:1px; height:32px; background:#e2e9f4; margin:0 16px; flex-shrink:0; }
          .hs-play-circle { width:46px; height:46px; border-radius:50%; border:none; background:linear-gradient(135deg,#1e4fa0,#2a6dd9); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 4px 14px rgba(30,79,160,0.4); transition:transform 0.2s,box-shadow 0.2s; }
          .hs-play-circle:hover { transform:scale(1.08); box-shadow:0 6px 20px rgba(30,79,160,0.5); }
          .hs-play-circle:active { transform:scale(0.95); }
          .hs-play-circle:disabled { background:#dde4ef; cursor:not-allowed; box-shadow:none; }
          .hs-play-tri { width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:14px solid #fff; margin-left:3px; }
          .hs-play-tri-off { width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:14px solid #b0bdd4; margin-left:3px; }
        `}</style>

        <div style={{ background: 'linear-gradient(135deg, #1a3a6e, #2356b0)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 3px 14px rgba(26,58,110,0.3)', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setShowDisawar(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>MATKA DISAWAR</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{disawarGames.length} Game{disawarGames.length !== 1 ? 's' : ''} Available</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 14px 4px' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#2a6dd9', animation: 'livePulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: '#1a3a6e', letterSpacing: 1, textTransform: 'uppercase' }}>Disawar Markets</span>
          <style>{`@keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}`}</style>
        </div>

        {disawarGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#8a9bb5' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Koi Disawar game nahi mila</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Admin se games add karwao</div>
          </div>
        ) : (
          disawarGames.map((g) => {
            const status = getGameStatus(g);
            return (
              <div key={g.id} className="hs-card">
                <div className="hs-card-top">
                  <div className="hs-card-name">{g.name}</div>
                  <div className="hs-card-cal">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2a6dd9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                </div>
                <div className="hs-result">
                  <span className="hs-result-text">{formatResult(g)}</span>
                </div>
                <div className={status.className}>{status.text}</div>
                <div className="hs-card-divider" />
                <div className="hs-bottom-row">
                  <div className="hs-time-wrap">
                    <div className="hs-time-block">
                      <div className="hs-time-lbl">Time Open :</div>
                      <div className="hs-time-val">{formatTime(g.open_time)}</div>
                    </div>
                    <div className="hs-time-sep" />
                    <div className="hs-time-block">
                      <div className="hs-time-lbl">Time Close :</div>
                      <div className="hs-time-val">{formatTime(g.close_time)}</div>
                    </div>
                  </div>
                  <button className="hs-play-circle" onClick={() => status.canPlay && onPlay(g)} disabled={!status.canPlay}>
                    {status.canPlay ? <div className="hs-play-tri" /> : <div className="hs-play-tri-off" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div style={{ height: 16 }} />
      </div>
    );
  }

  // ── MAIN HOME ─────────────────────────────────────────────────
  return (
    <div style={{ background: '#eef2f7', minHeight: '100vh', paddingBottom: 80, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      
      {/* ✅ BACK TO ADMIN BUTTON */}
      {isAdminImpersonating && (
        <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#0d1b5e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          ⬅️ Back to Admin
        </button>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Baloo+2:wght@700;800&display=swap');
        * { box-sizing: border-box; }

        .hs-ticker { background:linear-gradient(90deg,#1a3a6e,#2356b0); padding:7px 0; overflow:hidden; white-space:nowrap; }
        .hs-ticker-inner { display:inline-block; animation:tickerScroll 22s linear infinite; color:#fff; font-size:12px; font-weight:700; letter-spacing:0.8px; }
        @keyframes tickerScroll { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }

        .hs-banner { margin:12px 12px 0; border-radius:14px; overflow:hidden; height:115px; position:relative; box-shadow:0 6px 22px rgba(26,58,110,0.30); }
        .hs-banner-slide { position:absolute; inset:0; display:flex; align-items:center; padding:0 22px; transition:opacity 0.5s ease; }
        .hs-banner-dots { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:5px; }
        .hs-banner-dot { width:7px; height:7px; border-radius:4px; background:rgba(255,255,255,0.35); transition:all 0.3s; cursor:pointer; }
        .hs-banner-dot.active { background:#fff; width:20px; }

        .hs-action-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:12px 12px 0; }
        .hs-btn { border:none; border-radius:10px; padding:13px 10px; font-family:'Nunito',sans-serif; font-size:14px; font-weight:900; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform 0.15s,box-shadow 0.15s; letter-spacing:0.4px; text-transform:uppercase; color:#fff; background:linear-gradient(135deg,#1e4fa0,#2a6dd9); box-shadow:0 4px 14px rgba(30,79,160,0.35); }
        .hs-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(30,79,160,0.45); }
        .hs-btn:active { transform:scale(0.97); }

        .hs-king-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:10px 12px 0; }
        .hs-king-btn { background:linear-gradient(135deg,#1e4fa0,#2a6dd9); border:none; border-radius:10px; padding:13px 10px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; box-shadow:0 4px 14px rgba(30,79,160,0.35); transition:transform 0.15s,box-shadow 0.15s; }
        .hs-king-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(30,79,160,0.45); }
        .hs-king-btn:active { transform:scale(0.96); }
        .hs-king-play { width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .hs-king-play-tri { width:0; height:0; border-top:5px solid transparent; border-bottom:5px solid transparent; border-left:9px solid #fff; margin-left:2px; }
        .hs-king-name { font-family:'Nunito',sans-serif; font-size:13px; font-weight:900; color:'#fff', letterSpacing:0.3px; text-transform:uppercase; }

        .hs-live-header { display:flex; align-items:center; gap:8px; padding:16px 14px 6px; }
        .hs-live-dot { width:9px; height:9px; border-radius:50%; background:#2a6dd9; animation:livePulse 1.4s ease-in-out infinite; flex-shrink:0; }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        .hs-live-title { font-size:14px; font-weight:900; color:#1a3a6e; letter-spacing:1px; text-transform:uppercase; }

        .hs-card { background:#fff; border-radius:14px; margin:8px 12px 0; overflow:hidden; box-shadow:0 2px 10px rgba(26,58,110,0.08); border:1px solid #e2e9f4; padding:3px 8px; transition:box-shadow 0.2s; }
        .hs-card:hover { box-shadow:0 6px 20px rgba(26,58,110,0.13); }
        .hs-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:4px; }
        .hs-card-name { font-family:'Nunito',sans-serif; font-size:16px; font-weight:900; color:#0d1f40; letter-spacing:0.3px; text-transform:uppercase; }
        .hs-card-cal { width:32px; height:32px; background:#eef2f7; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .hs-status-running { font-size:12px; font-weight:700; color:#1e8a3c; display:flex; align-items:center; gap:5px; margin-bottom:8px; }
        .hs-status-running::before { content:''; width:7px; height:7px; border-radius:50%; background:#1e8a3c; display:inline-block; }
        .hs-status-closed { font-size:12px; font-weight:700; color:#c0392b; display:flex; align-items:center; gap:5px; margin-bottom:8px; }
        .hs-status-closed::before { content:''; width:7px; height:7px; border-radius:50%; background:#c0392b; display:inline-block; }
        .hs-result { margin-bottom:10px; }
        .hs-result-text { font-size:15px; font-weight:700; color:#2a6dd9; letter-spacing:3px; }
        .hs-card-divider { height:1px; background:#eef2f7; margin-bottom:10px; }
        .hs-bottom-row { display:flex; align-items:center; justify-content:space-between; }
        .hs-time-wrap { display:flex; align-items:center; }
        .hs-time-block { width:90px; flex-shrink:0; }
        .hs-time-lbl { font-size:11px; color:#8a9bb5; font-weight:600; margin-bottom:2px; }
        .hs-time-val { font-size:14px; font-weight:800; color:#2a6dd9; }
        .hs-time-sep { width:1px; height:32px; background:#e2e9f4; margin:0 16px; flex-shrink:0; }
        .hs-play-circle { width:46px; height:46px; border-radius:50%; border:none; background:linear-gradient(135deg,#1e4fa0,#2a6dd9); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 4px 14px rgba(30,79,160,0.4); transition:transform 0.2s,box-shadow 0.2s; }
        .hs-play-circle:hover { transform:scale(1.08); box-shadow:0 6px 20px rgba(30,79,160,0.5); }
        .hs-play-circle:active { transform:scale(0.95); }
        .hs-play-circle:disabled { background:#dde4ef; cursor:not-allowed; box-shadow:none; }
        .hs-play-tri { width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:14px solid #fff; margin-left:3px; }
        .hs-play-tri-off { width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:14px solid #b0bdd4; margin-left:3px; }
        .hs-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:14px; }
        .hs-loader-ring { width:44px; height:44px; border:4px solid #d0daea; border-top-color:#2a6dd9; border-radius:50%; animation:loaderSpin 0.8s linear infinite; }
        @keyframes loaderSpin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── DEPOSIT MODAL ── */}
      {showDeposit && (
        <DepositModal
          apiCall={apiCall}
          onClose={() => setShowDeposit(false)}
          onSuccess={() => { setShowDeposit(false); }}
        />
      )}

      {/* TICKER */}
      <div className="hs-ticker">
        <span className="hs-ticker-inner" dangerouslySetInnerHTML={{ __html: tickerContent + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + tickerContent }} />
      </div>

      {/* BANNER SLIDER */}
      <div className="hs-banner">
        {banners.map((b, i) => (
          <div key={i} className="hs-banner-slide"
            style={{ background: b.bg, opacity: currentSlide === i ? 1 : 0, pointerEvents: currentSlide === i ? 'auto' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 2, marginBottom: 5 }}>{b.eyebrow}</div>
              <div style={{ fontSize: 21, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', cursive", lineHeight: 1.15, marginBottom: 4 }}>{b.text}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{b.sub}</div>
            </div>
            <div style={{ fontSize: 44, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))' }}>{b.emoji}</div>
          </div>
        ))}
        <div className="hs-banner-dots">
          {banners.map((_, i) => (
            <div key={i} className={`hs-banner-dot ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
      </div>

      {/* ADD MONEY / WITHDRAW */}
      <div className="hs-action-row">
        <button className="hs-btn" onClick={() => setShowDeposit(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="3"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          ADD MONEY
        </button>
        <button className="hs-btn" onClick={onWith}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          WITHDRAW
        </button>
      </div>


      {/* LIVE MARKETS */}
      <div className="hs-live-header">
        <div className="hs-live-dot" />
        <span className="hs-live-title">Live Markets</span>
      </div>

      {/* GAME CARDS */}
      {loading ? (
        <div className="hs-loader">
          <div className="hs-loader-ring" />
          <span style={{ color: '#2a6dd9', fontWeight: 700, fontSize: 14 }}>Loading Games...</span>
        </div>
      ) : games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8a9bb5', fontWeight: 700 }}>No games available</div>
      ) : (
        games.map((g) => {
          const status = getGameStatus(g);
          return (
            <div key={g.id} className="hs-card">
              <div className="hs-card-top">
                <div className="hs-card-name">{g.name}</div>
                <div className="hs-card-cal">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2a6dd9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>
              <div className="hs-result">
                <span className="hs-result-text">{formatResult(g)}</span>
              </div>
              <div className={status.className}>{status.text}</div>
              <div className="hs-card-divider" />
              <div className="hs-bottom-row">
                <div className="hs-time-wrap">
                  <div className="hs-time-block">
                    <div className="hs-time-lbl">Time Open :</div>
                    <div className="hs-time-val">{formatTime(g.open_time)}</div>
                  </div>
                  <div className="hs-time-sep" />
                  <div className="hs-time-block">
                    <div className="hs-time-lbl">Time Close :</div>
                    <div className="hs-time-val">{formatTime(g.close_time)}</div>
                  </div>
                </div>
                <button className="hs-play-circle" onClick={() => status.canPlay && onPlay(g)} disabled={!status.canPlay}>
                  {status.canPlay ? <div className="hs-play-tri" /> : <div className="hs-play-tri-off" />}
                </button>
              </div>
            </div>
          );
        })
      )}
      <div style={{ height: 16 }} />
    </div>
  );
}
