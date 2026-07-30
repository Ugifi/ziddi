// ══════════════════════════════════════════════════════════════
//  ADMIN PANEL — Blue Theme (Badshah Khaiwal Style)
// ══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';

const API = 'https://ziddi-1-we11.onrender.com';

function toIST(dateStr) {
  if (!dateStr) return '';
  try {
    let str = String(dateStr);
    // Sab UTC mein stored hai — 'Z' lagao
    if (!str.includes('T') && str.includes(' ')) {
      str = str.replace(' ', 'T') + 'Z';
    } else if (str.includes('T') && !str.includes('+') && !str.endsWith('Z')) {
      str = str + 'Z';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch (e) { return ''; }
}
function toISTlocal(dateStr) {
  if (!dateStr) return '';
  try {
    let str = String(dateStr);
    if (!str.includes('T') && str.includes(' ')) {
      str = str.replace(' ', 'T') + '+05:30';
    } else if (str.includes('T') && !str.includes('+') && !str.endsWith('Z')) {
      str = str + '+05:30';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch (e) { return ''; }
}
// NAYA — timeout + retry wala

// NAYA — timeout + retry wala
async function apiCall(path, method = 'GET', body = null, retries = 2) {
  const token = localStorage.getItem('mk_token');
  const url = method === 'GET'
    ? `${API}${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`
    : `${API}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API attempt ${attempt + 1} failed:`, err.message);
      if (attempt === retries) return { success: false, message: 'Server se connect nahi ho pa raha. Thodi der mein retry karo.' };
      await new Promise(r => setTimeout(r, 2000)); // 2 sec wait between retries
    }
  }
}

// ── BLUE THEME TOKENS ──────────────────────────────────────────
const C = {
  navBg: 'linear-gradient(135deg, #0d1b5e 0%, #1a2f8f 60%, #1565C0 100%)',
  drawerBg: '#0a1550',
  drawerItem: '#0f1d6b',
  drawerAct: '#1976D2',
  primary: '#1565C0',
  primaryHov: '#1976D2',
  accent: '#FFD700',
  accentSoft: '#FFF8DC',
  pageBg: '#EEF2FF',
  card: '#FFFFFF',
  cardBorder: '#C5CAE9',
  cardShadow: '0 4px 16px rgba(21,101,192,0.10)',
  textMain: '#0d1b5e',
  textSub: '#1565C0',
  textMuted: '#5C6BC0',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  danger: '#C62828',
  dangerBg: '#FFEBEE',
  warn: '#E65100',
  warnBg: '#FFF3E0',
  inputBg: '#F0F4FF',
  inputBdr: '#90CAF9',
  inputFocus: '#1565C0',
  badgePend: '#E3F2FD',
  badgePendT: '#1565C0',
};

const B = {
  card: {
    background: C.card,
    borderRadius: 16,
    border: `1.5px solid ${C.cardBorder}`,
    boxShadow: C.cardShadow,
    padding: 18,
    marginBottom: 14,
  },
  input: {
    width: '100%',
    background: C.inputBg,
    border: `2px solid ${C.inputBdr}`,
    borderRadius: 10,
    padding: '12px 14px',
    color: C.textMain,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 12,
    fontWeight: 600,
    fontFamily: '"Segoe UI", sans-serif',
  },
  btn: {
    width: '100%',
    background: `linear-gradient(135deg, ${C.primary} 0%, #1976D2 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 1,
    boxShadow: '0 4px 14px rgba(21,101,192,0.30)',
  },
  label: {
    fontSize: 11,
    color: C.textSub,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 1,
    display: 'block',
    marginBottom: 6,
    marginLeft: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 800,
    color: C.textMain,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

// ── TIME PICKER WITH AM/PM ─────────────────────────────────────
function TimePicker({ value, onChange, placeholder }) {
  const parseTime = (val) => {
    if (!val) return { hh: '', mm: '', ampm: 'AM' };
    const [h, m] = val.split(':');
    const hour = parseInt(h, 10);
    if (isNaN(hour)) return { hh: '', mm: m || '', ampm: 'AM' };
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hh = hour === 0 ? '12' : hour > 12 ? String(hour - 12).padStart(2, '0') : String(hour).padStart(2, '0');
    return { hh, mm: m || '00', ampm };
  };

  const { hh, mm, ampm } = parseTime(value);

  const emit = (newHH, newMM, newAMPM) => {
    let h = parseInt(newHH, 10);
    if (isNaN(h)) { onChange(''); return; }
    if (newAMPM === 'AM') { if (h === 12) h = 0; }
    else { if (h !== 12) h += 12; }
    onChange(`${String(h).padStart(2, '0')}:${newMM || '00'}`);
  };

  const selStyle = {
    background: C.inputBg,
    border: `2px solid ${C.inputBdr}`,
    borderRadius: 10,
    padding: '11px 8px',
    color: C.textMain,
    fontSize: 14,
    fontWeight: 700,
    outline: 'none',
    cursor: 'pointer',
    flex: 1,
  };

  const hours = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
  const mins = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      <select value={hh} onChange={e => emit(e.target.value, mm, ampm)} style={selStyle}>
        <option value="">HH</option>
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <select value={mm} onChange={e => emit(hh, e.target.value, ampm)} style={selStyle}>
        {mins.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={ampm} onChange={e => emit(hh, mm, e.target.value)} style={{ ...selStyle, flex: '0 0 70px', fontWeight: 900, color: ampm === 'AM' ? C.primary : C.danger }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function displayTime(val) {
  if (!val) return '--';
  const [h, m] = val.split(':');
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return val;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hh = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hh}:${m || '00'} ${ampm}`;
}

// ── STATUS BADGE ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: { bg: C.successBg, color: C.success, label: 'Approved' },
    rejected: { bg: C.dangerBg, color: C.danger, label: 'Rejected' },
    pending: { bg: C.badgePend, color: C.badgePendT, label: 'Pending' },
    win: { bg: C.successBg, color: C.success, label: 'Won' },
    loss: { bg: C.dangerBg, color: C.danger, label: 'Lost' },
    open: { bg: C.successBg, color: C.success, label: 'Open' },
    closed: { bg: C.dangerBg, color: C.danger, label: 'Closed' },
  };
  const s = map[status] || { bg: '#F5F5F5', color: '#757575', label: status };
  return (
    <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: s.bg, color: s.color, letterSpacing: 0.5 }}>
      {s.label}
    </span>
  );
}

function ActionBtn({ onClick, color, bg, children }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: bg, color }}>
      {children}
    </button>
  );
}

