import React from 'react';

const ICONS = {
  single_digit: (
    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="#fff" strokeWidth="2"/><text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">7</text></svg>
  ),
  jodi: (
    <svg viewBox="0 0 24 24"><rect x="2" y="4" width="9" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="1.8"/><rect x="13" y="4" width="9" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="1.8"/><text x="6.5" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">4</text><text x="17.5" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">2</text></svg>
  ),
  single_pana: (
    <svg viewBox="0 0 24 24"><path d="M4 6h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M4 6V4a1 1 0 011-1h14a1 1 0 011 1v2" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="12" cy="13" r="2" fill="#fff"/></svg>
  ),
  double_pana: (
    <svg viewBox="0 0 24 24"><path d="M3 6h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M3 6V4a1 1 0 011-1h16a1 1 0 011 1v2" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="9" cy="13" r="1.8" fill="#fff"/><circle cx="15" cy="13" r="1.8" fill="#fff"/></svg>
  ),
  triple_pana: (
    <svg viewBox="0 0 24 24"><path d="M3 6h18v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M3 6V4a1 1 0 011-1h16a1 1 0 011 1v2" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="7.5" cy="13" r="1.6" fill="#fff"/><circle cx="12" cy="13" r="1.6" fill="#fff"/><circle cx="16.5" cy="13" r="1.6" fill="#fff"/></svg>
  ),
  half_sangam: (
    <svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="16" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M12 7.5a6 6 0 010 9" fill="rgba(255,255,255,0.3)"/></svg>
  ),
  full_sangam: (
    <svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="16" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M10.5 8.5a6 6 0 013 7" fill="rgba(255,255,255,0.35)"/><path d="M13.5 8.5a6 6 0 00-3 7" fill="rgba(255,255,255,0.35)"/></svg>
  ),
  odd_even: (
    <svg viewBox="0 0 24 24"><text x="3" y="15" fontSize="9" fontWeight="bold" fill="#fff">OD</text><line x1="12" y1="4" x2="12" y2="20" stroke="#fff" strokeWidth="1.5" strokeDasharray="2,2"/><text x="14" y="15" fontSize="9" fontWeight="bold" fill="#fff">EV</text></svg>
  ),
  dp_motor: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" fill="#fff"/><line x1="12" y1="3" x2="12" y2="7" stroke="#fff" strokeWidth="1.8"/><line x1="12" y1="17" x2="12" y2="21" stroke="#fff" strokeWidth="1.8"/><line x1="3" y1="12" x2="7" y2="12" stroke="#fff" strokeWidth="1.8"/><line x1="17" y1="12" x2="21" y2="12" stroke="#fff" strokeWidth="1.8"/></svg>
  ),
  sp_motor: (
    <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><path d="M2 17l10 5 10-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/></svg>
  ),
  red_jodi: (
    <svg viewBox="0 0 24 24"><path d="M12 21s-8-5.5-8-11a8 8 0 0116 0c0 5.5-8 11-8 11z" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M9 10h6M12 7v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  cycle_jodi: (
    <svg viewBox="0 0 24 24"><circle cx="5" cy="14" r="4" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="19" cy="14" r="4" fill="none" stroke="#fff" strokeWidth="1.8"/><path d="M5 14l4-7h6l4 7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="7" r="1.5" fill="#fff"/></svg>
  ),
  sp_dp_tp: (
    <svg viewBox="0 0 24 24"><rect x="2" y="6" width="6" height="12" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.6"/><rect x="9" y="6" width="6" height="12" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.6"/><rect x="16" y="6" width="6" height="12" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.6"/></svg>
  ),
  two_digit_pana: (
    <svg viewBox="0 0 24 24"><rect x="2" y="4" width="9" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="6.5" cy="10" r="1.5" fill="#fff"/><circle cx="6.5" cy="14" r="1.5" fill="#fff"/><rect x="13" y="4" width="9" height="16" rx="2" fill="none" stroke="#fff" strokeWidth="1.8"/><circle cx="17.5" cy="12" r="2" fill="#fff"/></svg>
  ),
  digit_jodi: (
    <svg viewBox="0 0 24 24"><text x="2" y="16" fontSize="14" fontWeight="bold" fill="#fff">DJ</text><path d="M2 19h20" stroke="#fff" strokeWidth="1.5"/></svg>
  ),
  sp_common: (
    <svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="none" stroke="#fff" strokeWidth="1.8"/></svg>
  ),
  dp_common: (
    <svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>
  ),
  bulk: (
    <svg viewBox="0 0 24 24"><rect x="2" y="2" width="9" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8"/><rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8"/><rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8"/><rect x="13" y="13" width="9" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8"/></svg>
  ),
};

export function GameIcon({ name }) {
  return ICONS[name] || ICONS['single_digit'];
}

export default ICONS;
