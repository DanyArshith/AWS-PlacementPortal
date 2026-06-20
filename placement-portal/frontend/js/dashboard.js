import { apiGet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await apiGet('/student/profile');
  const apps = await apiGet('/jobs/applied');
  const el = document.createElement('div');
  el.className = 'container mx-auto px-4 py-8';
  el.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
    <div class="bg-white p-4 rounded shadow mb-4">
      <h2 class="font-semibold">Welcome, ${profile?.name || 'Student'}</h2>
      <p class="text-sm text-gray-600">Applied: ${Array.isArray(apps) ? apps.length : 0}</p>
    </div>
  `;
  document.body.prepend(el);
});
