import React, { useState, useEffect } from 'react';

const API = 'https://ziddi-1-we11.onrender.com';

// ────────────────────────────────────────────────
//  ADD MONEY MODAL
// ────────────────────────────────────────────────
export function AddModal({ onClose, onSuccess }) {
  const [amt, setAmt]         = useState('');
  const [chip, setChip]       = useState(null);
  const [step, setStep]       = useState(1);
  const [txnNo, setTxnNo]     = useState('');
  const [upiId, setUpiId]     = useState('');
  const [qrUrl, setQrUrl]     = useState('');
  const [loading, setLoading] = useState(false);

  const chips = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    fetch(`${API}/api/admin/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) {
          const id = d.settings.upi_id || 'matkaking@upi';
          setUpiId(id);
          const upiStr = `upi://pay?pa=${id}&pn=MatkaKing&am=${amt || ''}&cu=INR`;
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`);
        }
      })
      .catch(() => setUpiId('matkaking@upi'));
  }, [amt]);

  const handleProceed = () => {
    if (!amt || Number(amt) < 100) return;
    const upiStr = `upi://pay?pa=${upiId}&pn=MatkaKing&am=${amt}&cu=INR`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!txnNo.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('mk_token');
      const res = await fetch(`${API}/api/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ amount: Number(amt), transaction_id: txnNo, upi_id: upiId })
      });
      const d = await res.json();
      if (d.success) setStep(3);
      else alert(d.message || 'Error submitting request');
    } catch {
      setStep(3);
    }
    setLoading(false);
  };

  // ── Shared blue style tokens ──
  const S = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(13,71,161,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 10000
    },
    modal: {
      background: '#ffffff',
      width: '100%', maxWidth: '420px',
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      padding: '24px',
      boxShadow: '0 -10px 40px rgba(13,71,161,0.18)',
      maxHeight: '90vh', overflowY: 'auto',
      animation: 'slideUp 0.3s ease-out'
    },
    handle: { width: 40, height: 4, background: '#BBDEFB', borderRadius: 4, margin: '0 auto 16px' },
    title: { margin: '0 0 20px', color: '#0D47A1', fontSize: 18, fontWeight: 900, letterSpacing: 1, textAlign: 'center' },
    fg: { marginBottom: 16 },
    label: { fontSize: 11, color: '#1565C0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block', marginLeft: 4 },
    input: {
      width: '100%', background: '#F5F9FF',
      border: '2px solid #BBDEFB', borderRadius: 14,
      padding: '14px', color: '#0D47A1', fontSize: 15, fontWeight: 700,
      outline: 'none', boxSizing: 'border-box'
    },
    btnPrimary: {
      width: '100%',
      background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
      color: '#fff', border: 'none', borderRadius: 14,
      padding: '16px', fontSize: 15, fontWeight: 900, cursor: 'pointer',
      letterSpacing: 1, textTransform: 'uppercase',
      boxShadow: '0 6px 20px rgba(21,101,192,0.30)', marginBottom: 12
    },
    btnSecondary: {
      width: '100%', background: '#F5F9FF', color: '#E53935',
      border: '2px solid #FFCDD2', borderRadius: 14,
      padding: '14px', fontSize: 14, fontWeight: 800,
      cursor: 'pointer', textTransform: 'uppercase'
    },
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .mk-input:focus { border-color: #1976D2 !important; box-shadow: 0 0 0 3px rgba(21,101,192,0.12); }
        .mk-chip-btn { transition: all 0.2s ease; }
        .mk-chip-btn:hover { transform: translateY(-1px); }
      `}</style>

      <div style={S.modal}>
        <div style={S.handle} />

        {/* ── STEP 1 — Amount ── */}
        {step === 1 && <>
          <h3 style={S.title}>💰 ADD FUND</h3>

          <div style={S.fg}>
            <label style={S.label}>Amount (Min ₹100)</label>
            <input
              className="mk-input"
              style={S.input}
              type="number"
              placeholder="Enter amount"
              value={amt}
              onChange={e => { setAmt(e.target.value); setChip(null); }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {chips.map(c => (
                <button
                  key={c}
                  className="mk-chip-btn"
                  onClick={() => { setAmt(String(c)); setChip(c); }}
                  style={{
                    flex: '1 1 calc(33% - 8px)', padding: '10px 0',
                    background: chip === c ? '#1565C0' : '#EEF4FF',
                    color: chip === c ? '#fff' : '#1565C0',
                    border: chip === c ? 'none' : '1.5px solid #BBDEFB',
                    borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer'
                  }}>
                  ₹{c.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {upiId && (
            <div style={{
              background: '#EEF4FF', border: '1.5px solid #BBDEFB',
              borderRadius: 12, padding: '12px', marginBottom: 16,
              fontSize: 13, color: '#1565C0', textAlign: 'center', fontWeight: 700
            }}>
              💳 Pay to UPI: <strong style={{ color: '#0D47A1' }}>{upiId}</strong>
            </div>
          )}

          <button
            style={{ ...S.btnPrimary, opacity: amt && Number(amt) >= 100 ? 1 : 0.5, cursor: amt && Number(amt) >= 100 ? 'pointer' : 'not-allowed' }}
            onClick={handleProceed}
            disabled={!amt || Number(amt) < 100}>
            Proceed ₹{Number(amt || 0).toLocaleString()}
          </button>
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
        </>}

        {/* ── STEP 2 — QR + UTR ── */}
        {step === 2 && <>
          <h3 style={S.title}>📲 SCAN & PAY</h3>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              background: '#F5F9FF', borderRadius: 16, padding: 16,
              display: 'inline-block', border: '2px solid #BBDEFB'
            }}>
              {qrUrl
                ? <img src={qrUrl} alt="QR Code" width={180} height={180} style={{ display: 'block', borderRadius: 8 }} />
                : <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#90CAF9', fontSize: 13, fontWeight: 700 }}>Loading QR...</div>
              }
            </div>
            <div style={{ fontSize: 12, color: '#1565C0', marginTop: 12, fontWeight: 800 }}>
              UPI ID: <span style={{ color: '#0D47A1' }}>{upiId}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#2E7D32', marginTop: 6 }}>
              ₹{Number(amt).toLocaleString()}
            </div>
          </div>

          <div style={S.fg}>
            <label style={S.label}>Transaction Number / UTR</label>
            <input
              className="mk-input"
              style={S.input}
              type="text"
              placeholder="12-digit transaction number"
              value={txnNo}
              onChange={e => setTxnNo(e.target.value)}
            />
          </div>

          <div style={{
            background: '#EEF4FF', border: '1.5px solid #90CAF9',
            borderRadius: 12, padding: '10px 14px',
            fontSize: 12, color: '#1565C0', marginBottom: 16,
            lineHeight: 1.6, fontWeight: 600
          }}>
            ✅ Pay karke <strong>Transaction No / UTR</strong> daalo<br />
            ⏰ Credit within <strong>30 minutes</strong>
          </div>

          <button
            style={{ ...S.btnPrimary, opacity: txnNo.trim() ? 1 : 0.5, cursor: txnNo.trim() ? 'pointer' : 'not-allowed' }}
            onClick={handleSubmit}
            disabled={loading || !txnNo.trim()}>
            {loading ? 'Submitting...' : '✅ SUBMIT UTR'}
          </button>
          <button style={{ ...S.btnSecondary, color: '#1565C0', border: '2px solid #BBDEFB' }} onClick={() => setStep(1)}>
            ← BACK
          </button>
        </>}

        {/* ── STEP 3 — Success ── */}
        {step === 3 && <>
          <h3 style={S.title}>⏳ REQUEST SENT!</h3>
          <div style={{
            background: '#E8F5E9', border: '1.5px solid #A5D6A7',
            borderRadius: 16, padding: '20px', marginBottom: 16,
            fontSize: 14, color: '#2E7D32', lineHeight: 1.6, textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
            Deposit <strong style={{ fontSize: 16 }}>₹{Number(amt).toLocaleString()}</strong> request submitted!<br />
            UTR: <strong>{txnNo}</strong><br /><br />
            Admin approve karega — <strong>30 min</strong> mein wallet mein credit hoga.
          </div>
          <button style={S.btnPrimary} onClick={() => { onSuccess(Number(amt)); onClose(); }}>DONE</button>
        </>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//  WITHDRAW MODAL
// ────────────────────────────────────────────────
export function WithdrawModal({ wallet, onClose, onSuccess }) {
  const [amt, setAmt]           = useState('');
  const [method, setMethod]     = useState('upi');
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);

  const [upiId, setUpiId]       = useState('');
  const [upiName, setUpiName]   = useState('');

  const [accNo, setAccNo]       = useState('');
  const [accName, setAccName]   = useState('');
  const [ifsc, setIfsc]         = useState('');
  const [bankName, setBankName] = useState('');

  const MIN = 300;

  const isValid = () => {
    if (!amt || Number(amt) < MIN || Number(amt) > wallet) return false;
    if (method === 'upi') return upiId.trim() && upiName.trim();
    return accNo.trim() && accName.trim() && ifsc.trim() && bankName.trim();
  };

  const handleSubmit = async () => {
    if (!isValid()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('mk_token');
      const body = {
        amount: Number(amt),
        method,
        ...(method === 'upi'
          ? { upi_id: upiId, account_name: upiName }
          : { account_number: accNo, account_name: accName, ifsc_code: ifsc, bank_name: bankName })
      };
      const res = await fetch(`${API}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      const d = await res.json();
      if (d.success) setStep(2);
      else alert(d.message || 'Error');
    } catch {
      setStep(2);
    }
    setLoading(false);
  };

  const S = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(13,71,161,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 10000
    },
    modal: {
      background: '#ffffff',
      width: '100%', maxWidth: '420px',
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      padding: '24px',
      boxShadow: '0 -10px 40px rgba(13,71,161,0.18)',
      maxHeight: '90vh', overflowY: 'auto',
      animation: 'slideUp 0.3s ease-out'
    },
    handle: { width: 40, height: 4, background: '#BBDEFB', borderRadius: 4, margin: '0 auto 16px' },
    title: { margin: '0 0 20px', color: '#0D47A1', fontSize: 18, fontWeight: 900, letterSpacing: 1, textAlign: 'center' },
    fg: { marginBottom: 14 },
    label: { fontSize: 11, color: '#1565C0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block', marginLeft: 4 },
    input: {
      width: '100%', background: '#F5F9FF',
      border: '2px solid #BBDEFB', borderRadius: 12,
      padding: '12px 14px', color: '#0D47A1', fontSize: 14, fontWeight: 700,
      outline: 'none', boxSizing: 'border-box'
    },
    btnPrimary: {
      width: '100%',
      background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
      color: '#fff', border: 'none', borderRadius: 14,
      padding: '16px', fontSize: 15, fontWeight: 900, cursor: 'pointer',
      letterSpacing: 1, textTransform: 'uppercase',
      boxShadow: '0 6px 20px rgba(21,101,192,0.30)', marginBottom: 12
    },
    btnSecondary: {
      width: '100%', background: '#F5F9FF', color: '#E53935',
      border: '2px solid #FFCDD2', borderRadius: 14,
      padding: '14px', fontSize: 14, fontWeight: 800,
      cursor: 'pointer', textTransform: 'uppercase'
    },
  };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .mk-input:focus { border-color: #1976D2 !important; box-shadow: 0 0 0 3px rgba(21,101,192,0.12); }
      `}</style>

      <div style={S.modal}>
        <div style={S.handle} />

        {step === 1 ? <>
          <h3 style={S.title}>💸 WITHDRAW FUND</h3>

          {/* Balance info */}
          <div style={{
            background: '#E8F5E9', border: '1.5px solid #A5D6A7',
            borderRadius: 12, padding: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16
          }}>
            <span style={{ color: '#2E7D32', fontSize: 13, fontWeight: 800 }}>
              💰 Available: ₹{wallet.toLocaleString()}
            </span>
            <span style={{ color: '#1565C0', fontSize: 12, fontWeight: 800 }}>Min: ₹{MIN}</span>
          </div>

          {/* Amount */}
          <div style={S.fg}>
            <label style={S.label}>Amount</label>
            <input
              className="mk-input"
              style={S.input}
              type="number"
              placeholder={`Min ₹${MIN}`}
              value={amt}
              onChange={e => setAmt(e.target.value)}
            />
          </div>

          {/* Method Toggle */}
          <div style={S.fg}>
            <label style={S.label}>Withdrawal Method</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
              {[
                { id: 'upi', icon: '📱', label: 'UPI' },
                { id: 'bank', icon: '🏦', label: 'Bank Account' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    flex: 1, padding: '12px',
                    background: method === m.id ? '#1565C0' : '#EEF4FF',
                    color: method === m.id ? '#fff' : '#1565C0',
                    border: method === m.id ? 'none' : '1.5px solid #BBDEFB',
                    borderRadius: 12, fontSize: 13, fontWeight: 800,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s', cursor: 'pointer'
                  }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI Fields */}
          {method === 'upi' && <>
            <div style={S.fg}>
              <label style={S.label}>Account Holder Name</label>
              <input className="mk-input" style={S.input} type="text"
                placeholder="Apna naam daalo" value={upiName} onChange={e => setUpiName(e.target.value)} />
            </div>
            <div style={S.fg}>
              <label style={S.label}>UPI ID</label>
              <input className="mk-input" style={S.input} type="text"
                placeholder="name@upi / name@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>
          </>}

          {/* Bank Fields */}
          {method === 'bank' && <>
            <div style={S.fg}>
              <label style={S.label}>Account Holder Name</label>
              <input className="mk-input" style={S.input} type="text"
                placeholder="Apna naam daalo" value={accName} onChange={e => setAccName(e.target.value)} />
            </div>
            <div style={S.fg}>
              <label style={S.label}>Account Number</label>
              <input className="mk-input" style={S.input} type="number"
                placeholder="Account number daalo" value={accNo} onChange={e => setAccNo(e.target.value)} />
            </div>
            <div style={S.fg}>
              <label style={S.label}>IFSC Code</label>
              <input className="mk-input" style={{ ...S.input, textTransform: 'uppercase' }} type="text"
                placeholder="SBIN0001234" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} />
            </div>
            <div style={S.fg}>
              <label style={S.label}>Bank Name</label>
              <input className="mk-input" style={S.input} type="text"
                placeholder="SBI / HDFC / ICICI..." value={bankName} onChange={e => setBankName(e.target.value)} />
            </div>
          </>}

          <button
            style={{ ...S.btnPrimary, opacity: isValid() ? 1 : 0.5, cursor: isValid() ? 'pointer' : 'not-allowed', marginTop: 8 }}
            onClick={handleSubmit}
            disabled={loading || !isValid()}>
            {loading ? 'SUBMITTING...' : '📤 SUBMIT REQUEST'}
          </button>
          <button style={S.btnSecondary} onClick={onClose}>CANCEL</button>

        </> : <>
          {/* Step 2 — Success */}
          <h3 style={S.title}>⏳ REQUEST SENT!</h3>
          <div style={{
            background: '#EEF4FF', border: '1.5px solid #90CAF9',
            borderRadius: 16, padding: '20px', marginBottom: 16,
            fontSize: 14, color: '#1565C0', lineHeight: 1.6, textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
            Withdrawal <strong style={{ fontSize: 16 }}>₹{Number(amt).toLocaleString()}</strong> request bheja gaya!<br />
            Method: <strong>{method === 'upi' ? `UPI — ${upiId}` : `Bank — ${bankName}`}</strong><br /><br />
            Processing Time: <strong>24–48 hours</strong>
          </div>
          <button style={S.btnPrimary} onClick={() => { onSuccess(Number(amt)); onClose(); }}>DONE</button>
        </>}
      </div>
    </div>
  );
}
