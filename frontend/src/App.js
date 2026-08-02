  import React, { useState, useEffect, useCallback, useRef } from 'react';
  import './App.css';

  import AuthScreen from './components/AuthScreen';
  import Toast from './components/Toast';
  import { DepositModal } from './pages/OtherPages';
  import { WithdrawModal } from './components/Modals';
import DownloadPage from './pages/DownloadPage';

  import HomeScreen from './pages/HomeScreen';
  import GameTypePage from './pages/GameTypePage';
  import BetForm from './pages/BetForm';
  import { BidsPage, TxnsPage, WalletPage, SupportPage, HowToPlayPage, FAQPage, TermsPage, PrivacyPage, ReferralPage, GameRatesPage } from './pages/OtherPages';
  import AdminPanel, { AdminLogin } from './pages/AdminPanel';

  import { INIT_BIDS, INIT_TXNS } from './data/gameData';

  const API = 'https://ziddi-1-we11.onrender.com';

  function apiCall(path, method = 'GET', body = null) {
    const token = localStorage.getItem('mk_token');
    return fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    }).then(r => r.json());
  }

  // ── SVG ICONS ─────────────────────────────────────────────────────────────────
  const IconTransaction = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8"/>
      <line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  const IconBids = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="17" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  const IconHome = ({ size = 26, color = 'white' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const IconWallet = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke={color} strokeWidth="1.8"/>
      <path d="M16 3L20 7H4L8 3H16Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="17" cy="14" r="2" stroke={color} strokeWidth="1.6"/>
    </svg>
  );

  const IconSupport = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1" fill={color}/>
      <circle cx="12" cy="10" r="1" fill={color}/>
      <circle cx="16" cy="10" r="1" fill={color}/>
    </svg>
  );

  // ── LANGUAGE SELECTION SCREEN ─────────────────────────────────────────────────
  function LanguageScreen({ onSelect }) {
    const languages = [
      { label: 'English', val: 'en' },
      { label: 'हिन्दी', val: 'hi' },
      { label: 'తెలుగు', val: 'te' },
      { label: 'ಕನ್ನಡ', val: 'kn' },
    ];

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1b5e 0%, #1a2f8f 60%, #1565C0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: '"Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background circles */}
        <div style={{ position:'absolute', top:'-5%', left:'-10%', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.05)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:350, height:350, borderRadius:'50%', background:'rgba(255,215,0,0.08)', filter:'blur(70px)' }}/>

        {/* Logo */}
        <div style={{ width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,215,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 8px 32px rgba(0,0,0,0.25)', overflow:'hidden' }}>
          <img src={`${process.env.PUBLIC_URL}/th.jpg`} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>

        <div style={{ color:'#fff', fontSize:26, fontWeight:900, letterSpacing:2, marginBottom:4, textShadow:'0 2px 10px rgba(0,0,0,0.3)' }}>MATKA BOSS</div>
        <div style={{ color:'#FFD700', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:40 }}>India's #1 Premium Matka Platform</div>

        {/* Select Language Title */}
        <div style={{ color:'#fff', fontSize:22, fontWeight:800, marginBottom:6 }}>Select your</div>
        <div style={{ color:'#FFD700', fontSize:28, fontWeight:900, marginBottom:32, letterSpacing:1 }}>Language</div>

        {/* Language Buttons Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, width:'100%', maxWidth:320 }}>
          {languages.map(l => (
            <button key={l.val} onClick={() => onSelect(l.val)}
              style={{
                padding: '20px 0',
                borderRadius: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 18,
                fontWeight: 800,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                letterSpacing: 0.5
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.25)'; e.currentTarget.style.transform='scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='scale(1)'; }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Marathi button - centered below */}
        <button onClick={() => onSelect('mr')}
          style={{
            marginTop: 14,
            padding: '20px 80px',
            borderRadius: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            letterSpacing: 0.5,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.25)'; e.currentTarget.style.transform='scale(1.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='scale(1)'; }}>
          मराठी
        </button>

        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:40, fontWeight:600 }}>18+ Only · Play Responsibly</div>
      </div>
    );
  }

  // ── BLUE DRAWER ───────────────────────────────────────────────────────────────
  function BlueDrawer({ user, onClose, onNav, onLogout, wallet }) {
    const menuItems = [
      { section: 'ACCOUNT' },
      { ic: '👛', label: 'My Wallet',           id: 'wallet' },
      { ic: '📋', label: 'Transaction History', id: 'txns' },
      { ic: '✏️', label: 'Edit Profile',        id: 'profile' },
      { ic: '🎁', label: 'Refer & Earn',        id: 'referral' },
      { section: 'GAMES' },
      { ic: '🎮', label: 'All Games',           id: 'home' },
      { ic: '🏆', label: 'Win History',         id: 'bids' },
      { section: 'HELP & SUPPORT' },
      { ic: '💬', label: 'WhatsApp Support',    id: 'wa',  action: () => window.open('https://wa.me/918767108332','_blank') },
      { ic: '✈️', label: 'Telegram Support',   id: 'tg',  action: () => window.open('https://t.me/Matkaboss21','_blank') },
      { ic: '📖', label: 'How to Play',         id: 'htp' },
      { ic: '🎰', label: 'Game Rates',          id: 'gamerates' },
      { ic: '❓', label: 'FAQ',                 id: 'faq' },
      { ic: '📜', label: 'Terms & Conditions',  id: 'terms' },
      { ic: '🔒', label: 'Privacy Policy',      id: 'privacy' },
      { ic: '📱', label: 'Download App',         id: 'download' },
    ];

    return (
      <>
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:500, backdropFilter:'blur(3px)' }} />
        <div style={{ position:'fixed', top:0, left:0, width:280, height:'100%', background:'#fff', zIndex:501, overflowY:'auto', animation:'slideDrawerIn 0.25s ease', boxShadow:'4px 0 24px rgba(21,101,192,0.18)', paddingBottom:40 }}>
          <style>{`
            @keyframes slideDrawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
            .drawer-menu-item:hover { background: #EEF4FF !important; transform: translateX(4px); }
          `}</style>

          <div style={{ background:'linear-gradient(135deg, #1565C0, #1976D2)', padding:'20px 16px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:2 }}>{user?.name || 'Player'}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>{user?.mobile || ''}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:2 }}>
                  💰 Rs.{Number(wallet || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                </div>
              </div>
            </div>
            <div onClick={onClose} style={{ color:'rgba(255,255,255,0.85)', fontSize:22, cursor:'pointer', padding:'2px 4px', lineHeight:1 }}>✕</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'14px 12px', borderBottom:'1px solid #E3EAFF' }}>
            {[{ ic:'💰', label:'Add Fund', id:'add' }, { ic:'💸', label:'Withdraw', id:'with' }, { ic:'🎯', label:'My Bids', id:'bids' }].map(btn => (
              <div key={btn.id} onClick={() => { onNav(btn.id); onClose(); }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer', padding:'8px 4px', borderRadius:10, transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#EEF4FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width:40, height:40, background:'#EEF4FF', border:'1.5px solid #BBDEFB', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{btn.ic}</div>
                <div style={{ fontSize:11, color:'#1565C0', fontWeight:700, textAlign:'center' }}>{btn.label}</div>
              </div>
            ))}
          </div>

          {menuItems.map((item, i) => {
            if (item.section) return (
              <div key={i} style={{ fontSize:10, color:'#90CAF9', letterSpacing:2, textTransform:'uppercase', padding:'14px 16px 4px', fontWeight:700 }}>{item.section}</div>
            );
            return (
              <div key={i} className="drawer-menu-item"
                onClick={() => { if (item.action) item.action(); else onNav(item.id); onClose(); }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer', borderBottom:'1px solid #F0F4FF', transition:'all 0.15s' }}>
                <div style={{ width:36, height:36, background:'#EEF4FF', border:'1px solid #BBDEFB', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.ic}</div>
                <div style={{ fontSize:15, fontWeight:600, color:'#0D47A1' }}>{item.label}</div>
                <div style={{ marginLeft:'auto', color:'#90CAF9', fontSize:18 }}>›</div>
              </div>
            );
          })}

          <div onClick={onLogout}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer', marginTop:8, borderTop:'1px solid #E3EAFF' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFEBEE'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width:36, height:36, background:'#FFEBEE', border:'1px solid #FFCDD2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🚪</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#C62828' }}>Logout</div>
          </div>
        </div>
      </>
    );
  }

  // ── PROFILE SCREEN ────────────────────────────────────────────────────────────
  function ProfileScreen({ user, showToast }) {
    const [name, setName]         = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
      if (!name) return showToast('Naam khali nahi chhod sakte!', 'err');
      setUpdating(true);
      try {
        const token = localStorage.getItem('mk_token');
        if (password) {
          if (password.length < 6) throw new Error('Password min 6 characters ka ho');
          const resPass = await apiCall('/api/auth/update-password', 'POST', { newPassword: password });
          if (!resPass.success) throw new Error(resPass.message || 'Password update fail');
        }
        const response = await fetch(`${API}/api/auth/update-profile`, {
          method:'POST',
          headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' },
          body: JSON.stringify({ name })
        });
        const resProfile = await response.json();
        if (resProfile.success) { showToast('Profile Updated! 🚀', 'ok'); setPassword(''); }
        else throw new Error(resProfile.message || 'Profile update fail');
      } catch (err) { showToast(err.message || 'Server error!', 'err'); }
      finally { setUpdating(false); }
    };

    const inp = { width:'100%', padding:'12px 14px', borderRadius:10, border:'2px solid #BBDEFB', background:'#F5F9FF', color:'#0D47A1', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:14 };
    const lbl = { fontSize:11, color:'#1565C0', fontWeight:700, textTransform:'uppercase', letterSpacing:2, display:'block', marginBottom:6 };

    return (
      <div style={{ background:'#F0F4FF', minHeight:'100vh', paddingBottom:80 }}>
        <div style={{ background:'linear-gradient(135deg,#1565C0,#1976D2)', padding:'24px 20px', textAlign:'center', borderBottom:'3px solid #0D47A1' }}>
          <div style={{ width:72, height:72, background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.5)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:32 }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ color:'#fff', fontWeight:800, fontSize:18 }}>{user?.name || 'User'}</div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:12, marginTop:2 }}>📱 {user?.mobile || '—'}</div>
        </div>

        <div style={{ background:'#fff', margin:'12px', borderRadius:14, padding:'16px', border:'1.5px solid #E3EAFF', boxShadow:'0 2px 10px rgba(21,101,192,0.08)' }}>
          <label style={lbl}>Mobile Number</label>
          <input value={user?.mobile || ''} disabled style={{ ...inp, background:'#F5F5F5', color:'#aaa', cursor:'not-allowed', border:'2px solid #E0E0E0' }} />
          <label style={lbl}>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inp} />
          <label style={lbl}>New Password (Optional)</label>
          <input type="password" placeholder="Naya password (min 6 char)" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, marginBottom:0 }} />
          <button onClick={handleUpdate} disabled={updating}
            style={{ width:'100%', marginTop:14, background:'linear-gradient(135deg,#1565C0,#1E88E5)', color:'#fff', border:'none', borderRadius:12, padding:14, fontSize:15, fontWeight:800, cursor:updating?'not-allowed':'pointer', opacity:updating?0.6:1, letterSpacing:2, textTransform:'uppercase', boxShadow:'0 4px 14px rgba(21,101,192,0.3)' }}>
            {updating ? '⏳ Saving...' : '💾 UPDATE PROFILE'}
          </button>
        </div>

        <div style={{ background:'#fff', margin:'0 12px', borderRadius:14, overflow:'hidden', border:'1.5px solid #E3EAFF', boxShadow:'0 2px 10px rgba(21,101,192,0.08)' }}>
          <div style={{ padding:'12px 16px', background:'#EEF4FF', borderBottom:'1px solid #BBDEFB', fontSize:12, fontWeight:800, color:'#1565C0', textTransform:'uppercase', letterSpacing:1 }}>🎧 Help & Support</div>
          <div onClick={() => window.open('https://wa.me/918767108332','_blank')} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid #F0F4FF', cursor:'pointer' }}>
            <div style={{ width:40, height:40, background:'#E8F5E9', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>💬</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#0D47A1' }}>WhatsApp Support</div><div style={{ fontSize:11, color:'#aaa' }}>+91 918767108332</div></div>
            <div style={{ color:'#90CAF9', fontSize:20 }}>›</div>
          </div>
          <div onClick={() => window.open('https://t.me/Matkaboss21','_blank')} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', cursor:'pointer' }}>
            <div style={{ width:40, height:40, background:'#EEF4FF', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✈️</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#0D47A1' }}>Telegram Support</div><div style={{ fontSize:11, color:'#aaa' }}>Quick reply in 5 mins</div></div>
            <div style={{ color:'#90CAF9', fontSize:20 }}>›</div>
          </div>
        </div>
      </div>
    );
  }

  // ── CATEGORY GAMES SCREEN ─────────────────────────────────────────────────────
  function CategoryGamesScreen({ category, apiCategory, onPlay }) {
    const [games, setGames]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchGames = async () => {
        try {
          const token = localStorage.getItem('mk_token');
          const fetchCat = apiCategory || category;
          const res = await fetch(`${API}/api/games?category=${fetchCat}`, { headers:{ 'Authorization':`Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setGames(Array.isArray(data.games) ? data.games : []);
        } catch { } finally { setLoading(false); }
      };
      fetchGames();
    }, [category, apiCategory]);

    const formatResult = g => {
      if (g.open_result || g.close_result)
        return `${g.open_result || '***'}-${g.jodi_result || '--'}-${g.close_result || '***'}`;
      return '***_**_***';
    };

    const isRunning = g => g.status === 'open';

    return (
      <div style={{ background:'#f5f6fa', minHeight:'100vh', paddingBottom:80, fontFamily:"'Nunito','Segoe UI',sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
          .cg-card { background: #fff; border-radius: 16px; margin: 0 12px 12px; overflow: visible; box-shadow: 0 2px 10px rgba(21,101,192,0.08); transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #BBDEFB; padding: 14px 16px; }
          .cg-card:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(21,101,192,0.14); }
          .cg-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:4px; }
          .cg-card-name { font-family:'Nunito',sans-serif; font-size:18px; font-weight:900; color:#111; letter-spacing:0.5px; text-transform:uppercase; line-height:1.2; }
          .cg-result { font-size:14px; font-weight:700; color:#1565C0; letter-spacing:2px; margin-bottom:6px; }
          .cg-status-running { display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#2E7D32; margin-bottom:8px; }
          .cg-status-closed  { display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#C62828; margin-bottom:8px; }
          .cg-pulse-dot { width:8px; height:8px; border-radius:50%; background:#2E7D32; animation:cgPulse 1.4s ease-in-out infinite; flex-shrink:0; }
          @keyframes cgPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.65);} }
          .cg-bottom-row { display:flex; align-items:center; justify-content:space-between; margin-top:2px; }
          .cg-time-wrap { display:flex; align-items:center; gap:16px; }
          .cg-time-lbl { font-size:12px; color:#666; font-weight:600; margin-bottom:1px; }
          .cg-time-val { font-size:14px; font-weight:700; color:#1565C0; }
          .cg-divider-v { width:1px; height:32px; background:#BBDEFB; flex-shrink:0; }
          .cg-play-circle { width:48px; height:48px; border-radius:50%; border:none; background:linear-gradient(135deg,#1565C0,#1E88E5); color:#fff; font-size:17px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 4px 14px rgba(21,101,192,0.40); transition:transform 0.2s, box-shadow 0.2s; margin-top:-28px; }
          .cg-play-circle:hover { transform:scale(1.1); box-shadow:0 6px 20px rgba(21,101,192,0.50); }
          .cg-play-circle:active { transform:scale(0.95); }
          .cg-section-label { padding:4px 12px 8px; font-size:13px; font-weight:800; color:#1565C0; letter-spacing:2px; text-transform:uppercase; display:flex; align-items:center; gap:6px; }
          .cg-section-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(21,101,192,0.3),transparent); }
          .cg-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:14px; }
          .cg-loader-ring { width:44px; height:44px; border:4px solid #E3F2FD; border-top-color:#1565C0; border-radius:50%; animation:cgSpin 0.8s linear infinite; }
          @keyframes cgSpin { to { transform:rotate(360deg); } }
        `}</style>

        <div style={{ background:'linear-gradient(135deg,#1565C0,#1976D2)', padding:'16px', textAlign:'center', borderBottom:'3px solid #0D47A1', boxShadow:'0 2px 12px rgba(21,101,192,0.3)' }}>
          <div style={{ fontSize:32, marginBottom:4 }}>
            {category === 'starline' ? '⭐' : category === 'jackpot' ? '🎰' : '🎯'}
          </div>
          <div style={{ color:'#fff', fontSize:20, fontWeight:900, letterSpacing:2, textTransform:'uppercase' }}>
            {category === 'starline' ? 'Matka Starline' : category === 'jackpot' ? 'KING JACKPOT' : 'DISAWAR'} GAMES
          </div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:11, fontWeight:700, marginTop:2 }}>
            {games.filter(g => g.status === 'open').length} Games Open
          </div>
        </div>

        <div className="cg-section-label" style={{ marginTop:12 }}>🎮 Live Markets</div>

        {loading ? (
          <div className="cg-loader">
            <div className="cg-loader-ring" />
            <span style={{ color:'#1565C0', fontWeight:700, fontSize:14 }}>Loading Games...</span>
          </div>
        ) : games.length === 0 ? (
          <div style={{ textAlign:'center', color:'#aaa', padding:60 }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🚫</div>Koi game available nahi hai.
          </div>
        ) : (
          games.map(g => {
            const open = isRunning(g);
            return (
              <div key={g.id} className="cg-card">
                <div className="cg-card-top">
                  <div className="cg-card-name">{g.name}</div>
                  <svg width="38" height="38" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
                    <rect x="4" y="7" width="34" height="31" rx="4" stroke="#1565C0" strokeWidth="2.2" fill="#EEF4FF"/>
                    <path d="M4 15H38" stroke="#1565C0" strokeWidth="2.2"/>
                    <path d="M14 4V10M28 4V10" stroke="#1565C0" strokeWidth="2.5" strokeLinecap="round"/>
                    <rect x="10" y="20" width="5" height="4" rx="1" fill="#1565C0"/>
                    <rect x="19" y="20" width="5" height="4" rx="1" fill="#1565C0"/>
                    <rect x="28" y="20" width="4" height="4" rx="1" fill="#1565C0"/>
                    <rect x="10" y="28" width="5" height="4" rx="1" fill="#1565C0"/>
                    <rect x="19" y="28" width="5" height="4" rx="1" fill="#1565C0"/>
                  </svg>
                </div>

                <div className="cg-result">{formatResult(g)}</div>

                {open ? (
                  <div className="cg-status-running"><span className="cg-pulse-dot"/>Betting is Running for today</div>
                ) : (
                  <div className="cg-status-closed"><span style={{ width:8, height:8, borderRadius:'50%', background:'#C62828', display:'inline-block', flexShrink:0 }}/>Market Closed</div>
                )}

                <div className="cg-bottom-row">
                  <div className="cg-time-wrap">
                    <div>
                      <div className="cg-time-lbl">Time Open :</div>
                      <div className="cg-time-val">{g.open_time || '--:--'}</div>
                    </div>
                    <div className="cg-divider-v"/>
                    <div>
                      <div className="cg-time-lbl">Time Close :</div>
                      <div className="cg-time-val">{g.close_time || '--:--'}</div>
                    </div>
                  </div>
                  <button className="cg-play-circle"
                    onClick={() => open && onPlay(g)} disabled={!open}
                    style={!open ? { background:'#E0E0E0', color:'#bbb', cursor:'not-allowed', boxShadow:'none', marginTop:'-28px' } : {}}>
                    {open ? <span style={{ marginLeft:3 }}>▶</span> : <span>▷</span>}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────────────────────────
  export default function App() {
    const isAdmin = window.location.pathname === '/admin' || window.location.search.includes('admin=1');

    // ✅ Language Selection — sirf pehli baar dikhega
    const [language, setLanguage] = useState(() => localStorage.getItem('mk_language') || null);

    const handleLanguageSelect = (lang) => {
      localStorage.setItem('mk_language', lang);
      setLanguage(lang);
    };

    const [user, setUser]                   = useState(null);
    const [authLoading, setAuthLoading]     = useState(true);
    const [tab, setTab]                     = useState('home');
    const [wallet, setWallet]               = useState(0);
    const [bids, setBids]                   = useState(INIT_BIDS);
    const [txns, setTxns]                   = useState(INIT_TXNS);
    const [modal, setModal]                 = useState(null);
    const [drawer, setDrawer]               = useState(false);
    const [toast, setToast]                 = useState(null);
    const [selectedGame, setSelectedGame]   = useState(null);
    const [selectedType, setSelectedType]   = useState(null);
    const [page, setPage]                   = useState('home');
    const [adminLoggedIn, setAdminLoggedIn] = useState(() => !!localStorage.getItem('mk_token') && localStorage.getItem('mk_admin_logged') === '1');
    const [siteName, setSiteName]           = useState('SATTA KING');
    const [showNotices, setShowNotices]     = useState(false);
    const [noticesData, setNoticesData]     = useState([]);

    const walletRef        = useRef(0);
    const bidSubmittingRef = useRef(false);

    const showToast = (msg, type = 'ok') => setToast({ msg, type });

    useEffect(() => {
      const token = localStorage.getItem('mk_token');
      if (!token) { setAuthLoading(false); return; }
      apiCall('/api/auth/profile')
        .then(res => {
          if (res?.success && res?.user) {
            setUser(prev => ({ ...prev, ...res.user }));
          } else {
            localStorage.removeItem('mk_token');
          }
        })
        .catch(() => localStorage.removeItem('mk_token'))
        .finally(() => setAuthLoading(false));
    }, []);

    const fetchWallet = useCallback(() => {
      if (!localStorage.getItem('mk_token')) return;
      return apiCall('/api/wallet/balance').then(d => {
        if (d?.success) {
          const total = Number(d.wallet_balance || 0) + Number(d.winning_balance || 0);
          walletRef.current = total; setWallet(total);
          return { total };
        }
        return null;
      }).catch(() => null);
    }, []);

    useEffect(() => { if (user) fetchWallet(); }, [user, fetchWallet]);

    useEffect(() => {
      apiCall('/api/admin/settings')
        .then(res => { if (res?.success && res?.settings?.site_name) setSiteName(res.settings.site_name); })
        .catch(() => {});
    }, [user]);

    useEffect(() => {
      if (!user) return;
      const interval = setInterval(fetchWallet, 30000);
      return () => clearInterval(interval);
    }, [user, fetchWallet]);

    const handleLogin = u => {
      setUser(u);
      setWallet(0);
      walletRef.current = 0;
      setTimeout(() => {
        apiCall('/api/auth/profile')
          .then(res => { if (res?.success && res?.user) setUser(prev => ({ ...prev, ...res.user })); })
          .catch(() => {});
      }, 500);
    };
    const handleAdd  = amt => { fetchWallet(); showToast(`Rs.${amt.toLocaleString()} added!`); };
    const handleWith = amt => { fetchWallet(); showToast(`Withdrawal Rs.${amt.toLocaleString()} sent`); };

    const handleBidSubmit = async (data) => {
      if (bidSubmittingRef.current) { showToast('Bid processing ho rahi hai... ruko!', 'err'); return; }
      bidSubmittingRef.current = true;
      const amount = data.totalAmt || data.amount || 0;
      try {
        const fresh = await fetchWallet();
        const currentBalance = fresh ? fresh.total : walletRef.current;
        if (amount > currentBalance) {
          showToast(`Insufficient balance! Available: Rs.${currentBalance.toLocaleString()}`, 'err');
          bidSubmittingRef.current = false;
          return;
        }

        // ✅ BULK BID — ek hi API call (19 calls ki jagah 1)
        if (data.__bulk) {
          const result = await apiCall('/api/games/bid/bulk', 'POST', {
            game_id:   selectedGame.id,
            game_type: selectedType.id,   // selectedType — App.js ka sahi variable
            session:   data.session,
            bids:      data.numbers       // [{ num, amt }, ...]
          });
          if (result.success) {
            showToast(`${result.bids_placed} bids placed! Rs.${result.total_amount} deducted.`);
            await fetchWallet();
            const cat = selectedGame?.game_category;
            const backPage = cat==='starline'?'starline':cat==='jackpot'?'jackpot':cat==='disawar'?'disawar':'home';
            setPage(backPage); setSelectedGame(null); setSelectedType(null);
          } else {
            showToast(result.message || 'Bulk bid failed!', 'err');
            await fetchWallet();
          }
          bidSubmittingRef.current = false;
          return;
        }

        // ✅ SINGLE BID — purana logic as-is
        const res = await apiCall('/api/games/bid', 'POST', {
          game_id:   selectedGame.id,
          game_type: selectedType.id,
          number:    data.number,
          amount:    data.amount,
          session:   data.session || 'open'
        });
        if (!res.success) {
          showToast(res.message || 'Bid failed!', 'err');
          await fetchWallet();
          bidSubmittingRef.current = false;
          return;
        }
        await fetchWallet();
        showToast(`Bid Rs.${amount.toLocaleString()} placed!`);
        const cat = selectedGame?.game_category;
        const backPage = cat==='starline'?'starline':cat==='jackpot'?'jackpot':cat==='disawar'?'disawar':'home';
        setPage(backPage); setSelectedGame(null); setSelectedType(null);

      } catch {
        await fetchWallet();
        showToast('Network error! Dobara try karo.', 'err');
      } finally {
        bidSubmittingRef.current = false;
      }
    };
  // NAYA — scroll reset add kiya
  const navigate = id => {
    setPage(id);
    const validTabs = ['home','bids','disawar','jackpot','wallet','profile','game','txns','support','referral'];
    if (validTabs.includes(id)) setTab(id);
    // ✅ Top pe scroll karo
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

    const handleNav = id => {
  fetchWallet();
  if (id === 'add') setModal('add');
  else if (id === 'with') setModal('with');
  else if (id === 'download') { setPage('download'); }  // ← YEH LINE ADD KARO
  else { setPage(id); setSelectedGame(null); setSelectedType(null); setTab(id); }
};

    const goBack = () => {
      const cat = selectedGame?.game_category;
      if (page === 'bet-form') { setPage('game-types'); setSelectedType(null); }
      else if (page === 'game-types') {
        if (cat==='starline') { setPage('starline'); setSelectedGame(null); }
        else if (cat==='jackpot') { setPage('jackpot'); setSelectedGame(null); }
        else if (cat==='disawar') { setPage('disawar'); setSelectedGame(null); }
        else { setPage('home'); setSelectedGame(null); setTab('game'); }
      } else { setPage('home'); setTab('game'); }
    };

    if (isAdmin) {
      if (!adminLoggedIn) return <AdminLogin onLogin={() => { localStorage.setItem('mk_admin_logged', '1'); setAdminLoggedIn(true); }} />;
      return <AdminPanel onLogout={() => setAdminLoggedIn(false)} />;
    }

    // ✅ Language Screen — pehli baar dikhao
    if (!language) return <LanguageScreen onSelect={handleLanguageSelect} />;

    if (authLoading) {
      return (
        <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#EEF4FF', color:'#1565C0', fontSize:18, fontWeight:700 }}>
          Loading...
        </div>
      );
    }

    if (!user) return <AuthScreen onLogin={handleLogin} />;

    const isTxnTab  = page === 'txns';
    const isSubPage = ['game-types','bet-form','starline','disawar','jackpot'].includes(page);
    const navTitle  = page==='game-types' ? selectedGame?.name : page==='bet-form' ? selectedType?.label : page==='starline' ? 'Matka Starline' : page==='jackpot' ? 'KING JACKPOT' : page==='disawar' ? 'DISAWAR' : null;

    return (
      <>
        <style>{`
          .topnav { background: linear-gradient(135deg, #1565C0, #1976D2) !important; border-bottom: 3px solid #0D47A1 !important; box-shadow: 0 2px 12px rgba(21,101,192,0.35) !important; }
          .brand { color: #fff !important; text-shadow: 0 1px 6px rgba(0,0,0,0.15) !important; font-family: 'Baloo 2','Nunito',sans-serif !important; letter-spacing: 2px !important; }
          .back-btn { color: #fff !important; }
          .hamburger span { background: #fff !important; }
          .tn-wallet { background: rgba(255,255,255,0.18) !important; border: 1.5px solid rgba(255,255,255,0.45) !important; border-radius: 20px !important; }
          .tn-wallet span { color: #fff !important; }
          .tn-bell { background: rgba(255,255,255,0.18) !important; border: 1.5px solid rgba(255,255,255,0.35) !important; }
          .bell-dot { background: #FF5722 !important; }
          .botnav { background: #fff !important; border-top: 2px solid #BBDEFB !important; box-shadow: 0 -4px 16px rgba(21,101,192,0.10) !important; }
          .bn-item svg { color: #90CAF9; }
          .bn-item span:last-child { color: #555 !important; font-size: 10px !important; font-weight: 600 !important; font-family: sans-serif !important; letter-spacing: 0 !important; }
          .bn-item.active svg { color: #1565C0 !important; }
          .bn-item.active span:last-child { color: #1565C0 !important; font-weight: 700 !important; }
          .bn-item:hover { background: #EEF4FF !important; }
          .bn-item:hover svg { color: #1565C0 !important; }
          .home-circle { background: linear-gradient(135deg, #1565C0, #1E88E5) !important; box-shadow: 0 4px 16px rgba(21,101,192,0.45) !important; border: 3px solid #fff !important; }
          .notif-modal-header { background: linear-gradient(135deg, #1565C0, #1976D2) !important; }
        `}</style>

        {/* TOP NAV */}
        <div className="topnav">
          <div className="tn-left">
            {isSubPage
              ? <div className="back-btn" onClick={goBack} style={{ color:'#fff', fontSize:26, cursor:'pointer', padding:'4px 8px 4px 0' }}>‹</div>
              : <div className="hamburger" onClick={() => setDrawer(true)}><span/><span/><span/></div>
            }
            <span className="brand">{isSubPage ? (navTitle || 'BACK') : siteName}</span>
          </div>
          <div className="tn-right">
            {!isTxnTab && (
              <div className="tn-wallet" onClick={() => { fetchWallet(); setPage('wallet'); setTab('wallet'); }}>
                <span>💼</span>
                <span>Rs.{wallet.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
              </div>
            )}
            <div className="tn-bell" style={{ cursor:'pointer' }} onClick={() => {
              apiCall('/api/notices').then(res => {
                if (res?.success) setNoticesData(res.notices || []);
                setShowNotices(true);
              }).catch(() => setShowNotices(true));
            }}>
              🔔<div className="bell-dot"/>
            </div>
          </div>
        </div>

        {/* PAGES */}
        {page === 'home'       && <HomeScreen wallet={wallet} onAdd={() => setModal('add')} onWith={() => setModal('with')} onPlay={g => { 
    setSelectedGame(g); 
    setPage('game-types'); 
    setTab('game');
    window.scrollTo(0, 0);          // ✅ ADD KARO
    document.documentElement.scrollTop = 0;  // ✅ ADD KARO
  }} navigate={navigate} apiCall={apiCall} />}
        {page === 'profile'    && <ProfileScreen user={user} showToast={showToast} />}
        {page === 'game-types' && <GameTypePage game={selectedGame} onSelect={gt => { setSelectedType(gt); setPage('bet-form'); }} />}
        {page === 'bet-form'   && <BetForm game={selectedGame} gameType={selectedType} wallet={wallet} onSubmit={handleBidSubmit} />}
        {page === 'starline'   && <CategoryGamesScreen category="starline" onPlay={g => { setSelectedGame(g); setPage('game-types'); }} />}
        {page === 'jackpot'    && <CategoryGamesScreen category="jackpot" apiCategory="disawar" onPlay={g => { setSelectedGame(g); setPage('game-types'); }} />}
        {page === 'disawar'    && <CategoryGamesScreen category="disawar" onPlay={g => { setSelectedGame(g); setPage('game-types'); }} />}
        {page === 'bids'       && <BidsPage apiCall={apiCall}/>}
        {page === 'txns'       && <TxnsPage apiCall={apiCall} navigate={navigate}/>}
  {page === 'wallet' && <WalletPage wallet={wallet} onAdd={null} onWith={() => setModal('with')} user={user} navigate={navigate} apiCall={apiCall}/>}      {page === 'support'    && <SupportPage apiCall={apiCall} user={user} />}
        {page === 'htp'        && <HowToPlayPage onBack={() => setPage('home')} />}
          {page === 'download'   && <DownloadPage onBack={() => setPage('home')} user={user} />}
        {page === 'faq'        && <FAQPage onBack={() => setPage('home')} />}
        {page === 'terms'      && <TermsPage onBack={() => setPage('home')} />}
        {page === 'privacy'    && <PrivacyPage onBack={() => setPage('home')} />}
        {page === 'gamerates'  && <GameRatesPage onBack={() => setPage('home')} />}
        {page === 'referral'   && <ReferralPage apiCall={apiCall} user={user} onBack={() => setPage('wallet')} />}

        {/* BOTTOM NAV */}
        {!isSubPage && (
          <div className="botnav">
            <div className={`bn-item${tab==='txns'?' active':''}`} onClick={() => navigate('txns')}>
              <IconTransaction color={tab==='txns' ? '#1565C0' : '#90CAF9'} />
              <span>Transaction</span>
            </div>
            <div className={`bn-item${tab==='bids'?' active':''}`} onClick={() => navigate('bids')}>
              <IconBids color={tab==='bids' ? '#1565C0' : '#90CAF9'} />
              <span>My Bids</span>
            </div>
            <div className="bn-center" onClick={() => { setPage('home'); setTab('home'); setSelectedGame(null); setSelectedType(null); }}>
              <div className="home-circle"><IconHome size={26} color="white" /></div>
              <span style={{ color:tab==='home'?'#1565C0':'#555', fontSize:10, fontWeight:tab==='home'?700:600, marginTop:2 }}>Home</span>
            </div>
            <div className={`bn-item${tab==='wallet'?' active':''}`} onClick={() => navigate('wallet')}>
              <IconWallet color={tab==='wallet' ? '#1565C0' : '#90CAF9'} />
              <span>Funds</span>
            </div>
            <div className={`bn-item${tab==='support'?' active':''}`} onClick={() => { setPage('support'); setTab('support'); }}>
              <IconSupport color={tab==='support' ? '#1565C0' : '#90CAF9'} />
              <span>Support</span>
            </div>
          </div>
        )}

        {/* DRAWER */}
        {drawer && (
          <BlueDrawer user={user} wallet={wallet} onClose={() => setDrawer(false)} onNav={handleNav}
            onLogout={() => { localStorage.removeItem('mk_token'); setUser(null); setWallet(0); walletRef.current=0; setDrawer(false); }}
          />
        )}

        {modal === 'add' && <DepositModal apiCall={apiCall} onClose={() => { setModal(null); fetchWallet(); }} onSuccess={() => { fetchWallet(); }} />}
        {modal === 'with' && <WithdrawModal wallet={wallet} onClose={() => setModal(null)} onSuccess={handleWith}/>}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

        {/* NOTIFICATIONS */}
        {showNotices && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={() => setShowNotices(false)}>
            <div style={{ background:'#fff', width:'90%', maxWidth:350, borderRadius:16, overflow:'hidden', boxShadow:'0 8px 40px rgba(21,101,192,0.25)' }}
              onClick={e => e.stopPropagation()}>
              <div className="notif-modal-header" style={{ color:'#fff', padding:'14px 16px', fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:16 }}>🔔 Notifications</span>
                <span onClick={() => setShowNotices(false)} style={{ cursor:'pointer', fontSize:20 }}>✕</span>
              </div>
              <div style={{ padding:16, maxHeight:'60vh', overflowY:'auto' }}>
                {noticesData.length === 0 ? (
                  <div style={{ color:'#aaa', textAlign:'center', padding:'30px 20px', fontSize:14 }}>Abhi koi naya notification nahi hai.</div>
                ) : (
                  noticesData.map((n, i) => (
                    <div key={n.id || i} style={{ background:'#EEF4FF', padding:12, borderRadius:8, marginBottom:10, color:'#0D47A1', fontSize:13, borderLeft:'4px solid #1565C0', lineHeight:1.5 }}>
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
