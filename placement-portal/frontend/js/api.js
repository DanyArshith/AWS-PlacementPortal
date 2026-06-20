// Simple API wrapper — supports Phase 2 fixtures mode when `window.USE_FIXTURES === true`
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

// Helper to load fixture JSON files
const fixtureCache = {};
async function loadFixture(name) {
  if (fixtureCache[name]) return fixtureCache[name];
  const res = await fetch(`/fixtures/${name}.json`);
  const j = await res.json();
  fixtureCache[name] = j;
  return j;
}

async function apiGet(path) {
  if (window && window.USE_FIXTURES) {
    // map some common GETs to fixture files
    // support query params for /jobs: /jobs?search=...&page=1&limit=10
    const [p, q] = path.split('?');
    const query = new URLSearchParams(q || '');
    if (p === '/jobs') {
      let jobs = await loadFixture('jobs');
      const search = query.get('search');
      if (search) {
        const s = search.toLowerCase();
        jobs = jobs.filter(j => (j.title||'').toLowerCase().includes(s) || (j.description||'').toLowerCase().includes(s));
      }
      // pagination
      const page = parseInt(query.get('page') || '1', 10);
      const limit = parseInt(query.get('limit') || '10', 10);
      const total = jobs.length;
      const start = (page - 1) * limit;
      const paged = jobs.slice(start, start + limit);
      return { data: paged, meta: { total, page, limit } };
    }
    if (path === '/company' || path === '/company/') return loadFixture('companies');
    if (path === '/student/profile') return loadFixture('students').then(a => a[0]);
    if (path === '/jobs/applied') return loadFixture('applications');
    // fallback: try to load a fixture by trimming slashes
    const idMatch = path.match(/\/jobs\/(.+)$/);
    if (idMatch) {
      const jobs = await loadFixture('jobs');
      return jobs.find(j => j._id === idMatch[1]) || null;
    }
  }
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
  return res.json();
}

async function apiPost(path, body, isForm = false) {
  if (window && window.USE_FIXTURES) {
    // handle auth/login against fixture
    if (path === '/auth/login') {
      const users = await loadFixture('students');
      const user = users.find(u => u.email === body.email && u.password === body.password);
      if (user) return { token: 'mock-token', user };
      return { message: 'Invalid credentials' };
    }
    if (path === '/auth/register') {
      // naive register: return token
      return { token: 'mock-token' };
    }
    if (path === '/jobs/apply') {
      // simulate creating an application
      const apps = await loadFixture('applications');
      const newApp = { _id: `app${Date.now()}`, studentId: 'stu1', jobId: body.jobId, status: 'applied', appliedAt: new Date().toISOString() };
      apps.push(newApp);
      fixtureCache['applications'] = apps;
      return newApp;
    }
    if (path.startsWith('/student/upload')) {
      return { url: '/fixtures/placeholder-file.pdf' };
    }
  }

  const opts = { method: 'POST', headers: headers(!isForm) };
  if (isForm) opts.body = body; else opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  return res.json();
}

export { API_BASE, apiGet, apiPost, setToken, getToken };
