import { apiGet, apiPost } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await apiGet('/student/profile');
  if (profile) {
    document.getElementById('name').value = profile.name || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('branch').value = profile.branch || '';
    document.getElementById('cgpa').value = profile.cgpa || '';
    document.getElementById('skills').value = (profile.skills || []).join(',');
  }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    branch: document.getElementById('branch').value,
    cgpa: document.getElementById('cgpa').value,
    skills: document.getElementById('skills').value.split(',').map(s => s.trim())
  };
  await apiPost('/student/profile', payload);

  const resumeEl = document.getElementById('resume');
  if (resumeEl.files.length) {
    const form = new FormData();
    form.append('resume', resumeEl.files[0]);
    await apiPost('/student/upload-resume', form, true);
  }

  const photoEl = document.getElementById('photo');
  if (photoEl.files.length) {
    const form = new FormData();
    form.append('photo', photoEl.files[0]);
    await apiPost('/student/upload-photo', form, true);
  }

  alert('Profile updated');
});
