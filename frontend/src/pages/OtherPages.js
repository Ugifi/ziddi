import React, { useState, useEffect } from 'react';


// ── BLUE THEME SHARED STYLES ──
const B = {
  page:      { background: '#eef2f7', minHeight: '100vh', paddingBottom: 80, color: '#222', fontFamily: '"Nunito", "Segoe UI", sans-serif' },
  header:    { background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e2e9f4', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px rgba(26,58,110,0.06)' },
  headerTxt: { fontSize: 18, fontWeight: 900, color: '#0d1f40', letterSpacing: 1 },
  card:      { background: '#fff', borderRadius: 16, border: '1.5px solid #e2e9f4', boxShadow: '0 4px 14px rgba(26,58,110,0.07)', margin: '12px', padding: '16px' },
  label:     { fontSize: 11, color: '#2a6dd9', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, display: 'block', marginLeft: 4 },
  input:     { width: '100%', background: '#f4f7fd', border: '2px solid #d0daea', borderRadius: 12, padding: '14px', color: '#0d1f40', fontSize: 15, fontWeight: 600, outline: 'none', marginBottom: 16, boxSizing: 'border-box', transition: 'border 0.2s', fontFamily: 'inherit' },
  btn:       { width: '100%', background: 'linear-gradient(135deg, #1e4fa0, #2a6dd9)', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', boxShadow: '0 6px 20px rgba(30,79,160,0.3)' },
  badge:     (color) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: color === 'green' ? 'rgba(30,138,60,0.15)' : color === 'red' ? 'rgba(192,57,43,0.15)' : 'rgba(42,109,217,0.15)', color: color === 'green' ? '#1e8a3c' : color === 'red' ? '#c0392b' : '#2a6dd9' }),
};

function SubHeader({ title, onBack, rightBtn }) {
  return (
    <div style={B.header}>
      {onBack && <div onClick={onBack} style={{ fontSize: 26, cursor: 'pointer', color: '#2a6dd9', lineHeight: 1, fontWeight: 300 }}>‹</div>}
      <div style={{ ...B.headerTxt, flex: 1 }}>{title}</div>
      {rightBtn}
    </div>
  );
}

