// Simple API wrapper — update `API_BASE` to your backend URL (e.g. https://ec2-xx.compute.amazonaws.com)
const API_BASE = '/api';

const getToken = () => localStorage.getItem('pp_token');
const setToken = (t) => localStorage.setItem('pp_token', t);

const headers = (json = true) => {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
  return res.json();
}

async function apiPost(path, body, isForm = false) {
  const opts = { method: 'POST', headers: headers(!isForm) };
  if (isForm) opts.body = body; else opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  return res.json();
}

export { API_BASE, apiGet, apiPost, setToken, getToken };