// ── EDIT GAME MODAL ────────────────────────────────────────────
function EditGameModal({ game, onClose, onSave }) {
  const [form, setForm] = useState({
    name: game.name || '',
    open_time: game.open_time || '',
    close_time: game.close_time || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name || !form.open_time || !form.close_time) { alert('Saari fields bhariye!'); return; }
    setSaving(true);
    const res = await apiCall(`/api/admin/games/${game.id}`, 'PUT', form);
    setSaving(false);
    if (res.success) { onSave({ ...game, ...form }); onClose(); }
    else alert('Error: ' + (res.message || 'Update failed'));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.textMain }}>✏️ Edit Game</div>
          <button onClick={onClose} style={{ background: C.dangerBg, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: C.danger, fontSize: 16, fontWeight: 900 }}>✕</button>
        </div>
        <label style={B.label}>Game Name</label>
        <input style={B.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kalyan" />
        <label style={B.label}>Open Time</label>
        <TimePicker value={form.open_time} onChange={v => setForm(f => ({ ...f, open_time: v }))} />
        <label style={B.label}>Close Time</label>
        <TimePicker value={form.close_time} onChange={v => setForm(f => ({ ...f, close_time: v }))} />
        <button onClick={save} disabled={saving} style={{ ...B.btn, marginTop: 8 }}>
          {saving ? '⏳ SAVING...' : '💾 SAVE CHANGES'}
        </button>
      </div>
    </div>
  );
}

// ── CHANGE MOBILE MODAL ────────────────────────────────────────
function ChangeMobileModal({ user, onClose, onSave }) {
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!mobile || mobile.length !== 10) { alert('Valid 10-digit mobile number daalo!'); return; }
    setSaving(true);
    const res = await apiCall(`/api/admin/users/${user.id}/change-mobile`, 'PUT', { mobile });
    setSaving(false);
    if (res.success) { onSave(mobile); onClose(); }
    else alert('Error: ' + (res.message || 'Update failed'));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.textMain }}>📱 Change Mobile</div>
          <button onClick={onClose} style={{ background: C.dangerBg, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: C.danger, fontSize: 16, fontWeight: 900 }}>✕</button>
        </div>

        {/* Current number display */}
        <div style={{ background: C.inputBg, border: `1.5px solid ${C.inputBdr}`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: C.textSub, fontWeight: 700, lineHeight: 1.8 }}>
          👤 <strong style={{ color: C.textMain }}>{user.name}</strong><br />
          <span style={{ color: C.textMuted, fontSize: 12 }}>Current Number: </span>
          <strong style={{ color: C.primary }}>{user.mobile}</strong>
        </div>

        <label style={B.label}>New Mobile Number</label>
        <input
          style={B.input}
          type="tel"
          placeholder="10-digit mobile number"
          maxLength={10}
          value={mobile}
          onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && save()}
        />

        {mobile.length > 0 && mobile.length < 10 && (
          <div style={{ color: C.warn, fontSize: 12, fontWeight: 700, marginTop: -8, marginBottom: 10 }}>
            ⚠️ {10 - mobile.length} digit aur chahiye
          </div>
        )}

        {mobile.length === 10 && (
          <div style={{ color: C.success, fontSize: 12, fontWeight: 700, marginTop: -8, marginBottom: 10 }}>
            ✅ Number valid hai
          </div>
        )}

        <button
          onClick={save}
          disabled={saving || mobile.length !== 10}
          style={{ ...B.btn, marginTop: 8, opacity: (saving || mobile.length !== 10) ? 0.55 : 1 }}
        >
          {saving ? '⏳ UPDATING...' : '💾 UPDATE MOBILE'}
        </button>
      </div>
    </div>
  );
}

// ─── USER CARD ────────────────────────────────────────────────
function UserCard({ u, onBlock, onAddCoins, onDeductCoins, onChangeMobile, onLoginAs }) {
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textMain }}>{u.name}</div>
          <div style={{ fontSize: 13, color: C.textSub, marginTop: 2, fontWeight: 600 }}>{u.mobile}</div>
        </div>
        <StatusBadge status={u.is_blocked ? 'rejected' : 'approved'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'WALLET', val: `₹${Number(u.wallet_balance || 0).toLocaleString()}`, color: C.primary },
          { label: 'WINNING', val: `₹${Number(u.winning_balance || 0).toLocaleString()}`, color: C.success },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: C.inputBg, borderRadius: 10, padding: '10px 12px', border: `1px solid ${C.cardBorder}` }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 800, marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 900, fontSize: 15, color }}>{val}</div>
          </div>
        ))}
      </div>
      {/* Row 1: Block / Add / Deduct */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <ActionBtn onClick={() => onBlock(u.id, u.is_blocked)} color={u.is_blocked ? C.success : C.warn} bg={u.is_blocked ? C.successBg : C.warnBg}>
          {u.is_blocked ? '✅ Unblock' : '🚫 Block'}
        </ActionBtn>
        <ActionBtn onClick={() => onAddCoins(u.id)} color={C.success} bg={C.successBg}>+ Coins</ActionBtn>
        <ActionBtn onClick={() => onDeductCoins(u.id)} color={C.danger} bg={C.dangerBg}>- Coins</ActionBtn>
      </div>
      {/* Row 2: Change Mobile / Login As User */}
      <div style={{ display: 'flex', gap: 8 }}>
        <ActionBtn onClick={() => onChangeMobile(u)} color={C.primary} bg={C.badgePend}>
          📱 Change Mobile
        </ActionBtn>
        {/* ✅ LOGIN AS USER BUTTON */}
        <ActionBtn onClick={() => onLoginAs(u.id)} color={C.textMain} bg={C.accentSoft}>
          🧑‍💻 Login
        </ActionBtn>
      </div>
    </div>
  );
}

