import React, { useState } from 'react';

const APK_URL = '/app-debug.apk';
export default function DownloadPage({ onBack, user }) {
  const [status, setStatus] = useState('idle');

 const startDownload = () => {
  setStatus('downloading');
  const a = document.createElement('a');
  a.href = APK_URL;
  a.download = 'MatkaBoss.apk';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    setStatus('done');
  }, 1500);
};
  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'Nunito','Segoe UI',sans-serif", paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1565C0, #1976D2)',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '3px solid #0D47A1', boxShadow: '0 2px 12px rgba(21,101,192,0.35)'
      }}>
        <div onClick={onBack} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, color: '#fff'
        }}>←</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1.5 }}>📱 Download App</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 1 }}>Official MatKa Boss APK</div>
        </div>
        <div style={{
          background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)',
          borderRadius: 20, padding: '5px 12px', fontSize: 9, color: '#4ade80', fontWeight: 900
        }}>🔒 VERIFIED</div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* HERO CARD */}
        <div style={{
          background: '#fff', borderRadius: 20, overflow: 'hidden',
          border: '1.5px solid #BBDEFB', boxShadow: '0 4px 20px rgba(21,101,192,0.1)',
          marginBottom: 16
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1565C0, #1976D2)',
            padding: '24px 20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 60, marginBottom: 8 }}>👑</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>MATKA BOSS</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 4, letterSpacing: 2 }}>
              INDIA'S #1 MATKA PLATFORM
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 14px', marginTop: 10
            }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#FFD700' }}>4.5</span>
              <span style={{ color: '#FFD700', fontSize: 11 }}>★★★★★</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>2.27L reviews</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px', borderBottom: '1px solid #EEF4FF' }}>
            {[{n:'20+', l:'Games'},{n:'₹10', l:'Min Bet'},{n:'9x', l:'Max Win'},{n:'4.5★', l:'Rating'}].map((s,i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1565C0' }}>{s.n}</div>
                <div style={{ fontSize: 9, color: '#888', fontWeight: 700, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* INSTALL BUTTON */}
          <div style={{ padding: '16px' }}>
            {status === 'idle' && (
              <button onClick={startDownload} style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 900, letterSpacing: 1.5,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 16px rgba(34,197,94,0.3)'
              }}>
                <span style={{ fontSize: 20 }}>⬇</span> INSTALL NOW — FREE
              </button>
            )}
            {status === 'downloading' && (
              <div style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, #1565C0, #1976D2)',
                color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 16px rgba(21,101,192,0.3)'
              }}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                DOWNLOADING...
              </div>
            )}
            {status === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  width: '100%', padding: '15px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 900,
                  textAlign: 'center', boxShadow: '0 4px 16px rgba(34,197,94,0.3)'
                }}>✅ DOWNLOADED — Open file to install!</div>
                <button onClick={() => setStatus('idle')} style={{
                  width: '100%', padding: '10px',
                  background: '#EEF4FF', border: '1px solid #BBDEFB',
                  borderRadius: 10, color: '#1565C0', fontWeight: 800,
                  fontSize: 12, cursor: 'pointer'
                }}>📥 Download Again</button>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10,
              fontSize: 10, color: '#888', fontWeight: 700
            }}>
              <span>🔒 Safe</span><span>✅ Verified</span><span>📱 Android</span><span>📦 15 MB</span>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #BBDEFB', padding: '16px', marginBottom: 16, boxShadow: '0 2px 10px rgba(21,101,192,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#1565C0', marginBottom: 12, letterSpacing: 1 }}>⭐ Why MATKA BOSS?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              {icon:'🎮', title:'20+ Games', desc:'Kalyan, Mumbai'},
              {icon:'⚡', title:'Instant Pay', desc:'UPI in 2 min'},
              {icon:'🏆', title:'9x-10000x', desc:'Highest payouts'},
              {icon:'💰', title:'₹10 Min', desc:'Start small'},
              {icon:'🔒', title:'100% Safe', desc:'Encrypted'},
              {icon:'📊', title:'Live Result', desc:'Real-time'},
            ].map((f,i) => (
              <div key={i} style={{
                background: '#EEF4FF', border: '1px solid #BBDEFB',
                borderRadius: 12, padding: '12px 6px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 900, color: '#1565C0', marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 8, color: '#888', fontWeight: 600, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW TO INSTALL */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #BBDEFB', padding: '16px', marginBottom: 16, boxShadow: '0 2px 10px rgba(21,101,192,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#1565C0', marginBottom: 12, letterSpacing: 1 }}>📲 How to Install</div>
          {[
            {step:'1', title:'Tap INSTALL NOW', desc:'Green button pe click karo — APK download hoga'},
            {step:'2', title:'Open Downloaded File', desc:'Notification panel ya File Manager mein jao'},
            {step:'3', title:'Allow Unknown Sources', desc:'Settings → "Install unknown apps" → Allow karo'},
            {step:'4', title:'Install & Play! 🎮', desc:'App install hoga — kholo aur game shuru karo!'},
          ].map((s,i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10,
              background: '#EEF4FF', border: '1px solid #BBDEFB',
              borderRadius: 12, padding: '12px 14px'
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1565C0, #1976D2)',
                color: '#fff', fontWeight: 900, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0D47A1', marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 600, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WARNING */}
        <div style={{
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 14, padding: 14, marginBottom: 16,
          display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, lineHeight: 1.6 }}>
            Official website se hi download karo. Kisi aur source se download mat karo. 18+ Only. Play Responsibly.
          </span>
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #BBDEFB' }}>
          <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, letterSpacing: 1 }}>
            18+ Only · Play Responsibly · © 2026 Matka BOSS
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
