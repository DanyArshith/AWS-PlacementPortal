// Global Client-side Route Guard for role-based access control
(function() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/')) || '/';
  
  const publicPages = ['/', '/index.html', '/login.html', '/register.html'];
  const token = localStorage.getItem('pp_token');
  
  if (!token) {
    // If not logged in, block access to all protected pages
    if (!publicPages.includes(page)) {
      window.location = '/login.html';
    }
  } else {
    // Logged in: check roles and enforce access boundaries
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      
      if (role === 'student') {
        // Students are forbidden from admin panel
        if (page === '/admin.html') {
          window.location = '/dashboard.html';
        }
      } else if (role === 'admin') {
        // Admins are forbidden from student-facing pages
        const studentPages = ['/dashboard.html', '/profile.html', '/applied-jobs.html', '/jobs.html', '/job-detail.html'];
        if (studentPages.includes(page)) {
          window.location = '/admin.html';
        }
      }
    } catch (e) {
      // If token parsing fails, clear it and redirect to login
      localStorage.removeItem('pp_token');
      window.location = '/login.html';
    }
  }
})();

// UI helpers for Phase 2 static frontend
export function renderNavbar(containerSelector = 'body') {
  const container = document.querySelector(containerSelector);
  const nav = document.createElement('header');
  nav.className = 'bg-white shadow';

  // Decode JWT role dynamically
  let role = null;
  const token = localStorage.getItem('pp_token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
    } catch (e) { /* ignore */ }
  }

  let linksHtml = '';
  if (role === 'admin') {
    linksHtml = `
      <a href="/admin.html" class="text-sm text-gray-700 font-semibold hover:text-blue-600 transition-colors">Admin Dashboard</a>
      <button onclick="localStorage.removeItem('pp_token'); window.location='/login.html';" class="text-sm text-red-600 hover:underline focus:outline-none ml-2">Logout</button>
    `;
  } else if (role === 'student') {
    linksHtml = `
      <a href="/jobs.html" class="text-sm text-gray-700 font-semibold hover:text-blue-600 transition-colors">Jobs</a>
      <a href="/applied-jobs.html" class="text-sm text-gray-700 font-semibold hover:text-blue-600 transition-colors">Applied Status</a>
      <a href="/dashboard.html" class="text-sm text-gray-700 font-semibold hover:text-blue-600 transition-colors">Dashboard</a>
      <a href="/profile.html" class="text-sm text-gray-700 font-semibold hover:text-blue-600 transition-colors">Profile</a>
      <button onclick="localStorage.removeItem('pp_token'); window.location='/login.html';" class="text-sm text-red-600 hover:underline focus:outline-none ml-2">Logout</button>
    `;
  } else {
    linksHtml = `
      <a href="/login.html" class="text-sm text-blue-600 hover:underline font-semibold">Login</a>
    `;
  }

  nav.innerHTML = `
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <a href="/index.html" class="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">Placement Portal</a>
      <div class="flex items-center space-x-4">
        ${linksHtml}
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
