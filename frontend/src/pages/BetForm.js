import React, { useState } from 'react';
import { SINGLE_PANAS, DOUBLE_PANAS, TRIPLE_PANAS } from '../data/gameData';

const DIGITS = [0,1,2,3,4,5,6,7,8,9];
const JODIS = Array.from({length:100},(_,i)=>String(i).padStart(2,'0'));

// ── FIXED: AmtInput bahar move kiya — focus problem fix ──
function AmtInput({ amt, setAmt, chips, label = 'Bid Amount (Min ₹10)' }) {
  return (
    <div className="bf-fg">
      <label className="bf-label">{label}</label>
      <input
        className="bf-input"
        type="number"
        placeholder="₹0"
        value={amt}
        onChange={e => setAmt(e.target.value)}
        inputMode="numeric"
        autoComplete="off"
      />
      <div className="bf-chips-row">
        {chips.map(c => (
          <div key={c} className={`bf-chip${amt === String(c) ? ' active' : ''}`} onClick={() => setAmt(String(c))}>₹{c}</div>
        ))}
      </div>
    </div>
  );
}

export default function BetForm({ game, gameType, wallet, onSubmit }) {
  const [num, setNum] = useState('');
  const [num2, setNum2] = useState('');
  const [activeN, setActiveN] = useState(null);
  const [amt, setAmt] = useState('');
  const [bets, setBets] = useState([]);
  const [oddEven, setOddEven] = useState('');
  const [openClose, setOpenClose] = useState('open');
  const [cycleDigit, setCycleDigit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const chips = [10, 50, 100, 200, 500];
  const id = gameType.id;
  const nt = gameType.numType;

  const getCycleJodis = (d) => {
    if (d === null) return [];
    const res = [];
    for (let i = 0; i <= 9; i++) { res.push(String(d)+String(i)); res.push(String(i)+String(d)); }
    return [...new Set(res)].sort();
  };
  const cycleJodis = getCycleJodis(cycleDigit);

  const getDigitJodis = (d, side) => {
    if (d === null) return [];
    const res = [];
    for (let i = 0; i <= 9; i++) {
      if (side === 'open') res.push(String(d)+String(i));
      else res.push(String(i)+String(d));
    }
    return res;
  };
  const digitJodis = getDigitJodis(activeN, openClose);

  const isBulkType = nt==='ank_bulk'||nt==='jodi_bulk'||nt==='pana_bulk'||id==='sp_common'||id==='dp_common'||id==='cycle_jodi'||id==='digit_jodi';

  const addToBulk = () => {
    if (id === 'cycle_jodi') {
      if (!amt || Number(amt) < 10) return;
      setBets(b => [...b, ...cycleJodis.map(j => ({ num: j, amt: Number(amt) }))]);
      setCycleDigit(null); setAmt('');
    } else if (id === 'digit_jodi') {
      if (!amt || Number(amt) < 10 || activeN === null) return;
      setBets(b => [...b, ...digitJodis.map(j => ({ num: j, amt: Number(amt) }))]);
      setActiveN(null); setAmt('');
    } else {
      if (!num || !amt || Number(amt) < 10) return;
      setBets(b => [...b, { num, amt: Number(amt) }]);
      setNum(''); setActiveN(null); setAmt('');
    }
  };
  const removeBet = i => setBets(b => b.filter((_, idx) => idx !== i));
  const totalAmt = bets.reduce((a, b) => a + b.amt, 0);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const commonData = { session: openClose };
      if (isBulkType) {
        if (!bets.length) { setSubmitting(false); return; }
        await onSubmit({ numbers: bets, totalAmt, ...commonData });
      } else if (id === 'odd_even') {
        if (!oddEven || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: oddEven, amount: Number(amt), ...commonData });
      } else if (id === 'half_sangam_a' || id === 'half_sangam_b' || id === 'full_sangam') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}-${num2}`, amount: Number(amt), ...commonData });
      } else if (id === 'two_digit_pana') {
        if (!num || !num2 || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: `${num}|${num2}`, amount: Number(amt), ...commonData });
      } else {
        if (!num || !amt || Number(amt) < 10) { setSubmitting(false); return; }
        await onSubmit({ number: num, amount: Number(amt), ...commonData });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const WinInfo = () => (
    <div className="bf-infobox">
      Bid: <strong>₹{Number(amt||0).toLocaleString()}</strong> &nbsp;→&nbsp;
      Win: <strong>₹{(Number(amt||0)*parseInt(gameType.win)).toLocaleString()}</strong>
    </div>
  );

  const PlaceBtn = () => (
    <button className="bf-place-btn" onClick={handleSubmit} disabled={submitting}>
      {submitting ? '⏳ Placing...' : `🎯 Place Bid — ₹${Number(amt||0).toLocaleString()}`}
    </button>
  );

  const BulkTable = () => (bets.length > 0 ? (
    <>
      <div className="bf-bulk-table-wrap">
        <table className="bf-table">
          <thead><tr><th>#</th><th>Number</th><th>Amount</th><th></th></tr></thead>
          <tbody>{bets.map((b, i) => (
            <tr key={i}>
              <td>{i+1}</td>
              <td><strong>{b.num}</strong></td>
              <td>₹{b.amt.toLocaleString()}</td>
              <td><button className="bf-del" onClick={() => removeBet(i)}>✕</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="bf-total-row">
        <span>Total Bets: {bets.length}</span>
        <strong>₹{totalAmt.toLocaleString()}</strong>
      </div>
    </>
  ) : null);

  const AddBtn = ({ label = '+ Add to List' }) => (
    <button onClick={addToBulk} className="bf-add-btn">{label}</button>
  );

  const PlaceAllBtn = () => (
    <button className="bf-place-btn" onClick={handleSubmit} disabled={submitting} style={{marginTop:12}}>
      {submitting ? '⏳ Placing...' : `🎯 Place All Bids — ₹${totalAmt.toLocaleString()}`}
    </button>
  );

  const NumGrid = ({ selected, onSelect }) => (
    <div className="bf-num-grid">
      {DIGITS.map(d => (
        <div key={d} className={`bf-nchip${selected === String(d) ? ' active' : ''}`} onClick={() => onSelect(String(d))}>{d}</div>
      ))}
    </div>
  );

  const JodiGrid = ({ selected, onSelect }) => (
    <div className="bf-jodi-scroll">
      <div className="bf-jodi-grid">
        {JODIS.map(j => (
          <div key={j} className={`bf-jchip${selected === j ? ' active' : ''}`} onClick={() => onSelect(j)}>{j}</div>
        ))}
      </div>
    </div>
  );

  const PanaGrid = ({ panas, selected, onSelect }) => (
    <div className="bf-pana-grid">
      {panas.map(p => (
        <div key={p} className={`bf-pchip${selected === p ? ' active' : ''}`} onClick={() => onSelect(p)}>{p}</div>
      ))}
    </div>
  );

  const SessionToggle = () => (
    <div className="bf-fg">
      <label className="bf-label">Select Session</label>
      <div className="bf-session-row">
        {['open','close'].map(s => (
          <div key={s} className={`bf-session-btn${openClose === s ? ' active' : ''}`} onClick={() => setOpenClose(s)}>
            {s === 'open' ? '🌅 OPEN' : '🌙 CLOSE'}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bf-wrap">
      {/* Banner */}
      <div className="bf-banner">
        <div className="bf-banner-icon">{game.icon}</div>
        <div>
          <div className="bf-banner-name">{game.name}</div>
          <div className="bf-banner-sub">{gameType.label} &nbsp;|&nbsp; Win: {gameType.win}x &nbsp;|&nbsp; 💰 ₹{wallet.toLocaleString()}</div>
        </div>
      </div>

      <div className="bf-card">
        <div className="bf-title">🎯 {gameType.label}</div>
        <div className="bf-desc-box">{gameType.desc} &nbsp;— Multiplier: <strong>{gameType.win}x</strong></div>

        {id !== 'jodi' && id !== 'jodi_bulk' && id !== 'jodi_digit' && <SessionToggle />}

        {id === 'single_digit'      && <><div className="bf-fg"><label className="bf-label">Pick a Digit (0–9)</label><NumGrid selected={num} onSelect={v => { setNum(v); setActiveN(Number(v)); }} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'single_digit_bulk' && <><div className="bf-fg"><label className="bf-label">Pick Digits</label><NumGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips} label="Bid Amount (Min ₹10)"/><AddBtn label="+ Add Digit"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'jodi_digit'        && <><div className="bf-fg"><label className="bf-label">Pick Jodi (00–99)</label><JodiGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'jodi_bulk'         && <><div className="bf-fg"><label className="bf-label">Pick Jodi</label><JodiGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn label="+ Add Jodi"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'single_pana'       && <><div className="bf-fg"><label className="bf-label">Pick Single Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'single_pana_bulk'  && <><div className="bf-fg"><label className="bf-label">Pick Single Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'double_pana'       && <><div className="bf-fg"><label className="bf-label">Pick Double Pana</label><PanaGrid panas={DOUBLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'double_pana_bulk'  && <><div className="bf-fg"><label className="bf-label">Pick Double Pana</label><PanaGrid panas={DOUBLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'triple_pana'       && <><div className="bf-fg"><label className="bf-label">Pick Triple Pana</label><PanaGrid panas={TRIPLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'half_sangam_a'     && <><div className="bf-fg"><label className="bf-label">Open Digit (0–9)</label><NumGrid selected={num} onSelect={setNum} /></div><div className="bf-fg"><label className="bf-label">Close Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num2} onSelect={setNum2} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'half_sangam_b'     && <><div className="bf-fg"><label className="bf-label">Open Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num} onSelect={setNum} /></div><div className="bf-fg"><label className="bf-label">Close Digit (0–9)</label><NumGrid selected={num2} onSelect={setNum2} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'full_sangam'       && <><div className="bf-fg"><label className="bf-label">Open Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num} onSelect={setNum} /></div><div className="bf-fg"><label className="bf-label">Close Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num2} onSelect={setNum2} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'odd_even'          && <><div className="bf-fg"><label className="bf-label">Bet On</label><div className="bf-session-row">{['ODD','EVEN'].map(oe => (<div key={oe} className={`bf-session-btn${oddEven === oe ? ' active' : ''}`} onClick={() => setOddEven(oe)}>{oe}</div>))}</div></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {(id==='dp_motor'||id==='sp_motor') && <><div className="bf-fg"><label className="bf-label">Pick Pana</label><PanaGrid panas={id==='dp_motor'?DOUBLE_PANAS:SINGLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'red_jodi'          && <><div className="bf-fg"><label className="bf-label">Pick Jodi</label><JodiGrid selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'cycle_jodi'        && <><div className="bf-fg"><label className="bf-label">Pick a Digit to Cycle</label><NumGrid selected={cycleDigit !== null ? String(cycleDigit) : ''} onSelect={v => setCycleDigit(Number(v))} /></div>{cycleDigit !== null && <div className="bf-desc-box">Will add <strong>{cycleJodis.length} jodis</strong>: {cycleJodis.slice(0,6).join(', ')}...</div>}<AmtInput amt={amt} setAmt={setAmt} chips={chips} label="Amount per jodi"/><AddBtn label="+ Add All Cycle Jodis"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {id === 'sp_dp_tp'          && <><div className="bf-fg"><label className="bf-label">Enter Pana Number</label><input className="bf-input" type="text" placeholder="e.g. 128" maxLength={3} value={num} onChange={e => setNum(e.target.value)}/></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'two_digit_pana'    && <><div className="bf-fg"><label className="bf-label">Pick Jodi (2-digit)</label><JodiGrid selected={num} onSelect={setNum} /></div><div className="bf-fg"><label className="bf-label">Pick Pana</label><PanaGrid panas={SINGLE_PANAS} selected={num2} onSelect={setNum2} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><WinInfo/><PlaceBtn/></>}
        {id === 'digit_jodi'        && <><div className="bf-fg"><label className="bf-label">Open or Close?</label><div className="bf-session-row">{['open','close'].map(s => (<div key={s} className={`bf-session-btn${openClose === s ? ' active' : ''}`} onClick={() => setOpenClose(s)}>{s.toUpperCase()}</div>))}</div></div><div className="bf-fg"><label className="bf-label">Pick a Digit</label><NumGrid selected={activeN !== null ? String(activeN) : ''} onSelect={v => setActiveN(Number(v))} /></div>{activeN !== null && <div className="bf-desc-box">Will add <strong>{digitJodis.length} jodis</strong>: {digitJodis.join(', ')}</div>}<AmtInput amt={amt} setAmt={setAmt} chips={chips} label="Amount per jodi"/><AddBtn label="+ Add Digit Jodis"/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
        {(id==='sp_common'||id==='dp_common') && <><div className="bf-fg"><label className="bf-label">Pick {id==='sp_common'?'Single':'Double'} Pana</label><PanaGrid panas={id==='sp_common'?SINGLE_PANAS:DOUBLE_PANAS} selected={num} onSelect={setNum} /></div><AmtInput amt={amt} setAmt={setAmt} chips={chips}/><AddBtn/><BulkTable/>{bets.length > 0 && <PlaceAllBtn/>}</>}
      </div>

      <style>{`
        .bf-wrap { background: #f0f4ff; min-height: 100vh; padding-bottom: 80px; }

        .bf-banner {
          background: linear-gradient(135deg, #1565C0, #1976D2);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          border-bottom: 3px solid #0D47A1;
          box-shadow: 0 2px 12px rgba(21,101,192,0.3);
        }
        .bf-banner-icon {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .bf-banner-name { font-size: 18px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
        .bf-banner-sub  { font-size: 12px; color: rgba(255,255,255,0.82); margin-top: 2px; }

        .bf-card {
          background: #fff; margin: 12px; border-radius: 16px; padding: 16px;
          box-shadow: 0 2px 12px rgba(21,101,192,0.10);
          border: 1.5px solid #BBDEFB;
        }

        .bf-title {
          font-size: 16px; font-weight: 800; color: #1565C0;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
          text-transform: uppercase; letter-spacing: 1px;
        }

        .bf-desc-box {
          background: #EEF4FF; border: 1px solid #90CAF9;
          border-radius: 10px; padding: 9px 12px; margin-bottom: 14px;
          font-size: 13px; color: #1565C0; line-height: 1.5;
        }
        .bf-desc-box strong { color: #0D47A1; }

        .bf-fg   { margin-bottom: 14px; }
        .bf-label { font-size: 11px; color: #1565C0; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 7px; }

        .bf-input {
          width: 100%; background: #F5F9FF;
          border: 2px solid #BBDEFB; border-radius: 10px;
          padding: 11px 14px; color: #0D47A1; font-size: 16px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .bf-input:focus { border-color: #1976D2; box-shadow: 0 0 0 3px rgba(21,101,192,0.12); }
        .bf-input::placeholder { color: rgba(21,101,192,0.30); }

        .bf-chips-row { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
        .bf-chip {
          background: #EEF4FF; border: 1.5px solid #BBDEFB;
          border-radius: 8px; padding: 5px 12px;
          font-size: 13px; cursor: pointer; font-weight: 700; color: #1565C0;
          transition: all 0.15s;
        }
        .bf-chip:hover { background: #BBDEFB; border-color: #1976D2; }
        .bf-chip.active { background: linear-gradient(135deg,#1565C0,#1E88E5); color: #fff; border-color: #1565C0; }

        .bf-infobox {
          background: #E8F5E9; border: 1px solid #A5D6A7;
          border-radius: 10px; padding: 9px 14px; margin-bottom: 12px;
          font-size: 13px; color: #2E7D32;
        }
        .bf-infobox strong { color: #1B5E20; font-size: 14px; }

        .bf-num-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin-bottom: 4px; }
        .bf-nchip {
          background: #EEF4FF; border: 2px solid #BBDEFB;
          border-radius: 8px; padding: 12px 6px;
          text-align: center; font-size: 16px; font-weight: 800;
          cursor: pointer; color: #1565C0; transition: all 0.15s;
        }
        .bf-nchip:hover { border-color: #1976D2; transform: scale(1.08); }
        .bf-nchip.active { background: linear-gradient(135deg,#1565C0,#1E88E5); color: #fff; border-color: #1565C0; }

        .bf-jodi-scroll {
          max-height: 200px; overflow-y: auto;
          border: 2px solid #BBDEFB; border-radius: 10px;
          background: #F5F9FF; margin-bottom: 4px;
        }
        .bf-jodi-scroll::-webkit-scrollbar { width: 3px; }
        .bf-jodi-scroll::-webkit-scrollbar-thumb { background: #90CAF9; border-radius: 3px; }
        .bf-jodi-grid { display: grid; grid-template-columns: repeat(5,1fr); }
        .bf-jchip {
          padding: 10px 4px; text-align: center;
          font-size: 12px; font-weight: 700; cursor: pointer; color: #1565C0;
          border-right: 1px solid #EEF4FF; border-bottom: 1px solid #EEF4FF;
          transition: all 0.12s;
        }
        .bf-jchip:hover { background: #BBDEFB; }
        .bf-jchip.active { background: linear-gradient(135deg,#1565C0,#1E88E5); color: #fff; }

        .bf-pana-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 6px;
          max-height: 200px; overflow-y: auto; margin-bottom: 4px;
        }
        .bf-pana-grid::-webkit-scrollbar { width: 3px; }
        .bf-pana-grid::-webkit-scrollbar-thumb { background: #90CAF9; border-radius: 3px; }
        .bf-pchip {
          background: #EEF4FF; border: 1.5px solid #BBDEFB;
          border-radius: 8px; padding: 8px 4px;
          text-align: center; font-size: 12px; font-weight: 700;
          cursor: pointer; color: #1565C0; transition: all 0.12s;
        }
        .bf-pchip:hover { border-color: #1976D2; transform: scale(1.05); }
        .bf-pchip.active { background: linear-gradient(135deg,#1565C0,#1E88E5); color: #fff; border-color: #1565C0; }

        .bf-session-row { display: flex; gap: 10px; }
        .bf-session-btn {
          flex: 1; text-align: center; padding: 11px 0;
          font-size: 13px; font-weight: 800; cursor: pointer;
          border-radius: 10px; background: #EEF4FF; color: #1565C0;
          border: 2px solid #BBDEFB; transition: all 0.15s; letter-spacing: 1px;
        }
        .bf-session-btn:hover { border-color: #1976D2; }
        .bf-session-btn.active { background: linear-gradient(135deg,#1565C0,#1976D2); color: #fff; border-color: #1565C0; }

        .bf-add-btn {
          width: 100%; background: #EEF4FF; color: #1565C0;
          border: 2px dashed #90CAF9; border-radius: 10px;
          padding: 11px; font-weight: 700; font-size: 14px;
          cursor: pointer; margin-bottom: 14px; transition: all 0.15s;
        }
        .bf-add-btn:hover { background: #BBDEFB; border-color: #1976D2; }

        .bf-bulk-table-wrap { overflow-x: auto; margin-bottom: 8px; border: 1.5px solid #BBDEFB; border-radius: 10px; }
        .bf-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .bf-table th { background: #EEF4FF; color: #1565C0; padding: 9px 10px; text-align: left; font-weight: 700; letter-spacing: 1px; font-size: 11px; }
        .bf-table td { padding: 9px 10px; border-bottom: 1px solid #F0F4FF; color: #333; }
        .bf-table tr:last-child td { border-bottom: none; }
        .bf-del { background: #FFEBEE; color: #D32F2F; border: 1px solid #FFCDD2; border-radius: 5px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-weight: 700; transition: all 0.15s; }
        .bf-del:hover { background: #D32F2F; color: #fff; }

        .bf-total-row {
          display: flex; justify-content: space-between; align-items: center;
          background: #EEF4FF; border: 1px solid #90CAF9;
          border-radius: 10px; padding: 10px 14px; margin-bottom: 4px;
        }
        .bf-total-row span   { font-size: 13px; color: #1565C0; font-weight: 600; }
        .bf-total-row strong { font-size: 16px; color: #0D47A1; font-weight: 800; }

        .bf-place-btn {
          width: 100%;
          background: linear-gradient(135deg, #1565C0, #1976D2, #42A5F5);
          color: #fff; border: none; border-radius: 12px;
          padding: 15px; font-size: 16px; font-weight: 800;
          cursor: pointer; letter-spacing: 2px; text-transform: uppercase;
          box-shadow: 0 4px 16px rgba(21,101,192,0.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.15s, box-shadow 0.2s; margin-top: 4px;
        }
        .bf-place-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,101,192,0.50); }
        .bf-place-btn:active:not(:disabled) { transform: scale(0.98); }
        .bf-place-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
