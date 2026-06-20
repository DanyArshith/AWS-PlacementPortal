// UI helpers for Phase 2 static frontend
export function renderNavbar(containerSelector = 'body') {
  const container = document.querySelector(containerSelector);
  const nav = document.createElement('header');
  nav.className = 'bg-white shadow';
  nav.innerHTML = `
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <a href="/index.html" class="text-lg font-semibold">Placement Portal</a>
      <div class="flex items-center space-x-4">
        <a href="/jobs.html" class="text-sm text-gray-700">Jobs</a>
        <a href="/dashboard.html" class="text-sm text-gray-700">Dashboard</a>
        <a href="/profile.html" class="text-sm text-gray-700">Profile</a>
        <a href="/admin.html" class="text-sm text-gray-700">Admin</a>
      </div>
    </div>
  `;
  container.prepend(nav);
}

export function showToast(message, type = 'info', timeout = 3000) {
  let holder = document.getElementById('toast-holder');
  if (!holder) {
    holder = document.createElement('div');
    holder.id = 'toast-holder';
    holder.style.position = 'fixed';
    holder.style.right = '16px';
    holder.style.bottom = '16px';
    holder.style.zIndex = 9999;
    document.body.appendChild(holder);
  }
  const el = document.createElement('div');
  el.className = 'mb-2 px-4 py-2 rounded shadow text-white';
  el.setAttribute('role', 'status');
  el.style.background = type === 'error' ? '#e53e3e' : '#2563eb';
  el.textContent = message;
  holder.appendChild(el);
  setTimeout(() => el.remove(), timeout);
}