// ── DEPOSIT MODAL — REPLACE ONLY THIS FUNCTION IN OtherPages.js ──────────────
export function DepositModal({ onClose, apiCall, onSuccess }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState('');
  const [whatsapp, setWhatsapp] = useState('9999999999');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [upiCopied, setUpiCopied] = useState(false);

  const presets = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/payment-info').then(res => {
      if (res?.success && res?.data?.upi_id) {
        const s = res.data;
        setUpiId(s.upi_id);
        if (s.whatsapp_support) setWhatsapp(s.whatsapp_support);
        if (s.qr_image) {
          setQrUrl(s.qr_image);
        } else {
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${s.upi_id}&pn=${s.upi_name || 'MatkaKing'}&cu=INR`)}`);
        }
      } else {
        apiCall('/api/admin/settings').then(res2 => {
          if (res2?.success && res2?.settings?.upi_id) {
            const s = res2.settings;
            setUpiId(s.upi_id);
            if (s.whatsapp || s.whatsapp_support) setWhatsapp(s.whatsapp || s.whatsapp_support);
            if (s.qr_image) {
              setQrUrl(s.qr_image);
            } else {
              setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${s.upi_id}&pn=${s.upi_name || 'MatkaKing'}&cu=INR`)}`);
            }
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [apiCall]);

  const handleNext = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { setMsg({ type: 'err', text: '❌ Minimum deposit ₹100 hai' }); return; }
    if (amt > 100000)      { setMsg({ type: 'err', text: '❌ Maximum deposit ₹1,00,000 hai' }); return; }
    setMsg({ type: '', text: '' });
    setStep(2);
  };

  const copyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).then(() => {
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    });
  };

  const openWhatsApp = () => {
    const num = whatsapp.replace(/\D/g, '');
    const msg91 = `91${num}`;
    const text = encodeURIComponent(
      `💰 *Deposit Request*\n\nAmount: ₹${amount}\nUTR/Transaction ID: ${utr || 'XXXXXXXX'}\n\nKripya jaldi approve karein 🙏`
    );
    window.open(`https://wa.me/${msg91}?text=${text}`, '_blank');
  };

  const handleSubmitUTR = async () => {
    if (!utr || utr.trim().length < 6) { setMsg({ type: 'err', text: '❌ Valid Transaction Number / UTR daalo' }); return; }
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const res = await apiCall('/api/wallet/deposit', 'POST', {
        amount: parseFloat(amount),
        transaction_id: utr.trim(),
        payment_method: 'upi'
      });
      if (res?.success) {
        setMsg({ type: 'ok', text: '✅ Request submit ho gayi! Admin 15-30 min mein approve karega.' });
        setTimeout(() => { onSuccess && onSuccess(); onClose(); }, 2500);
      } else {
        setMsg({ type: 'err', text: res?.message || '❌ Request submit nahi hui' });
      }
    } catch { setMsg({ type: 'err', text: '❌ Server se connect nahi ho pa raha' }); }
    finally { setLoading(false); }
  };

  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backdropFilter: 'blur(3px)',
  };

  const sheetStyle = {
    background: '#fff',
    borderRadius: '24px 24px 0 0',
    width: '100%',
    maxWidth: 520,
    maxHeight: '94vh',
    overflowY: 'auto',
    paddingBottom: 40,
    boxShadow: '0 -12px 50px rgba(0,0,0,0.25)',
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 44, height: 5, background: '#d0daea', borderRadius: 10 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 18px' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0d1f40' }}>
              {step === 1 ? '💰 Add Money' : `📱 Pay ₹${parseFloat(amount).toLocaleString('en-IN')}`}
            </div>
            <div style={{ fontSize: 12, color: '#8a9bb5', marginTop: 2, fontWeight: 600 }}>
              {step === 1 ? 'Select ya type karo amount' : 'UPI se payment karo'}
            </div>
          </div>
          <div onClick={onClose} style={{ width: 36, height: 36, background: '#eef2f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#8a9bb5', fontWeight: 700 }}>✕</div>
        </div>

        {/* ── STEP 1: Amount ── */}
        {step === 1 && (
          <div style={{ padding: '0 22px' }}>

            {/* Preset buttons */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Quick Amount</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
              {presets.map(p => (
                <button key={p} onClick={() => setAmount(String(p))}
                  style={{
                    padding: '14px 0', borderRadius: 14, cursor: 'pointer',
                    fontWeight: 800, fontSize: 15,
                    background: amount === String(p) ? 'linear-gradient(135deg,#1e4fa0,#2a6dd9)' : '#f4f7fd',
                    color: amount === String(p) ? '#fff' : '#0d1f40',
                    border: amount === String(p) ? 'none' : '2px solid #e2e9f4',
                    boxShadow: amount === String(p) ? '0 4px 14px rgba(30,79,160,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                  ₹{p.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Custom Amount</div>
            <div style={{ position: 'relative', marginBottom: 18 }}>
              <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 20, fontWeight: 900, color: '#2a6dd9' }}>₹</div>
              <input
                style={{ width: '100%', background: '#f4f7fd', border: '2px solid #d0daea', borderRadius: 14, padding: '16px 18px 16px 40px', color: '#0d1f40', fontSize: 20, fontWeight: 900, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                type="number" placeholder="0" value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            {/* Min/Max info */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[{ l: 'Min Deposit', v: '₹100' }, { l: 'Max Deposit', v: '₹1,00,000' }].map((x, i) => (
                <div key={i} style={{ flex: 1, background: '#eef2f7', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#8a9bb5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{x.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#0d1f40', marginTop: 2 }}>{x.v}</div>
                </div>
              ))}
            </div>

            {msg.text && (
              <div style={{ background: msg.type === 'ok' ? '#e8f5e9' : '#fdecea', border: `1.5px solid ${msg.type === 'ok' ? '#a5d6a7' : '#f5c6cb'}`, borderRadius: 12, padding: '13px 16px', marginBottom: 18, color: msg.type === 'ok' ? '#1e8a3c' : '#c0392b', fontSize: 13, fontWeight: 700 }}>
                {msg.text}
              </div>
            )}

            <button onClick={handleNext}
              style={{ width: '100%', background: 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', color: '#fff', border: 'none', borderRadius: 16, padding: '17px', fontSize: 16, fontWeight: 900, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(30,79,160,0.35)' }}>
              PROCEED TO PAY →
            </button>
            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#8a9bb5', fontWeight: 600 }}>
              ⏰ Approval time: 15–30 minutes
            </div>
          </div>
        )}

        {/* ── STEP 2: Pay ── */}
        {step === 2 && (
          <div style={{ padding: '0 22px' }}>

            {/* Amount banner */}
            <div style={{ background: 'linear-gradient(135deg,#1a3a6e,#2a6dd9)', borderRadius: 18, padding: '20px', textAlign: 'center', marginBottom: 22 }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4, fontWeight: 700 }}>Pay Amount</div>
              <div style={{ color: '#fff', fontSize: 40, fontWeight: 900, letterSpacing: -1 }}>₹{parseFloat(amount).toLocaleString('en-IN')}</div>
            </div>

            {/* QR Code */}
            {qrUrl && (
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ background: '#fff', border: '2px solid #e2e9f4', borderRadius: 22, display: 'inline-block', padding: 16, boxShadow: '0 6px 24px rgba(26,58,110,0.13)' }}>
                  <img src={qrUrl} alt="UPI QR" style={{ width: 210, height: 210, display: 'block' }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: '#8a9bb5', fontWeight: 600 }}>📷 Scan karo → Pay karo</div>
              </div>
            )}

            {/* UPI ID */}
            {upiId && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>UPI ID</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f4f7fd', border: '2px solid #d0daea', borderRadius: 16, padding: '14px 16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#8a9bb5', fontWeight: 600, marginBottom: 3 }}>Pay to</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#0d1f40', letterSpacing: 0.3 }}>{upiId}</div>
                  </div>
                  <button onClick={copyUpi}
                    style={{ padding: '11px 18px', background: upiCopied ? 'linear-gradient(135deg,#1e8a3c,#27ae60)' : 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(30,79,160,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {upiCopied ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Steps */}
            <div style={{ background: '#f4f7fd', borderRadius: 16, padding: '16px 18px', marginBottom: 20, border: '1.5px solid #e2e9f4' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>📋 Payment Steps</div>
              {[
                { n: '1', t: 'QR scan karo ya UPI ID copy karo' },
                { n: '2', t: `₹${parseFloat(amount).toLocaleString('en-IN')} pay karo apne UPI app se` },
                { n: '3', t: 'Transaction Number / UTR note karo' },
                { n: '4', t: 'Neeche UTR daalo aur submit karo' },
                { n: '5', t: 'WhatsApp par admin ko screenshot bhejo', highlight: true },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 4 ? 12 : 0, padding: s.highlight ? '10px 12px' : '0', background: s.highlight ? 'rgba(37,211,102,0.1)' : 'transparent', borderRadius: s.highlight ? 12 : 0, border: s.highlight ? '1.5px solid rgba(37,211,102,0.3)' : 'none' }}>
                  <div style={{ width: 26, height: 26, background: s.highlight ? 'linear-gradient(135deg,#25D366,#128C7E)' : 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: s.highlight ? '#128C7E' : '#0d1f40', fontWeight: s.highlight ? 800 : 600, paddingTop: 3 }}>{s.t}</div>
                </div>
              ))}
            </div>

            {/* ✅ WhatsApp Button */}
            <button onClick={openWhatsApp}
              style={{ width: '100%', background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 900, cursor: 'pointer', letterSpacing: 0.5, boxShadow: '0 8px 24px rgba(37,211,102,0.35)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              WHATSAPP PAR ADMIN KO BHEJO
            </button>

            {/* UTR Input */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Transaction Number / UTR *</div>
            <input
              style={{ width: '100%', background: '#f4f7fd', border: '2px solid #d0daea', borderRadius: 14, padding: '15px 16px', color: '#0d1f40', fontSize: 15, fontWeight: 700, outline: 'none', marginBottom: 16, boxSizing: 'border-box', fontFamily: 'inherit' }}
              placeholder="12-digit transaction number" value={utr}
              onChange={e => setUtr(e.target.value)} maxLength={20}
            />

            {/* Info strip */}
            <div style={{ background: '#eef2f7', borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, color: '#1e8a3c', fontWeight: 700 }}>✅ Pay karke UTR daalo aur submit karo</div>
              <div style={{ fontSize: 12, color: '#e74c3c', fontWeight: 700 }}>⏰ Approval: 15–30 minutes</div>
              <div style={{ fontSize: 12, color: '#128C7E', fontWeight: 700 }}>💬 Fast approval ke liye WhatsApp par screenshot bhejo</div>
            </div>

            {msg.text && (
              <div style={{ background: msg.type === 'ok' ? '#e8f5e9' : '#fdecea', border: `1.5px solid ${msg.type === 'ok' ? '#a5d6a7' : '#f5c6cb'}`, borderRadius: 12, padding: '13px 16px', marginBottom: 18, color: msg.type === 'ok' ? '#1e8a3c' : '#c0392b', fontSize: 13, fontWeight: 700 }}>
                {msg.text}
              </div>
            )}

            <button onClick={handleSubmitUTR} disabled={loading}
              style={{ width: '100%', background: loading ? '#ccc' : 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', color: '#fff', border: 'none', borderRadius: 16, padding: '17px', fontSize: 16, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1, textTransform: 'uppercase', boxShadow: loading ? 'none' : '0 8px 24px rgba(30,79,160,0.35)', marginBottom: 12 }}>
              {loading ? '⏳ Submitting...' : '✅ SUBMIT UTR'}
            </button>

            <button onClick={() => { setStep(1); setMsg({ type: '', text: '' }); }}
              style={{ width: '100%', padding: '14px', background: 'transparent', border: '2px solid #e2e9f4', borderRadius: 14, color: '#8a9bb5', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
              ← Amount Change Karo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// ── MY BIDS PAGE ──
export function BidsPage({ apiCall }) {
  const [bids, setBids] = useState([]);
  const [summary, setSummary] = useState({ total_bids: 0, won_bids: 0, lost_bids: 0, pending_bids: 0, total_win_amount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/games/bids/my').then(res => {
        if (res.success) {
          if (res.bids) setBids(res.bids);
          if (res.summary) setSummary(res.summary);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [apiCall]);

  const winAmt = Number(summary.total_win_amount || 0);
  const statCards = [
    { icon: '🎯', val: summary.total_bids || 0,   label: 'Total Bids', color: '#2a6dd9' },
    { icon: '🏆', val: summary.won_bids || 0,     label: 'Won',        color: '#1e8a3c' },
    { icon: '💔', val: summary.lost_bids || 0,    label: 'Lost',       color: '#c0392b' },
    { icon: '⏳', val: summary.pending_bids || 0, label: 'Pending',    color: '#f0a500' },
  ];

  return (
    <div style={B.page}>
      <SubHeader title="🎯 My Bids" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1.5px solid #e2e9f4', borderTop: `3px solid ${s.color}`, boxShadow: '0 2px 8px rgba(26,58,110,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#8a9bb5', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ margin: '10px 12px 0', background: '#e8f5e9', border: '1.5px solid #a5d6a7', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#1e8a3c', fontWeight: 800, fontSize: 14 }}>💰 Total Winnings</span>
        <span style={{ color: '#1e8a3c', fontWeight: 900, fontSize: 18 }}>₹{winAmt.toLocaleString('en-IN')}</span>
      </div>
      <div style={{ padding: '16px 12px 8px', fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5 }}>🎮 Recent Bids</div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#8a9bb5' }}>⏳ Loading bids...</div>
      ) : bids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#8a9bb5' }}>📭 No bids yet</div>
      ) : (
        <div style={{ padding: '0 12px' }}>
          {bids.map(b => {
            const amount = Number(b.amount || 0);
            const winning = Number(b.win_amount || b.potential_winning || 0);
            const clr = b.status === 'win' ? '#1e8a3c' : b.status === 'loss' ? '#c0392b' : '#f0a500';
            return (
              <div key={b.id} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, border: '1.5px solid #e2e9f4', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(26,58,110,0.06)', borderLeft: `4px solid ${clr}` }}>
                <div style={{ width: 40, height: 40, background: '#eef2f7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#0d1f40', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.game_name} — {b.game_type}</div>
                  <div style={{ fontSize: 11, color: '#8a9bb5', marginTop: 3 }}>#{b.number} · {new Date(b.created_at).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: clr, marginBottom: 4 }}>
                    {b.status === 'win' ? `+₹${winning.toLocaleString('en-IN')}` : `₹${amount.toLocaleString('en-IN')}`}
                  </div>
                  <span style={B.badge(b.status === 'win' ? 'green' : b.status === 'loss' ? 'red' : 'blue')}>{b.status?.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TRANSACTIONS PAGE ──
export function TxnsPage({ apiCall, navigate }) {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => { fetchTxns(); }, []);

  const fetchTxns = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiCall('/api/wallet/transactions');
      const list = res?.transactions || res?.data || res || [];
      setTxns(Array.isArray(list) ? list : []);
    } catch { setError('Transactions load nahi hui. Dobara try karo.'); }
    finally { setLoading(false); }
  };

  const typeLabel = (type) => ({
    deposit: '💰 Deposit', withdrawal: '🏦 Withdrawal', withdraw: '🏦 Withdrawal',
    bid: '🎯 Bid', winning: '🏆 Winning', win: '🏆 Winning',
    refund: '↩️ Refund', bonus: '🎁 Bonus', referral: '🤝 Referral Bonus',
    credit: '⬆️ Credit', debit: '⬇️ Debit'
  })[type?.toLowerCase()] || `📋 ${type || 'Transaction'}`;

  const isCredit = (tx) => {
    if (tx.type === 'credit') return true;
    if (tx.type === 'debit') return false;
    return ['deposit', 'winning', 'win', 'refund', 'bonus', 'referral'].includes(tx.type?.toLowerCase());
  };

  const filtered = filter === 'all' ? txns : filter === 'credit' ? txns.filter(t => isCredit(t)) : txns.filter(t => !isCredit(t));
  const totalCredit = txns.filter(t => isCredit(t)).reduce((a, t) => a + Math.abs(Number(t.amount || 0)), 0);
  const totalDebit  = txns.filter(t => !isCredit(t)).reduce((a, t) => a + Math.abs(Number(t.amount || 0)), 0);

  return (
    <div style={B.page}>
      <SubHeader title="💳 Transactions" onBack={navigate ? () => navigate('wallet') : null}
        rightBtn={<button onClick={fetchTxns} style={{ background: '#eef2f7', border: '1px solid #d0daea', color: '#2a6dd9', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>🔄</button>}
      />
      {!loading && txns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1.5px solid #e2e9f4', borderLeft: '4px solid #1e8a3c', boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
            <div style={{ fontSize: 10, color: '#8a9bb5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Credit</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e8a3c' }}>+₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1.5px solid #e2e9f4', borderLeft: '4px solid #c0392b', boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
            <div style={{ fontSize: 10, color: '#8a9bb5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Debit</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#c0392b' }}>-₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, padding: '16px 12px' }}>
        {[['all', 'All'], ['credit', 'Credit ⬆️'], ['debit', 'Debit ⬇️']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', background: filter === val ? 'linear-gradient(135deg,#1e4fa0,#2a6dd9)' : '#fff', color: filter === val ? '#fff' : '#8a9bb5', border: filter === val ? 'none' : '1.5px solid #e2e9f4', transition: 'all 0.2s', boxShadow: filter === val ? '0 4px 12px rgba(30,79,160,0.25)' : 'none' }}>{label}</button>
        ))}
      </div>
      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#8a9bb5' }}>⏳ Loading...</div>}
      {!loading && error && <div style={{ textAlign: 'center', padding: 40, color: '#c0392b' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#8a9bb5' }}>📭 No transactions found</div>}
      <div style={{ padding: '0 12px' }}>
        {filtered.map((tx, i) => {
          const credit = isCredit(tx);
          const amount = Math.abs(Number(tx.amount ?? tx.amt ?? 0));
          const balAfter = tx.balance_after ?? tx.closing_balance ?? null;
          return (
            <div key={tx.id || i} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #e2e9f4', borderLeft: `4px solid ${credit ? '#1e8a3c' : '#c0392b'}`, boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: credit ? '#e8f5e9' : '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{credit ? '⬆️' : '⬇️'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 14, marginBottom: 3 }}>{typeLabel(tx.type)}</div>
                <div style={{ fontSize: 11, color: '#8a9bb5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.note || '—'}</div>
                <div style={{ fontSize: 10, color: '#8a9bb5', marginTop: 3 }}>{tx.created_at ? new Date(tx.created_at).toLocaleString('en-IN') : '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: credit ? '#1e8a3c' : '#c0392b' }}>{credit ? '+' : '-'}₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                {balAfter !== null && <div style={{ fontSize: 10, color: '#8a9bb5', marginTop: 3 }}>Bal: ₹{Number(balAfter).toLocaleString('en-IN')}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {!loading && filtered.length > 0 && <div style={{ textAlign: 'center', padding: '12px 0 24px', fontSize: 11, color: '#8a9bb5' }}>{filtered.length} transactions</div>}
    </div>
  );
}

// ── REFERRAL PAGE ──
export function ReferralPage({ apiCall, user, onBack }) {
  const [referralData, setReferralData] = useState({ referral_code: '', total_referrals: 0, pending_bonus: 0, total_earned: 0, referrals: [] });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState(window.location.origin);

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(res => {
      if (res?.success && res?.settings?.site_url) {
        setSiteUrl(res.settings.site_url.replace(/\/$/, ''));
      }
    }).catch(() => {});
    apiCall('/api/auth/referral-stats').then(res => {
      if (res?.success) setReferralData(res.data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [apiCall]);

  const SITE_URL = siteUrl;
  const referralCode = referralData.referral_code || user?.referral_code || '';
  const referralLink = `${SITE_URL}?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MatkaKing — Join & Win!',
        text: `MatkaKing pe join karo! Mera referral code use karo: ${referralCode} aur dono ko ₹50 bonus milega! 🎉`,
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  return (
    <div style={B.page}>
      <SubHeader title="🎁 Refer & Earn" onBack={onBack} />
      <div style={{ background: 'linear-gradient(135deg, #1a3a6e, #2a6dd9)', margin: '16px 12px', borderRadius: 20, padding: '24px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(30,79,160,0.25)' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎁</div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Dono ko ₹50 Bonus!</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, fontWeight: 600 }}>
          Apna referral code share karo<br />Dono ko ₹50 milega jab wo pehli baar deposit karein ✅
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          {[
            { val: referralData.total_referrals || 0, label: 'Total Referrals' },
            { val: `₹${Number(referralData.total_earned || 0).toLocaleString('en-IN')}`, label: 'Total Earned' },
            { val: `₹${Number(referralData.pending_bonus || 0).toLocaleString('en-IN')}`, label: 'Pending' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontWeight: 700 }}>{s.label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={B.card}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>🔑 Aapka Referral Code</div>
        <div style={{ background: '#eef2f7', borderRadius: 14, padding: '18px', textAlign: 'center', border: '2px dashed #2a6dd9', marginBottom: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0d1f40', letterSpacing: 4 }}>
            {loading ? (
              <span style={{ fontSize: 14, color: '#8a9bb5', letterSpacing: 1 }}>⏳ Loading...</span>
            ) : referralCode ? referralCode : (
              <span style={{ fontSize: 13, color: '#c0392b' }}>❌ Code nahi mila — logout karke login karo</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyCode} style={{ flex: 1, padding: '14px', background: copied ? '#e8f5e9' : '#eef2f7', border: `1.5px solid ${copied ? '#a5d6a7' : '#d0daea'}`, borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', color: copied ? '#1e8a3c' : '#0d1f40', transition: 'all 0.2s' }}>
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
          <button onClick={shareLink} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', color: '#fff', boxShadow: '0 4px 12px rgba(30,79,160,0.3)' }}>
            🔗 Share Link
          </button>
        </div>
      </div>

      <div style={{ margin: '0 12px', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e9f4', overflow: 'hidden', boxShadow: '0 4px 14px rgba(26,58,110,0.07)', marginBottom: 12 }}>
        <div style={{ padding: '14px 16px', background: '#eef2f7', borderBottom: '1px solid #e2e9f4', fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5 }}>📋 Kaise Kaam Karta Hai?</div>
        {[
          { n: '1', t: 'Code Share Karo', d: 'Apna referral code ya link dosto ko bhejo' },
          { n: '2', t: 'Dost Join Kare', d: 'Wo register karte waqt aapka code daale' },
          { n: '3', t: 'Pehla Deposit Kare', d: 'Dost pehli baar deposit kare aur admin approve kare' },
          { n: '4', t: 'Dono Ko ₹50 Mile', d: 'Aapko aur aapke dost — dono ko ₹50 wallet mein credit!' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < 3 ? '1px solid #e2e9f4' : 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 14 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: '#8a9bb5', marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && referralData.referrals && referralData.referrals.length > 0 && (
        <div style={{ margin: '0 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>👥 Mere Referrals</div>
          {referralData.referrals.map((r, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px', marginBottom: 8, border: '1.5px solid #e2e9f4', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(26,58,110,0.06)', borderLeft: `4px solid ${r.status === 'credited' ? '#1e8a3c' : '#f0a500'}` }}>
              <div style={{ width: 40, height: 40, background: '#eef2f7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 14 }}>{r.joiner_name || 'User'}</div>
                <div style={{ fontSize: 11, color: '#8a9bb5', marginTop: 2 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: r.status === 'credited' ? '#1e8a3c' : '#f0a500' }}>₹{Number(r.bonus_amount || 50).toLocaleString('en-IN')}</div>
                <span style={B.badge(r.status === 'credited' ? 'green' : 'blue')}>{r.status === 'credited' ? 'CREDITED' : 'PENDING'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (!referralData.referrals || referralData.referrals.length === 0) && (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#8a9bb5' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Abhi tak koi referral nahi</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Apna code share karo aur ₹50 kamao!</div>
        </div>
      )}
    </div>
  );
}

// ── WALLET PAGE ──
export function WalletPage({ wallet, onAdd, onWith, user, navigate, apiCall }) {
  const [stats, setStats] = useState({ highest_win: 0, total_bids: 0, games_won: 0, avg_bid: 0 });
  const [showDeposit, setShowDeposit] = useState(false);

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/auth/profile').then(res => {
        if (res?.success && res?.user) {
          setStats({ highest_win: res.user.highest_win || 0, total_bids: res.user.total_bids || 0, games_won: res.user.games_won || 0, avg_bid: res.user.avg_bid || 0 });
        }
      }).catch(() => {});
    }
  }, [apiCall]);

  const handleAdd = () => setShowDeposit(true);

  return (
    <div style={B.page}>
      <SubHeader title="💰 My Wallet" />
      {showDeposit && (
        <DepositModal apiCall={apiCall} onClose={() => setShowDeposit(false)} onSuccess={() => { onAdd && onAdd(); }} />
      )}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6e, #2a6dd9)', padding: '28px 20px', textAlign: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 20px rgba(30,79,160,0.25)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Total Balance</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: -1 }}>₹{wallet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={handleAdd} style={{ flex: 1, maxWidth: 150, background: '#fff', color: '#1e4fa0', border: 'none', borderRadius: 30, padding: '14px 0', fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', textTransform: 'uppercase' }}>💰 Add Money</button>
          <button onClick={onWith} style={{ flex: 1, maxWidth: 150, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 30, padding: '14px 0', fontWeight: 900, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase' }}>💸 Withdraw</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 24, paddingTop: 16 }}>
          {[
            { label: 'Total Added', val: '₹' + Number(user?.total_deposited || 0).toLocaleString('en-IN') },
            { label: 'Total Won',   val: '₹' + Number(user?.total_won || 0).toLocaleString('en-IN') },
            { label: 'Withdrawn',   val: '₹' + Number(user?.total_withdrawn || 0).toLocaleString('en-IN') },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', margin: '0 12px 16px', borderRadius: 16, border: '1.5px solid #e2e9f4', overflow: 'hidden', boxShadow: '0 4px 14px rgba(26,58,110,0.07)' }}>
        {[
          { ic: '💰', l: 'Add Fund',           sub: 'UPI, Net Banking, Cards',  fn: handleAdd },
          { ic: '💸', l: 'Withdraw Fund',       sub: 'Bank Transfer, UPI',       fn: onWith },
          { ic: '📋', l: 'Transaction History', sub: 'All credits & debits',     fn: () => navigate && navigate('txns') },
          { ic: '🎁', l: 'Refer & Earn',        sub: 'Dono ko ₹50 bonus on first deposit', fn: () => navigate && navigate('referral') },
        ].map((item, i) => (
          <div key={i} onClick={item.fn}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderBottom: i < 3 ? '1px solid #e2e9f4' : 'none', cursor: item.fn ? 'pointer' : 'default', transition: 'background 0.2s' }}
            onMouseEnter={e => { if (item.fn) e.currentTarget.style.background = '#eef2f7'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ width: 42, height: 42, background: '#eef2f7', border: '1.5px solid #d0daea', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 15 }}>{item.l}</div>
              <div style={{ fontSize: 11, color: '#8a9bb5', marginTop: 3 }}>{item.sub}</div>
            </div>
            <div style={{ color: '#2a6dd9', fontSize: 24 }}>›</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>📈 Your Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
        {[
          { val: '₹' + Number(stats.highest_win).toLocaleString('en-IN'), label: 'HIGHEST WIN', color: '#1e8a3c' },
          { val: String(stats.total_bids),                                 label: 'TOTAL BIDS',  color: '#2a6dd9' },
          { val: String(stats.games_won),                                  label: 'GAMES WON',   color: '#1e8a3c' },
          { val: '₹' + Number(stats.avg_bid).toLocaleString('en-IN'),      label: 'AVG BID',     color: '#2a6dd9' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1.5px solid #e2e9f4', borderTop: `3px solid ${s.color}`, boxShadow: '0 2px 8px rgba(26,58,110,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#8a9bb5', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOW TO PLAY ──
export function HowToPlayPage({ onBack }) {
  return (
    <div style={B.page}>
      <SubHeader title="📖 How to Play" onBack={onBack} />
      <div style={{ padding: '0 12px 20px' }}>
        <div style={{ fontSize: 14, color: '#8a9bb5', padding: '16px 4px', lineHeight: 1.6, fontWeight: 500 }}>Matka ek number guessing game hai. Open aur close numbers pe bet lagao aur jeeto!</div>
        {[
          { n: '1', t: 'Wallet Mein Paisa Daalo',  d: 'UPI se deposit karo, admin 15–30 min mein approve karega.' },
          { n: '2', t: 'Game Chunno',               d: 'Home screen se koi bhi open game chunno — Kalyan, Milan Day, etc.' },
          { n: '3', t: 'Game Type Chunno',          d: 'Single Digit, Jodi, Pana, Sangam — apni marzi ka game type.' },
          { n: '4', t: 'Number & Amount Daalo',     d: 'Lucky number chunno aur bet amount daalo. Minimum ₹10.' },
          { n: '5', t: 'Bid Place Karo',            d: 'Place Bid dabao. Amount wallet se turant cut ho jaayega.' },
          { n: '6', t: 'Result Ka Intezaar Karo',   d: 'Result aane ke baad winning amount winning wallet mein credit hogi.' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #e2e9f4', display: 'flex', gap: 14, boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1e4fa0,#2a6dd9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0, boxShadow: '0 4px 10px rgba(30,79,160,0.35)' }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 15, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: '#8a9bb5', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, margin: '20px 4px 12px' }}>🎮 Multipliers</div>
        {[
          { type: 'Single Digit', mult: '9x' },
          { type: 'Jodi',         mult: '90x' },
          { type: 'Single Pana',  mult: '150x' },
          { type: 'Double Pana',  mult: '300x' },
          { type: 'Triple Pana',  mult: '600x' },
          { type: 'Half Sangam',  mult: '1500x' },
          { type: 'Full Sangam',  mult: '10000x' },
        ].map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8, border: '1.5px solid #e2e9f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
            <div style={{ fontWeight: 700, color: '#0d1f40', fontSize: 15 }}>{g.type}</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#1e8a3c' }}>{g.mult}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ ──
export function FAQPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'Account kaise banayein?',             a: 'App ke login page pe "Register" dabao. Mobile number aur password se account bana sakte ho.' },
    { q: 'Paisa kaise add karein?',             a: 'Wallet → Add Money → UPI se payment → UTR submit karo → Admin 15–30 min mein approve karega.' },
    { q: 'Minimum deposit kitna hai?',          a: 'Minimum deposit ₹100 hai. Maximum ₹1,00,000 tak kar sakte hain.' },
    { q: 'Winning kaise withdraw karein?',      a: 'Winning Balance → Withdraw → UPI ya Bank details daalo → Admin approve karega. Min ₹500.' },
    { q: 'Result kab aata hai?',                a: 'Har game ka alag result time hota hai. Game card pe time dikh jaata hai.' },
    { q: 'Bid cancel ho sakti hai?',            a: 'Nahi. Ek baar bid place hone ke baad cancel nahi hogi.' },
    { q: 'Ek se zyada account ban sakta hai?',  a: 'Nahi. Ek mobile number pe sirf ek account allowed hai.' },
    { q: 'Referral bonus kab milega?',          a: 'Jab aapka referral pehli baar deposit kare aur admin approve kare — dono ko ₹50 turant credit ho jaayega.' },
    { q: 'Koi problem ho toh kya karein?',      a: 'Support page pe jaao. Call ya Telegram se contact karo. Mon–Sat 10AM–8PM.' },
  ];
  return (
    <div style={B.page}>
      <SubHeader title="❓ FAQ" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {faqs.map((f, i) => (
          <div key={i}
            style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #e2e9f4', cursor: 'pointer', boxShadow: '0 2px 8px rgba(26,58,110,0.06)', borderLeft: open === i ? '4px solid #2a6dd9' : '1.5px solid #e2e9f4', transition: 'all 0.2s' }}
            onClick={() => setOpen(open === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, color: '#0d1f40', flex: 1, paddingRight: 10, fontSize: 14, lineHeight: 1.4 }}>{f.q}</div>
              <div style={{ color: '#2a6dd9', fontSize: 24, fontWeight: 700, width: 24, textAlign: 'center' }}>{open === i ? '−' : '+'}</div>
            </div>
            {open === i && <div style={{ fontSize: 13, color: '#8a9bb5', marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e9f4', lineHeight: 1.6 }}>{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TERMS ──
export function TermsPage({ onBack }) {
  const items = [
    { t: '1. Eligibility',           d: 'Sirf 18+ log hi use kar sakte hain. Minor hone pe account band ho jaayega.' },
    { t: '2. Account Rules',         d: 'Ek user sirf ek account rakh sakta hai. Fake information pe permanent ban ho sakta hai.' },
    { t: '3. Deposits',              d: 'Sirf UPI aur Bank Transfer se deposit hoga. Minimum deposit ₹100 hai.' },
    { t: '4. Withdrawals',           d: 'Sirf winning balance se withdrawal hogi. Minimum ₹500 chahiye. Admin approve karega.' },
    { t: '5. Gameplay',              d: 'Bid lagane ke baad cancel nahi hogi. Cheating pe permanent ban milega.' },
    { t: '6. Responsible Gaming',    d: 'Apni financial limit ke andar khelo. Gambling addiction feel ho toh support se contact karein.' },
    { t: '7. Liability',             d: 'Technical issues ya server downtime ke liye zimmedaar nahi hai.' },
    { t: '8. Account Termination',   d: 'Rules violation pe account band kar sakta hai. Remaining balance refund kiya jaayega.' },
  ];
  return (
    <div style={B.page}>
      <SubHeader title="📜 Terms & Conditions" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {items.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #e2e9f4', boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#2a6dd9', fontSize: 14, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: '#8a9bb5', lineHeight: 1.6 }}>{s.d}</div>
          </div>
        ))}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#8a9bb5', marginTop: 16, fontWeight: 600 }}>MatkaKing use karne se aap in terms se agree karte hain.</p>
      </div>
    </div>
  );
}

// ── PRIVACY ──
export function PrivacyPage({ onBack }) {
  const items = [
    { t: '📱 Kaunsa Data Collect Hota Hai?', d: 'Mobile number, naam, device info aur transaction history. Koi bhi card number ya banking password store nahi hota.' },
    { t: '🔐 Data Kaise Safe Hai?',           d: 'Aapka data encrypted servers pe store hota hai. JWT tokens se authentication secure hai.' },
    { t: '💳 Payment Information',            d: 'UPI ID sirf withdrawal ke liye use hota hai. Bank details encrypted form mein store hoti hain.' },
    { t: '👤 Aapke Rights',                   d: 'Aap apna account aur data delete karwa sakte hain. Transaction history download kar sakte hain.' },
    { t: '📞 Contact',                        d: 'Privacy se related kisi bhi sawaal ke liye Support page pe humse contact karein.' },
  ];
  return (
    <div style={B.page}>
      <SubHeader title="🔒 Privacy Policy" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {items.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #e2e9f4', boxShadow: '0 2px 8px rgba(26,58,110,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#2a6dd9', fontSize: 14, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: '#8a9bb5', lineHeight: 1.6 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUPPORT & PROFILE PAGE ──
export function SupportPage({ apiCall, user }) {
  const [contacts, setContacts] = useState({ phone: '9999999999', telegram: 'matkaking_support' });
  const [profileForm, setProfileForm] = useState({ username: user?.name || '', oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading]   = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(d => {
      if (d?.success && d?.settings) setContacts({ phone: d.settings.phone || '9999999999', telegram: d.settings.telegram || 'matkaking_support' });
    }).catch(() => {});
  }, [apiCall]);

  const updateProfile = async () => {
    setSuccessMsg(''); setErrorMsg('');
    if (!profileForm.username.trim()) { setErrorMsg('❌ Username dalna zaruri hai!'); return; }
    setLoading(true);
    try {
      const profileRes = await apiCall('/api/auth/update-profile', 'PUT', { name: profileForm.username.trim() });
      if (!profileRes?.success) { setErrorMsg(profileRes?.message || '❌ Profile update fail ho gaya'); setLoading(false); return; }
      if (profileForm.newPassword) {
        if (!profileForm.oldPassword) { setErrorMsg('❌ Purana password zaruri hai'); setLoading(false); return; }
        if (profileForm.newPassword !== profileForm.confirmPassword) { setErrorMsg('❌ Passwords match nahi ho rahe'); setLoading(false); return; }
        const passRes = await apiCall('/api/auth/update-password', 'POST', { oldPassword: profileForm.oldPassword, newPassword: profileForm.newPassword });
        if (!passRes?.success) { setErrorMsg(passRes?.message || '❌ Password update fail'); setLoading(false); return; }
      }
      setSuccessMsg('✅ Profile successfully updated!');
      setProfileForm(p => ({ ...p, oldPassword: '', newPassword: '', confirmPassword: '' }));
    } catch { setErrorMsg('❌ Server se connect nahi ho pa raha.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={B.page}>
      <SubHeader title="👤 My Profile" />
      <div style={{ background: 'linear-gradient(135deg, #1a3a6e, #2a6dd9)', margin: '16px 12px', borderRadius: 20, padding: '24px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(30,79,160,0.25)' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.12)', border: '3px solid rgba(255,255,255,0.35)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 36, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>{user?.name || 'User'}</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>📱 {user?.mobile || '—'}</div>
        <div style={{ display: 'inline-block', marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>✅ Verified</div>
      </div>

      {user?.referral_code && (
        <div style={{ margin: '0 12px 12px', background: 'linear-gradient(135deg, #fff8e1, #fff3cd)', borderRadius: 16, border: '1.5px solid #f0c040', padding: '16px', boxShadow: '0 4px 14px rgba(240,192,64,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#b8860b', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>🎁 Aapka Referral Code</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1.5px dashed #f0c040' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0d1f40', letterSpacing: 3 }}>{user.referral_code}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(user.referral_code); }}
              style={{ padding: '12px 16px', background: '#f0c040', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', color: '#0d1f40' }}>
              📋 Copy
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#b8860b', marginTop: 10, fontWeight: 700, textAlign: 'center' }}>
            👥 Share karo → Dost join kare → Dono ko ₹50 bonus!
          </div>
        </div>
      )}

      <div style={B.card}>
        {successMsg && <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#1e8a3c', fontSize: 13, fontWeight: 700 }}>{successMsg}</div>}
        {errorMsg   && <div style={{ background: '#fdecea', border: '1px solid #f5c6cb', borderRadius: 10, padding: '12px', marginBottom: 16, color: '#c0392b', fontSize: 13, fontWeight: 700 }}>{errorMsg}</div>}
        <label style={B.label}>Full Name</label>
        <input style={B.input} value={profileForm.username} onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))} placeholder="Apna naam likhein" />
        <div style={{ borderTop: '1px solid #e2e9f4', paddingTop: 20, marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>🔐 Change Password (Optional)</div>
          <label style={B.label}>Current Password</label>
          <input type="password" style={B.input} placeholder="Purana password" value={profileForm.oldPassword} onChange={e => setProfileForm(p => ({ ...p, oldPassword: e.target.value }))} />
          <label style={B.label}>New Password</label>
          <input type="password" style={B.input} placeholder="Naya password (min 6 characters)" value={profileForm.newPassword} onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} />
          <label style={B.label}>Confirm New Password</label>
          <input type="password" style={{ ...B.input, marginBottom: 0 }} placeholder="Dobara naya password" value={profileForm.confirmPassword} onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))} />
        </div>
        <button onClick={updateProfile} disabled={loading} style={{ ...B.btn, marginTop: 20, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Updating...' : '💾 UPDATE PROFILE'}
        </button>
      </div>

      <div style={{ margin: '0 12px', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e9f4', overflow: 'hidden', boxShadow: '0 4px 14px rgba(26,58,110,0.07)' }}>
        <div style={{ padding: '14px 16px', background: '#eef2f7', borderBottom: '1px solid #e2e9f4', fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5 }}>🎧 Help & Support</div>
        <div onClick={() => window.open(`https://wa.me/91${contacts.phone}`, '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderBottom: '1px solid #e2e9f4', cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, background: '#e8f5e9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 15 }}>WhatsApp Support</div>
            <div style={{ fontSize: 12, color: '#8a9bb5', marginTop: 3 }}>+91 {contacts.phone}</div>
          </div>
          <div style={{ color: '#2a6dd9', fontSize: 24 }}>›</div>
        </div>
        <div onClick={() => window.open(`https://t.me/${contacts.telegram}`, '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', cursor: 'pointer' }}>
          <div style={{ width: 44, height: 44, background: '#eef2f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 15 }}>Telegram Support</div>
            <div style={{ fontSize: 12, color: '#8a9bb5', marginTop: 3 }}>Quick reply in 5 mins</div>
          </div>
          <div style={{ color: '#2a6dd9', fontSize: 24 }}>›</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '24px 0 16px', fontSize: 11, color: '#8a9bb5', fontWeight: 600 }}>MatkaKing · Version 5.0.0 · 18+ Only</div>
    </div>
  );
}

// ── GAME RATES PAGE ──
export function GameRatesPage({ onBack }) {
  const mainRates = [
    { label: 'Single',       rate: '1Rs ka 9.5Rs' },
    { label: 'Jodi',         rate: '1Rs ka 95Rs' },
    { label: 'Single Panna', rate: '1Rs ka 150Rs' },
    { label: 'Double Panna', rate: '1Rs ka 300Rs' },
    { label: 'Triple Panna', rate: '1Rs ka 700Rs' },
    { label: 'Half Sangam',  rate: '1Rs ka 1000Rs' },
    { label: 'Full Sangam',  rate: '1Rs ka 10000Rs' },
  ];
  const starlineRates = [
    { label: 'Single',       rate: '1Rs ka 9.5Rs' },
    { label: 'Single Panna', rate: '1Rs ka 150Rs' },
    { label: 'Double Panna', rate: '1Rs ka 300Rs' },
    { label: 'Triple Panna', rate: '1Rs ka 700Rs' },
  ];

  return (
    <div style={B.page}>
      <SubHeader title="🎰 Game Rates" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a6e, #2a6dd9)', borderRadius: 16, padding: '20px', textAlign: 'center', marginBottom: 20, boxShadow: '0 4px 20px rgba(30,79,160,0.25)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>Game Rates</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>We have Best Main Market Game Rates</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>🎯 Main Market Rates</div>
        {mainRates.map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 10, border: '1.5px solid #e2e9f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(26,58,110,0.06)', borderLeft: '4px solid #f0c040' }}>
            <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 16 }}>{g.label}</div>
            <div style={{ fontWeight: 900, fontSize: 15, color: '#2a6dd9', background: '#eef2f7', padding: '6px 14px', borderRadius: 20 }}>{g.rate}</div>
          </div>
        ))}
        <div style={{ fontSize: 12, fontWeight: 800, color: '#2a6dd9', textTransform: 'uppercase', letterSpacing: 1.5, margin: '20px 0 12px' }}>⭐ Starline Game Rates</div>
        {starlineRates.map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 10, border: '1.5px solid #e2e9f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(26,58,110,0.06)', borderLeft: '4px solid #2a6dd9' }}>
            <div style={{ fontWeight: 800, color: '#0d1f40', fontSize: 16 }}>{g.label}</div>
            <div style={{ fontWeight: 900, fontSize: 15, color: '#2a6dd9', background: '#eef2f7', padding: '6px 14px', borderRadius: 20 }}>{g.rate}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: '#8a9bb5', fontWeight: 600 }}>
          We have Best Starline Game Rates
        </div>
      </div>
    </div>
  );
}
