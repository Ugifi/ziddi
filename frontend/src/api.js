const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('mk_token') ? { Authorization: `Bearer ${localStorage.getItem('mk_token')}` } : {})
});

// Deposit ke liye multipart headers (file upload)
const getMultipartHeaders = () => ({
  ...(localStorage.getItem('mk_token') ? { Authorization: `Bearer ${localStorage.getItem('mk_token')}` } : {})
  // Content-Type intentionally omit — browser khud set karta hai boundary ke saath
});

export const api = {

  // ── AUTH ──────────────────────────────────────────────────────
  register: (data) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    }).then(r => r.json()),

  login: (data) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    }).then(r => r.json()),

  profile: () =>
    fetch(`${API_URL}/auth/profile`, { headers: getHeaders() }).then(r => r.json()),

  changePassword: (data) =>
    fetch(`${API_URL}/auth/change-password`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    }).then(r => r.json()),

  // ── GAMES ─────────────────────────────────────────────────────
  getGames: () =>
    fetch(`${API_URL}/games`, { headers: getHeaders() }).then(r => r.json()),

  getGame: (id) =>
    fetch(`${API_URL}/games/${id}`, { headers: getHeaders() }).then(r => r.json()),

  placeBid: (data) =>
    fetch(`${API_URL}/games/bid`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        game_id:   data.game_id,
        game_type: data.game_type,
        number:    data.number,
        amount:    data.amount,
        session:   data.session || 'open'
      })
    }).then(r => r.json()),

  myBids: (status = null, page = 1) =>
    fetch(`${API_URL}/games/bids/my?page=${page}${status ? `&status=${status}` : ''}`,
      { headers: getHeaders() }).then(r => r.json()),

  gameResults: (id) =>
    fetch(`${API_URL}/games/${id}/results`).then(r => r.json()),

  resultsHistory: () =>
    fetch(`${API_URL}/games/results/history`).then(r => r.json()),

  // ── WALLET ────────────────────────────────────────────────────
  balance: () =>
    fetch(`${API_URL}/wallet/balance`, { headers: getHeaders() }).then(r => r.json()),

  deposit: (data) => {
    const form = new FormData();
    form.append('amount', data.amount);
    if (data.utr)           form.append('utr', data.utr);
    if (data.payment_proof) form.append('payment_proof', data.payment_proof);
    return fetch(`${API_URL}/wallet/deposit`, {
      method: 'POST', headers: getMultipartHeaders(), body: form
    }).then(r => r.json());
  },

  withdraw: (data) =>
    fetch(`${API_URL}/wallet/withdraw`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        amount:         data.amount,
        upi_id:         data.upi_id,
        bank_name:      data.bank_name      || undefined,
        account_number: data.account_number || undefined,
        ifsc:           data.ifsc           || undefined
      })
    }).then(r => r.json()),

  transactions: (page = 1) =>
    fetch(`${API_URL}/wallet/transactions?page=${page}`, { headers: getHeaders() }).then(r => r.json()),

  walletRequests: (type = 'deposit') =>
    fetch(`${API_URL}/wallet/requests?type=${type}`, { headers: getHeaders() }).then(r => r.json()),

  // ── ADMIN ─────────────────────────────────────────────────────
  
  adminStats: () =>
    fetch(`${API_URL}/admin/stats`, { headers: getHeaders() }).then(r => r.json()),

  adminUsers: (search = '', page = 1) =>
    fetch(`${API_URL}/admin/users?search=${search}&page=${page}`, { headers: getHeaders() }).then(r => r.json()),

  adminUserDetail: (id) =>
    fetch(`${API_URL}/admin/users/${id}`, { headers: getHeaders() }).then(r => r.json()),

  adminGames: () =>
    fetch(`${API_URL}/admin/games`, { headers: getHeaders() }).then(r => r.json()),

  adminAddGame: (data) =>
    fetch(`${API_URL}/admin/games`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    }).then(r => r.json()),

  adminUpdateGame: (id, data) =>
    fetch(`${API_URL}/admin/games/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    }).then(r => r.json()),

  adminDeleteGame: (id) =>
    fetch(`${API_URL}/admin/games/${id}`, {
      method: 'DELETE', headers: getHeaders()
    }).then(r => r.json()),

  toggleGame: (id, status) =>
    fetch(`${API_URL}/admin/games/${id}/status`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status })
    }).then(r => r.json()),

  declareResult: (id, open_result, close_result) =>
    fetch(`${API_URL}/admin/games/${id}/result`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ open_result, close_result })
    }).then(r => r.json()),

  adminDeposits: (status = 'pending', page = 1) =>
    fetch(`${API_URL}/admin/deposits?status=${status}&page=${page}`, { headers: getHeaders() }).then(r => r.json()),

  approveDeposit: (id, action, note = '') =>
    fetch(`${API_URL}/admin/deposits/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ action, note })
    }).then(r => r.json()),

  adminWithdrawals: (status = 'pending') =>
    fetch(`${API_URL}/admin/withdrawals?status=${status}`, { headers: getHeaders() }).then(r => r.json()),

  approveWithdrawal: (id, action, note = '') =>
    fetch(`${API_URL}/admin/withdrawals/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ action, note })
    }).then(r => r.json()),

  adminBids: (game_id = null, status = null, page = 1) => {
    let qs = `page=${page}`;
    if (game_id) qs += `&game_id=${game_id}`;
    if (status)  qs += `&status=${status}`;
    return fetch(`${API_URL}/admin/bids?${qs}`, { headers: getHeaders() }).then(r => r.json());
  },

  blockUser: (id, block) =>
    fetch(`${API_URL}/admin/users/${id}/block`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ block })
    }).then(r => r.json()),

  addCoins: (id, amount, action, wallet = 'wallet', note = '') =>
    fetch(`${API_URL}/admin/users/${id}/coins`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ amount, action, wallet, note })
    }).then(r => r.json()),

  resetUserPassword: (id, new_password) =>
    fetch(`${API_URL}/admin/users/${id}/reset-password`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ new_password })
    }).then(r => r.json()),

  adminSettings: () =>
    fetch(`${API_URL}/admin/settings`, { headers: getHeaders() }).then(r => r.json()),

  saveAdminSettings: (data) =>
    fetch(`${API_URL}/admin/settings`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    }).then(r => r.json()),

  adminNotices: () =>
    fetch(`${API_URL}/admin/notices`, { headers: getHeaders() }).then(r => r.json()),

  addNotice: (message, type = 'info') =>
    fetch(`${API_URL}/admin/notices`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ message, type })
    }).then(r => r.json()),

  deleteNotice: (id) =>
    fetch(`${API_URL}/admin/notices/${id}`, {
      method: 'DELETE', headers: getHeaders()
    }).then(r => r.json()),

  // ── PUBLIC ────────────────────────────────────────────────────
  
  paymentInfo: () =>
    fetch(`${API_URL.replace('/api', '')}/api/payment-info`).then(r => r.json()),

  notices: () =>
    fetch(`${API_URL.replace('/api', '')}/api/notices`).then(r => r.json()),
};