// ─── DEPOSIT CARD ─────────────────────────────────────────────
function DepositCard({ d, onApprove, onReject }) {
  const [utrCopied, setUtrCopied] = React.useState(false);
  const utrValue = d.utr_number || d.utr || d.transaction_id || '';

  const copyUtr = () => {
    if (!utrValue) return;
    navigator.clipboard.writeText(utrValue).then(() => {
      setUtrCopied(true);
      setTimeout(() => setUtrCopied(false), 2000);
    });
  };

  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textMain }}>{d.name}</div>
          <div style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>{d.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, color: C.success }}>₹{Number(d.amount).toLocaleString()}</div>
      </div>

      {utrValue && (
        <div style={{ background: C.inputBg, border: `1.5px solid ${C.inputBdr}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>UTR / Ref No</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.textMain }}>{utrValue}</div>
          </div>
          <button onClick={copyUtr} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: utrCopied ? C.successBg : C.badgePend, color: utrCopied ? C.success : C.primary, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {utrCopied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}

      {d.upi_id && (
        <div style={{ fontSize: 13, color: C.textSub, marginBottom: 8, fontWeight: 600 }}>UPI Ref: {d.upi_id}</div>
      )}
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, fontWeight: 600 }}>📅 {toIST(d.created_at)}</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusBadge status={d.status} />
        {d.status === 'pending' && <>
          <ActionBtn onClick={() => onApprove(d.id)} color={C.success} bg={C.successBg}>✅ Approve</ActionBtn>
          <ActionBtn onClick={() => onReject(d.id)} color={C.danger} bg={C.dangerBg}>❌ Reject</ActionBtn>
        </>}
      </div>
    </div>
  );
}

// ─── WITHDRAWAL CARD ──────────────────────────────────────────
function WithdrawCard({ w, onApprove, onReject }) {
  const isBank = w.method === 'bank' || w.account_number;
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textMain }}>{w.name}</div>
          <div style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>{w.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, color: C.danger }}>₹{Number(w.amount).toLocaleString()}</div>
      </div>
      <div style={{ background: C.inputBg, border: `1.5px solid ${C.inputBdr}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
        {isBank ? (
          <>
            <div style={{ fontSize: 11, color: C.primary, fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>🏦 BANK TRANSFER</div>
            <div style={{ fontSize: 13, color: C.textMain, lineHeight: 1.8, fontWeight: 600 }}>
              <span style={{ color: C.textSub }}>Name:</span> <strong>{w.account_name}</strong><br />
              <span style={{ color: C.textSub }}>A/C No:</span> <strong>{w.account_number}</strong><br />
              <span style={{ color: C.textSub }}>IFSC:</span> <strong>{w.ifsc_code}</strong><br />
              <span style={{ color: C.textSub }}>Bank:</span> <strong>{w.bank_name}</strong>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: C.primary, fontWeight: 900, marginBottom: 6, textTransform: 'uppercase' }}>📱 UPI TRANSFER</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.textMain }}>{w.upi_id}</div>
            {w.account_name && <div style={{ fontSize: 13, color: C.textSub, fontWeight: 600, marginTop: 4 }}>{w.account_name}</div>}
          </>
        )}
      </div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 12, fontWeight: 600 }}>📅 {toIST(w.created_at)}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusBadge status={w.status} />
        {w.status === 'pending' && <>
          <ActionBtn onClick={() => onApprove(w.id)} color={C.success} bg={C.successBg}>✅ Approve</ActionBtn>
          <ActionBtn onClick={() => onReject(w.id)} color={C.danger} bg={C.dangerBg}>❌ Reject</ActionBtn>
        </>}
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────
export function AdminLogin({ onLogin }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setErr('');
    if (!mobile || !password) { setErr('Mobile aur password daalo'); return; }
    setLoading(true);
    try {
      const data = await apiCall('/api/auth/login', 'POST', { mobile, password });
      if (!data.success) { setErr(data.message || 'Login failed'); setLoading(false); return; }
      if (data.user.role !== 'admin') { setErr('Yeh account admin nahi hai'); setLoading(false); return; }
      localStorage.setItem('mk_token', data.token);
      localStorage.setItem('mk_admin_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch { setErr('Server se connect nahi ho pa raha.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: `linear-gradient(160deg, #0d1b5e 0%, #1565C0 60%, #1976D2 100%)`, padding: 24, fontFamily: '"Segoe UI", sans-serif' }}>
      <div style={{ position: 'absolute', top: 60, right: 60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 80, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,215,0,0.08)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 84, height: 84, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '2px solid rgba(255,215,0,0.4)' }}>
          <span style={{ fontSize: 38 }}>👑</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>ADMIN PANEL</div>
        <div style={{ fontSize: 12, color: 'rgba(255,215,0,0.85)', fontWeight: 700, marginTop: 6, letterSpacing: 1 }}>SAKTA MATKA • SECURE LOGIN</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 22, padding: 32, width: '100%', maxWidth: 370, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.5)' }}>
        <label style={B.label}>Mobile Number</label>
        <input type="tel" placeholder="Admin Mobile" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} style={B.input} />
        <label style={B.label}>Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={B.input} />
        {err && (
          <div style={{ background: C.dangerBg, borderLeft: `4px solid ${C.danger}`, borderRadius: 8, padding: '10px 14px', color: C.danger, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            ⚠️ {err}
          </div>
        )}
        <button onClick={go} disabled={loading} style={{ ...B.btn, marginTop: 8, opacity: loading ? 0.75 : 1 }}>
          {loading ? '⏳ VERIFYING...' : '🚀 SECURE LOGIN'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN PANEL MAIN
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel({ onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bids, setBids] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeMsg, setNoticeMsg] = useState('');
  const [newGame, setNewGame] = useState({ name: '', open_time: '', close_time: '' });
  const [resultForm, setResultForm] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [editingGame, setEditingGame] = useState(null);

  // ── Change Mobile Modal state ──────────────────────────────
  const [changeMobileUser, setChangeMobileUser] = useState(null);

  // ── FIX: Refresh pe logout nahi hoga ──────────────────────────
  const [adminReady, setAdminReady] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('mk_token');
    if (token) {
      apiCall('/api/auth/profile').then(res => {
        if (res?.success && res?.user?.role === 'admin') {
          setAdminReady(true);
        } else {
          localStorage.removeItem('mk_token');
          localStorage.removeItem('mk_admin_user');
          onLogout();
        }
      }).catch(() => setAdminReady(true));
    } else {
      onLogout();
    }
  }, []);

  const [settings, setSettings] = useState({
    site_name: '', site_url: '', upi_id: '', upi_name: '', whatsapp: '', phone: '',
    telegram: '', telegram_channel: '', support_hours: '', support_email: '',
    min_deposit: '', max_deposit: '', min_withdrawal: '', max_withdrawal: '',
    maintenance_mode: '0', qr_image: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const qrFileRef = useRef(null);

  // ── CHANGE PASSWORD ────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const changeAdminPassword = async () => {
    if (!pwForm.oldPass || !pwForm.newPass || !pwForm.confirmPass) {
      showToast('❌ Saare fields bhariye!'); return;
    }
    if (pwForm.newPass.length < 6) { showToast('❌ New password min 6 characters ka ho!'); return; }
    if (pwForm.newPass !== pwForm.confirmPass) { showToast('❌ New password aur confirm password match nahi kar rahe!'); return; }
    setPwSaving(true);
    try {
      const res = await apiCall('/api/auth/update-password', 'POST', {
        oldPassword: pwForm.oldPass,
        newPassword: pwForm.newPass,
      });
      if (res.success) {
        showToast('✅ Password change ho gaya! Dobara login karo.');
        setPwForm({ oldPass: '', newPass: '', confirmPass: '' });
        setTimeout(() => { localStorage.removeItem('mk_token'); localStorage.removeItem('mk_admin_user'); localStorage.removeItem('mk_admin_logged'); onLogout(); }, 2000);
      } else {
        showToast('❌ ' + (res.message || 'Password change failed'));
      }
    } catch { showToast('❌ Server error!'); }
    setPwSaving(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchPageData = (currentPage, isInitial = false) => {
    if (isInitial) setLoading(true);
    const done = () => { if (isInitial) setLoading(false); };

    if (currentPage === 'dashboard') {
      apiCall('/api/admin/stats').then(d => { if (d.success) { setStats(d.stats); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'users') {
      apiCall('/api/admin/users').then(d => { if (d.success) { setUsers(d.users); setLastRefresh(new Date()); } done(); }).catch(done);
  // NAYA — loading state + error message
} else if (currentPage === 'games' || currentPage === 'results') {
  apiCall('/api/admin/games').then(d => {
    if (d.success && d.games) {
      setGames(d.games);
      setLastRefresh(new Date());
      console.log('✅ Games loaded:', d.games.length);
    } else {
      console.error('❌ Games fetch failed:', d.message);
      showToast('❌ Games load nahi hue: ' + (d.message || 'Server error'));
    }
    done();
  }).catch(err => {
    console.error('Games fetch error:', err);
    showToast('❌ Server se connect nahi ho pa raha!');
    done();
  });
    } else if (currentPage === 'deposits') {
      apiCall('/api/admin/deposits').then(d => { if (d.success) { setDeposits(d.deposits); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'withdrawals') {
      apiCall('/api/admin/withdrawals').then(d => { if (d.success) { setWithdrawals(d.withdrawals); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'bids') {
      apiCall('/api/admin/bids').then(d => { if (d.success) { setBids(d.bids); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'notices') {
      apiCall('/api/admin/notices').then(d => { if (d.success) { setNotices(d.notices || []); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'settings') {
      apiCall('/api/admin/settings').then(d => {
        if (d.success && d.settings) {
          const s = d.settings;
          setSettings(prev => ({
            ...prev,
            site_name: s.site_name || prev.site_name,
            site_url: s.site_url || prev.site_url,
            upi_id: s.upi_id || prev.upi_id,
            upi_name: s.upi_name || prev.upi_name,
            whatsapp: s.whatsapp || s.whatsapp_support || prev.whatsapp,
            phone: s.phone || s.support_phone || prev.phone,
            telegram: s.telegram || s.telegram_user || prev.telegram,
            telegram_channel: s.telegram_channel || prev.telegram_channel,
            support_hours: s.support_hours || prev.support_hours,
            support_email: s.support_email || prev.support_email,
            min_deposit: s.min_deposit || prev.min_deposit,
            max_deposit: s.max_deposit || prev.max_deposit,min_withdrawal: s.min_withdrawal || prev.min_withdrawal,
            max_withdrawal: s.max_withdrawal || prev.max_withdrawal,
            maintenance_mode: s.maintenance_mode || '0',
            qr_image: s.qr_image || '',
          }));
        }
        done();
      }).catch(done);
    } else { done(); }
  };

  useEffect(() => {
    if (!adminReady) return;
    fetchPageData(page, true);
    const realtimePages = ['dashboard', 'bids', 'deposits', 'withdrawals', 'notices'];
    let interval = null;
    if (realtimePages.includes(page)) {
      interval = setInterval(() => fetchPageData(page, false), 15000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [page, adminReady]);

  const navigateTo = (id) => { setPage(id); setDrawerOpen(false); };

  // ── USER ACTIONS ──
  const toggleBlock = async (id, blocked) => {
    const res = await apiCall(`/api/admin/users/${id}/block`, 'PUT', { block: !blocked });
    if (res.success) { setUsers(us => us.map(u => u.id === id ? { ...u, is_blocked: !blocked } : u)); showToast(blocked ? 'User unblocked ✅' : 'User blocked 🚫'); }
  };
  const addCoins = async (id) => {
    const a = prompt('Kitne coins ADD karne hain?'); if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'add', wallet: 'wallet' });
    if (res.success) { showToast('Coins added ✅'); fetchPageData('users', false); } else showToast('Error: ' + res.message);
  };
  const deductCoins = async (id) => {
    const a = prompt('Kitne coins DEDUCT karne hain?'); if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'deduct', wallet: 'wallet' });
    if (res.success) { showToast('Coins deducted ✅'); fetchPageData('users', false); } else showToast('Error: ' + res.message);
  };

  // ── CHANGE MOBILE HANDLER ──────────────────────────────────
  const handleChangeMobile = (user) => {
    setChangeMobileUser(user);
  };

  // ── LOGIN AS USER HANDLER ──────────────────────────────────
  const loginAsUser = async (id) => {
    const res = await apiCall(`/api/admin/users/${id}/login-as`, 'POST');
    if (res.success) {
      localStorage.setItem('mk_admin_token', localStorage.getItem('mk_token')); // Backup Admin Token
      localStorage.setItem('mk_token', res.token); // Set User Token
      window.location.href = '/'; // Redirect to User App
    } else {
      showToast('❌ Error: ' + (res.message || 'Failed to login as user'));
    }
  };

  // ── GAME ACTIONS ──
  const addGame = async () => {
    if (!newGame.name || !newGame.open_time || !newGame.close_time) { showToast('Saari details bhariye!'); return; }
    const res = await apiCall('/api/admin/games', 'POST', { ...newGame, category: 'regular' });
    if (res.success) { setGames(gs => [...gs, res.game || res.data]); setNewGame({ name: '', open_time: '', close_time: '' }); showToast('Game added ✅'); fetchPageData('games'); }
    else showToast('Error: ' + res.message);
  };
  const toggleGameStatus = async (id, status) => {
    const newStatus = status === 'open' ? 'closed' : 'open';
    const res = await apiCall(`/api/admin/games/${id}/status`, 'PUT', { status: newStatus });
    if (res.success) { setGames(gs => gs.map(g => g.id === id ? { ...g, status: newStatus } : g)); showToast(`Game ${newStatus} ✅`); }
  };
  const declareResult = async (gameId) => {
    const val = resultForm[gameId]; if (!val) return;
    const parts = val.split('-');
    const res = await apiCall(`/api/admin/games/${gameId}/result`, 'PUT', { open_result: parts[0] || '', close_result: parts[1] || '' });
    if (res.success) { setGames(gs => gs.map(g => g.id === gameId ? { ...g, result: val } : g)); setResultForm(rf => ({ ...rf, [gameId]: '' })); showToast('Result declared! Winners credited ✅'); }
    else showToast('Error: ' + (res.message || 'Failed'));
  };

  // ── DEPOSITS / WITHDRAWALS ──
  const updateDeposit = async (id, action) => {
    const res = await apiCall(`/api/admin/deposits/${id}`, 'PUT', { action });
    if (res.success) { setDeposits(ds => ds.map(d => d.id === id ? { ...d, status: action === 'approve' ? 'approved' : 'rejected' } : d)); showToast(`Deposit ${action}d ✅`); }
  };
  const updateWithdrawal = async (id, action) => {
    const res = await apiCall(`/api/admin/withdrawals/${id}`, 'PUT', { action });
    if (res.success) { setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } : w)); showToast(`Withdrawal ${action}d ✅`); }
  };

  // ── QR CODE UPLOAD ──
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { showToast('QR image 500KB se chhoti honi chahiye!'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setSettings(s => ({ ...s, qr_image: ev.target.result })); showToast('QR image load hua — Save karo ✅'); };
    reader.readAsDataURL(file);
  };

  // ── SAVE SETTINGS ──
  const saveSettings = async () => {
    setSavingSettings(true);
    const payload = {
      site_name: settings.site_name, site_url: settings.site_url, upi_id: settings.upi_id,
      upi_name: settings.upi_name || settings.site_name || 'MatkaKing',
      whatsapp: settings.whatsapp, whatsapp_support: settings.whatsapp,
      phone: settings.phone, support_phone: settings.phone,
      telegram: settings.telegram, telegram_channel: settings.telegram_channel,
      support_hours: settings.support_hours, support_email: settings.support_email,
      min_deposit: settings.min_deposit, max_deposit: settings.max_deposit,
      min_withdrawal: settings.min_withdrawal, max_withdrawal: settings.max_withdrawal,
      maintenance_mode: settings.maintenance_mode, qr_image: settings.qr_image,
    };
    const res = await apiCall('/api/admin/settings', 'POST', payload);
    setSavingSettings(false);
    if (res.success) { setSettingsSaved(true); showToast('✅ Sab settings save ho gayi!'); setTimeout(() => setSettingsSaved(false), 3000); }
    else showToast('❌ Error: ' + res.message);
  };

  const autoQrUrl = settings.upi_id
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('upi://pay?pa=' + settings.upi_id + '&pn=' + encodeURIComponent(settings.upi_name || 'MatkaKing') + '&cu=INR')}`
    : null;

  const SIDEBAR = [
    { id: 'dashboard', ic: '📊', l: 'Dashboard' },
    { id: 'users', ic: '👥', l: 'Users' },
    { id: 'games', ic: '🎮', l: 'Games' },
    { id: 'deposits', ic: '💰', l: 'Deposits' },
    { id: 'withdrawals', ic: '💸', l: 'Withdrawals' },
    { id: 'bids', ic: '🎯', l: 'All Bids' },
    { id: 'results', ic: '🏆', l: 'Declare Result' },
    { id: 'notices', ic: '🔔', l: 'Notices' },
    { id: 'settings', ic: '⚙️', l: 'Settings' },
  ];

  const pageTitles = {
    dashboard: '📊 Dashboard', users: '👥 Users', games: '🎮 Manage Games',
    deposits: '💰 Deposit Requests', withdrawals: '💸 Withdrawal Requests',
    bids: '🎯 All Player Bids', results: '🏆 Declare Results',
    notices: '🔔 Notices & Alerts', settings: '⚙️ Settings',
  };

  if (!adminReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.pageBg, color: C.primary, fontSize: 16, fontWeight: 700 }}>
        ⏳ Verifying admin...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.pageBg, fontFamily: '"Segoe UI", sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: C.textMain, color: '#fff', padding: '14px 24px', borderRadius: 12, borderLeft: `4px solid ${C.accent}`, boxShadow: '0 10px 30px rgba(13,27,94,0.25)', zIndex: 9999, fontWeight: 700, fontSize: 14, maxWidth: 320 }}>
          {toast}
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={(updated) => {
            setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
            showToast('Game updated ✅');
          }}
        />
      )}

      {/* Change Mobile Modal */}
      {changeMobileUser && (
        <ChangeMobileModal
          user={changeMobileUser}
          onClose={() => setChangeMobileUser(null)}
          onSave={(newMobile) => {
            setUsers(us => us.map(u => u.id === changeMobileUser.id ? { ...u, mobile: newMobile } : u));
            showToast('📱 Mobile number update ho gaya ✅');
            setChangeMobileUser(null);
          }}
        />
      )}

      {/* NAVBAR */}
      <div style={{ background: C.navBg, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 3px 20px rgba(13,27,94,0.35)', flexShrink: 0 }}>
        <button onClick={() => setDrawerOpen(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, width: 42, height: 42, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 0 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 20, height: 2.5, background: '#fff', borderRadius: 2 }} />)}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>👑</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 1.5, lineHeight: 1 }}>
              {settings.site_name || 'SAKTA MATKA'}
            </div>
            <div style={{ fontSize: 9, color: C.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>

        <button onClick={() => { localStorage.removeItem('mk_token'); localStorage.removeItem('mk_admin_user'); localStorage.removeItem('mk_admin_logged'); onLogout(); }} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer', letterSpacing: 0.5 }}>
          LOGOUT
        </button>
      </div>

      {/* DRAWER OVERLAY */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 300 }} />}

      {/* SIDE DRAWER */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 272, background: C.drawerBg, zIndex: 400, overflowY: 'auto', paddingBottom: 40, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: drawerOpen ? '5px 0 40px rgba(0,0,0,0.4)' : 'none' }}>
        <div style={{ background: C.navBg, padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{settings.site_name || 'SAKTA MATKA'}</div>
            <div style={{ fontSize: 11, color: C.accent, marginTop: 4, fontWeight: 700, letterSpacing: 1 }}>Admin Control Panel</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', padding: '20px 20px 8px', fontWeight: 800 }}>Navigation</div>

        {SIDEBAR.map(s => (
          <div key={s.id} onClick={() => navigateTo(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: page === s.id ? 'rgba(21,101,192,0.5)' : 'transparent',
            borderLeft: page === s.id ? `4px solid ${C.accent}` : '4px solid transparent',
            color: page === s.id ? '#fff' : 'rgba(255,255,255,0.65)',
            fontSize: 14, fontWeight: page === s.id ? 800 : 500,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 19, width: 24, textAlign: 'center' }}>{s.ic}</span>
            {s.l}
            {page === s.id && <span style={{ marginLeft: 'auto', color: C.accent, fontSize: 18 }}>›</span>}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.textMain }}>{pageTitles[page]}</div>
          {['dashboard', 'bids', 'deposits', 'withdrawals', 'notices'].includes(page) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E3F2FD', border: `1.5px solid #90CAF9`, borderRadius: 20, padding: '6px 12px', fontSize: 11, color: C.primary, fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1976D2', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
              LIVE {lastRefresh && <span style={{ color: '#64B5F6', marginLeft: 4 }}>· {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
            </div>
          )}
        </div>

        <style>{`
          @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)} }
          input:focus,select:focus { border-color: ${C.inputFocus} !important; box-shadow: 0 0 0 3px rgba(21,101,192,0.12) !important; }
        `}</style>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: C.textMuted, fontSize: 15, fontWeight: 700 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            Loading Data...
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {!loading && page === 'dashboard' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { val: stats.total_users || 0, label: 'Total Users', color: C.primary, icon: '👥' },
              { val: stats.active_games || 0, label: 'Active Games', color: '#7B1FA2', icon: '🎮' },
              { val: stats.today_bids?.count || 0, label: 'Aaj ke Bids', color: C.warn, icon: '🎯' },
              { val: '₹' + (stats.today_bids?.volume || 0).toLocaleString(), label: 'Bid Volume', color: C.warn, icon: '📈' },
              { val: stats.pending_deposits?.count || 0, label: 'Pending Deposits', color: C.danger, icon: '⏳' },
              { val: '₹' + (stats.pending_deposits?.volume || 0).toLocaleString(), label: 'Pending Dep. Amt', color: C.danger, icon: '💳' },
              { val: stats.pending_withdrawals?.count || 0, label: 'Pending Withdraw', color: '#D84315', icon: '🔄' },
              { val: '₹' + (stats.pending_withdrawals?.volume || 0).toLocaleString(), label: 'Pending With. Amt', color: '#D84315', icon: '💵' },
              { val: '₹' + (stats.total_deposited || 0).toLocaleString(), label: 'Total Deposited', color: '#0277BD', icon: '🏦' },
              { val: '₹' + (stats.total_winnings_paid || 0).toLocaleString(), label: 'Winnings Paid', color: C.success, icon: '🏆' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 16, padding: 16, boxShadow: C.cardShadow, border: `1.5px solid ${C.cardBorder}`, borderLeft: `5px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4, fontWeight: 800 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {!loading && page === 'users' && (
          <div>
            {users.length === 0
              ? <div style={{ textAlign: 'center', color: C.textMuted, padding: 40, fontWeight: 700 }}>Koi user nahi mila</div>
              : users.map(u => (
                <UserCard
                  key={u.id}
                  u={u}
                  onBlock={toggleBlock}
                  onAddCoins={addCoins}
                  onDeductCoins={deductCoins}
                  onChangeMobile={handleChangeMobile}
                  onLoginAs={loginAsUser}
                />
              ))
            }
          </div>
        )}

        {/* ── GAMES ── */}
        {!loading && page === 'games' && <>
          <div style={B.card}>
            <div style={B.title}>➕ Add New Game</div>
            <label style={B.label}>Game Name</label>
            <input style={B.input} placeholder="Game Name (e.g. Kalyan)" value={newGame.name} onChange={e => setNewGame({ ...newGame, name: e.target.value })} />
            <label style={B.label}>Open Time</label>
            <TimePicker value={newGame.open_time} onChange={v => setNewGame({ ...newGame, open_time: v })} />
            <label style={B.label}>Close Time</label>
            <TimePicker value={newGame.close_time} onChange={v => setNewGame({ ...newGame, close_time: v })} />
            <button style={B.btn} onClick={addGame}>+ ADD GAME</button>
          </div>

          <div style={B.card}>
            <div style={B.title}>🎮 All Games</div>
            {games.length === 0
              ? <div style={{ color: C.textMuted, textAlign: 'center', padding: 20, fontWeight: 700 }}>No games found.</div>
              : games.map(g => (
                <div key={g.id} style={{ background: C.inputBg, borderRadius: 12, padding: 14, marginBottom: 12, border: `1.5px solid ${C.cardBorder}`, opacity: g.is_hidden ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.textMain }}>
                        {g.name} {g.is_hidden && <span style={{ fontSize: 10, color: C.danger, background: C.dangerBg, padding: '2px 6px', borderRadius: 6 }}>HIDDEN</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.textSub, marginTop: 4, fontWeight: 600 }}>
                        🕐 {displayTime(g.open_time)} – {displayTime(g.close_time)}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, fontWeight: 700 }}>
                        Result: <strong style={{ color: C.primary, fontSize: 13 }}>{g.open_result || '***'}-{g.jodi_result || '**'}-{g.close_result || '***'}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingGame(g)}
                          style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: C.badgePend, color: C.primary, fontSize: 11, fontWeight: 800 }}>
                          ✏️ Edit
                        </button>
                        <button onClick={async () => {
                          const res = await apiCall(`/api/admin/games/${g.id}/hide`, 'PUT', { hide: !g.is_hidden });
                          if (res.success) { showToast(g.is_hidden ? 'Game Show ✅' : 'Game Hide 🙈'); setGames(gs => gs.map(item => item.id === g.id ? { ...item, is_hidden: !g.is_hidden } : item)); }
                        }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: g.is_hidden ? C.successBg : C.warnBg, color: g.is_hidden ? C.success : C.warn, fontSize: 11, fontWeight: 800 }}>
                          {g.is_hidden ? '👁️ Show' : '🙈 Hide'}
                        </button>
                        <button onClick={async () => {
                          if (!window.confirm(`"${g.name}" delete karna chahte hain?`)) return;
                          const res = await apiCall(`/api/admin/games/${g.id}`, 'DELETE');
                          if (res.success) { showToast('Game deleted 🗑️'); setGames(prev => prev.filter(item => item.id !== g.id)); }
                        }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: C.dangerBg, color: C.danger, fontSize: 11, fontWeight: 800 }}>
                          🗑️ Del
                        </button>
                      </div>
                      <StatusBadge status={g.status} />
                      <button onClick={() => toggleGameStatus(g.id, g.status)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 11, background: g.status === 'open' ? C.successBg : C.badgePend, color: g.status === 'open' ? C.success : C.primary, textTransform: 'uppercase' }}>
                        {g.status === 'open' ? '🟢 Close' : '🔵 Open'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>}

        {/* ── DEPOSITS ── */}
        {!loading && page === 'deposits' && (
          <div>
            {deposits.length === 0
              ? <div style={{ textAlign: 'center', color: C.textMuted, padding: 40, fontWeight: 700 }}>Koi deposit request nahi</div>
              : deposits.map(d => <DepositCard key={d.id} d={d} onApprove={id => updateDeposit(id, 'approve')} onReject={id => updateDeposit(id, 'reject')} />)}
          </div>
        )}

        {/* ── WITHDRAWALS ── */}
        {!loading && page === 'withdrawals' && (
          <div>
            {withdrawals.length === 0
              ? <div style={{ textAlign: 'center', color: C.textMuted, padding: 40, fontWeight: 700 }}>Koi withdrawal request nahi</div>
              : withdrawals.map(w => <WithdrawCard key={w.id} w={w} onApprove={id => updateWithdrawal(id, 'approve')} onReject={id => updateWithdrawal(id, 'reject')} />)}
          </div>
        )}

        {/* ── BIDS ── */}
        {!loading && page === 'bids' && (
          <div>
            {bids.length === 0
              ? <div style={{ textAlign: 'center', color: C.textMuted, padding: 40, fontWeight: 700 }}>Koi bid nahi mili</div>
              : bids.map(b => (
                <div key={b.id} style={B.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 900, color: C.textMain, fontSize: 15 }}>
                      {b.name} <span style={{ color: C.textSub, fontSize: 12, fontWeight: 600 }}>({b.mobile})</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ background: C.inputBg, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: C.textMain, lineHeight: 1.8, fontWeight: 600, border: `1px solid ${C.cardBorder}` }}>
                    Game: <strong style={{ color: C.primary }}>{b.game_name}</strong> · Session: <strong style={{ color: C.textSub }}>{b.session?.toUpperCase() || 'N/A'}</strong> · Type: <strong>{b.game_type}</strong><br />
                    Number: <strong style={{ fontSize: 15 }}>{b.number}</strong> · Amount: <strong style={{ color: C.success, fontSize: 15 }}>₹{Number(b.amount).toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10, fontWeight: 600 }}>📅 {toISTlocal(b.created_at)}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── DECLARE RESULT ── */}
        {!loading && page === 'results' && (
          <div style={B.card}>
            <div style={B.title}>🏆 Declare Results</div>
            <div style={{ background: '#E3F2FD', border: `1.5px solid #90CAF9`, borderRadius: 10, padding: 12, color: C.primary, fontSize: 12, marginBottom: 16, fontWeight: 600, lineHeight: 1.6 }}>
              Format: <strong>OpenPana-ClosePana</strong> (e.g. <code>128-456</code>)<br />
              Digit auto-calculate hoga. Winners ko winning_balance credit milega.
            </div>
            {games.length === 0 ? <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 700, padding: 10 }}>Koi game nahi mila.</div> : games.map(g => (
              <div key={g.id} style={{ background: C.inputBg, borderRadius: 12, padding: 14, marginBottom: 12, border: `1.5px solid ${C.cardBorder}` }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.textMain, marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 12, fontWeight: 600 }}>
                  {displayTime(g.open_time)} – {displayTime(g.close_time)} · Result: <strong style={{ color: C.primary, fontSize: 13 }}>{g.open_result || '***'}-{g.jodi_result || '**'}-{g.close_result || '***'}</strong>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input style={{ ...B.input, flex: 1, marginBottom: 0 }} placeholder="e.g. 128-456" value={resultForm[g.id] || ''} onChange={e => setResultForm(rf => ({ ...rf, [g.id]: e.target.value }))} />
                  <button style={{ ...B.btn, width: 'auto', padding: '12px 24px', background: 'linear-gradient(135deg, #2E7D32, #43A047)' }} onClick={() => declareResult(g.id)}>SET</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTICES ── */}
        {!loading && page === 'notices' && (
          <div style={B.card}>
            <div style={B.title}>🔔 Send Notification</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <input style={{ ...B.input, flex: 1, marginBottom: 0 }} placeholder="Message likhein..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} />
              <button style={{ ...B.btn, width: 'auto', padding: '12px 24px' }} onClick={async () => {
                if (!noticeMsg) return;
                const res = await apiCall('/api/admin/notices', 'POST', { message: noticeMsg, type: 'info' });
                if (res.success) { showToast('Notice sent ✅'); setNoticeMsg(''); fetchPageData('notices'); }
                else showToast('Error: ' + res.message);
              }}>SEND</button>
            </div>
            <div style={B.title}>📋 Active Notifications</div>
            {notices.length === 0
              ? <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 700, padding: 10 }}>Koi active notice nahi.</div>
              : notices.map(n => (
                <div key={n.id} style={{ background: C.inputBg, padding: 14, borderRadius: 10, marginBottom: 10, borderLeft: `4px solid ${C.primary}`, border: `1px solid ${C.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: C.textMain, fontSize: 14, fontWeight: 600, flex: 1, paddingRight: 10 }}>{n.message}</div>
                  <button onClick={async () => {
                    if (!window.confirm('Delete this notice?')) return;
                    const res = await apiCall(`/api/admin/notices/${n.id}`, 'DELETE');
                    if (res.success) { showToast('Notice deleted ✅'); fetchPageData('notices'); }
                  }} style={{ background: C.dangerBg, color: C.danger, border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800 }}>DEL</button>
                </div>
              ))
            }
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {!loading && page === 'settings' && (
          <div>
            <div style={B.card}>
              <div style={B.title}>🏷️ Site Identity</div>
              <label style={B.label}>Site Name</label>
              <input style={B.input} placeholder="e.g. MATKA BOSS" value={settings.site_name} onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} />
              <label style={B.label}>Site URL (Domain)</label>
              <input style={B.input} placeholder="https://yourdomain.com" value={settings.site_url} onChange={e => setSettings(s => ({ ...s, site_url: e.target.value }))} />
              {settings.site_url && (
                <div style={{ background: '#E3F2FD', borderRadius: 8, padding: '8px 12px', marginTop: -8, marginBottom: 12, fontSize: 12, color: '#1565C0', fontWeight: 600 }}>
                  🔗 Referral Link: <strong>{settings.site_url}?ref=CODE</strong>
                </div>
              )}
            </div>

            <div style={B.card}>
              <div style={B.title}>💳 Payment Settings</div>
              <label style={B.label}>UPI ID</label>
              <input style={B.input} placeholder="yourname@upi" value={settings.upi_id} onChange={e => setSettings(s => ({ ...s, upi_id: e.target.value }))} />
              <label style={B.label}>UPI Display Name</label>
              <input style={B.input} placeholder="MatkaKing" value={settings.upi_name} onChange={e => setSettings(s => ({ ...s, upi_name: e.target.value }))} />

              <div style={{ background: C.inputBg, border: `1.5px solid ${C.cardBorder}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: C.primary, fontWeight: 900, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>📱 QR Code Preview</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center', flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 11, color: C.textSub, fontWeight: 700, marginBottom: 8 }}>AUTO QR (UPI ID se)</div>
                    {autoQrUrl
                      ? <img src={autoQrUrl} alt="UPI QR" style={{ width: 160, height: 160, borderRadius: 12, border: `3px solid ${C.primary}`, display: 'block', margin: '0 auto' }} />
                      : <div style={{ width: 160, height: 160, borderRadius: 12, border: `2px dashed ${C.inputBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: 12, fontWeight: 700, margin: '0 auto' }}>UPI ID daalo ↑</div>
                    }
                    {settings.upi_id && <div style={{ fontSize: 12, color: C.textMain, marginTop: 8, fontWeight: 800 }}>{settings.upi_id}</div>}
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 11, color: C.textSub, fontWeight: 700, marginBottom: 8 }}>CUSTOM QR (Upload karo)</div>
                    {settings.qr_image
                      ? <img src={settings.qr_image} alt="Custom QR" style={{ width: 160, height: 160, borderRadius: 12, border: `3px solid ${C.success}`, display: 'block', margin: '0 auto', objectFit: 'contain', background: '#fff' }} />
                      : <div style={{ width: 160, height: 160, borderRadius: 12, border: `2px dashed #A5D6A7`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A5D6A7', fontSize: 12, fontWeight: 700, margin: '0 auto', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>📷</span>Upload QR
                      </div>
                    }
                    <input ref={qrFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleQrUpload} />
                    <button onClick={() => qrFileRef.current?.click()} style={{ marginTop: 10, padding: '8px 20px', borderRadius: 10, border: `1.5px solid ${C.success}`, background: C.successBg, color: C.success, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                      📷 {settings.qr_image ? 'Change QR' : 'Upload QR'}
                    </button>
                    {settings.qr_image && (
                      <button onClick={() => setSettings(s => ({ ...s, qr_image: '' }))} style={{ marginTop: 6, padding: '6px 14px', borderRadius: 10, border: 'none', background: C.dangerBg, color: C.danger, fontWeight: 800, fontSize: 11, cursor: 'pointer', display: 'block', margin: '6px auto 0' }}>
                        ❌ Remove Custom QR
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 12, background: '#E3F2FD', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: C.primary, fontWeight: 600 }}>
                  💡 <strong>Note:</strong> Custom QR upload karo toh deposit page pe dikhega. Nahi karo toh Auto QR dikhega.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Min Deposit (₹)', key: 'min_deposit', ph: '100' },
                  { label: 'Max Deposit (₹)', key: 'max_deposit', ph: '100000' },
                  { label: 'Min Withdrawal (₹)', key: 'min_withdrawal', ph: '500' },
                  { label: 'Max Withdrawal (₹)', key: 'max_withdrawal', ph: '50000' },
                ].map(({ label, key, ph }) => (
                  <div key={key}>
                    <label style={B.label}>{label}</label>
                    <input style={B.input} type="number" placeholder={ph} value={settings[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>

            <div style={B.card}>
              <div style={B.title}>📞 Contact & Support</div>
              <label style={B.label}>WhatsApp Number (with country code)</label>
              <input style={B.input} type="tel" placeholder="919665052729" value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} />
              {settings.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: -6, marginBottom: 12, padding: '6px 16px', borderRadius: 8, background: C.successBg, color: C.success, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
                  🟢 WhatsApp Test karo
                </a>
              )}
              <label style={B.label}>Phone Number</label>
              <input style={B.input} type="tel" placeholder="9665052729" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
              <label style={B.label}>Telegram Username</label>
              <input style={B.input} placeholder="matkaking_support" value={settings.telegram} onChange={e => setSettings(s => ({ ...s, telegram: e.target.value.replace('@', '') }))} />
              <label style={B.label}>Telegram Channel (optional)</label>
              <input style={B.input} placeholder="matkaking_official" value={settings.telegram_channel} onChange={e => setSettings(s => ({ ...s, telegram_channel: e.target.value.replace('@', '') }))} />
              <label style={B.label}>Support Email (optional)</label>
              <input style={B.input} type="email" placeholder="support@matkaking.com" value={settings.support_email} onChange={e => setSettings(s => ({ ...s, support_email: e.target.value }))} />
              <label style={B.label}>Support Hours</label>
              <input style={B.input} placeholder="Mon–Sat 10AM–8PM" value={settings.support_hours} onChange={e => setSettings(s => ({ ...s, support_hours: e.target.value }))} />
            </div>

            {/* ── CHANGE PASSWORD ── */}
            <div style={B.card}>
              <div style={B.title}>🔐 Change Admin Password</div>
              <label style={B.label}>Current Password</label>
              <input type="password" style={B.input} placeholder="Current password" value={pwForm.oldPass} onChange={e => setPwForm(f => ({ ...f, oldPass: e.target.value }))} />
              <label style={B.label}>New Password</label>
              <input type="password" style={B.input} placeholder="Min 6 characters" value={pwForm.newPass} onChange={e => setPwForm(f => ({ ...f, newPass: e.target.value }))} />
              <label style={B.label}>Confirm New Password</label>
              <input type="password" style={{ ...B.input, marginBottom: 0 }} placeholder="Dobara likhein" value={pwForm.confirmPass} onChange={e => setPwForm(f => ({ ...f, confirmPass: e.target.value }))} />
              <button onClick={changeAdminPassword} disabled={pwSaving}
                style={{ ...B.btn, marginTop: 14, background: pwSaving ? '#90CAF9' : 'linear-gradient(135deg, #6A1B9A, #8E24AA)', opacity: pwSaving ? 0.8 : 1 }}>
                {pwSaving ? '⏳ CHANGING...' : '🔐 CHANGE PASSWORD'}
              </button>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8, textAlign: 'center', fontWeight: 600 }}>
                Password change hone ke baad auto logout ho jayega
              </div>
            </div>

            <div style={B.card}>
              <div style={B.title}>🔧 Maintenance Mode</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div onClick={() => setSettings(s => ({ ...s, maintenance_mode: s.maintenance_mode === '1' ? '0' : '1' }))}
                  style={{ width: 56, height: 28, borderRadius: 14, background: settings.maintenance_mode === '1' ? C.danger : '#B0BEC5', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.maintenance_mode === '1' ? 31 : 3, transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: settings.maintenance_mode === '1' ? C.danger : C.success, fontSize: 14 }}>
                    {settings.maintenance_mode === '1' ? '🔴 Site Band Hai (Maintenance ON)' : '🟢 Site Chal Rahi Hai (Normal)'}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>ON karo toh users login nahi kar payenge</div>
                </div>
              </div>
            </div>

            <button onClick={saveSettings} disabled={savingSettings} style={{
              ...B.btn, marginTop: 8, marginBottom: 30,
              background: settingsSaved ? 'linear-gradient(135deg,#2E7D32,#43A047)' : savingSettings ? '#90CAF9' : B.btn.background,
              opacity: savingSettings ? 0.8 : 1
            }}>
              {savingSettings ? '⏳ SAVING...' : settingsSaved ? '✅ SAVED!' : '💾 SAVE ALL SETTINGS'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
