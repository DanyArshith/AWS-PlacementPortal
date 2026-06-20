import { apiGet, apiPost } from './api.js';

async function renderJobs() {
  const list = document.getElementById('jobsList');
  list.innerHTML = 'Loading...';
  const jobs = await apiGet('/jobs');
  if (!Array.isArray(jobs)) { list.innerHTML = 'Failed to load'; return; }
  list.innerHTML = jobs.map(j => `
    <div class="bg-white p-4 rounded shadow">
      <h3 class="font-semibold">${j.title}</h3>
      <p class="text-sm text-gray-600">${j.description || ''}</p>
      <p class="text-sm text-gray-500 mt-2">${j.companyId || ''} • ${j.location || ''}</p>
      <button data-id="${j._id}" class="applyBtn mt-3 bg-blue-600 text-white px-3 py-1 rounded">Apply</button>
    </div>
  `).join('');

  document.querySelectorAll('.applyBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const res = await apiPost('/jobs/apply', { jobId: id });
      alert(res.message || 'Applied');
    });
  });
}

document.addEventListener('DOMContentLoaded', renderJobs);

