import { apiPost, setToken } from './api.js';

document.addEventListener('submit', async (e) => {
  const form = e.target;
  if (form.id === 'loginForm') {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await apiPost('/auth/login', { email, password });
    if (res.token) { setToken(res.token); window.location = '/dashboard.html'; }
    else alert(res.message || 'Login failed');
  }

  if (form.id === 'registerForm') {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await apiPost('/auth/register', { name, email, password });
    if (res.token) { setToken(res.token); window.location = '/dashboard.html'; }
    else alert(res.message || 'Register failed');
  }
});
