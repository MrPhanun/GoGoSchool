const NAV_ITEMS = [
  { page: 'dashboard.html', icon: '🏠', key: 'admin.nav.dashboard', label: 'Dashboard' },
  { page: 'students.html', icon: '🧒', key: 'admin.nav.students', label: 'Students' },
  { page: 'classes.html', icon: '🏫', key: 'admin.nav.classes', label: 'Classes' },
  { page: 'teachers.html', icon: '👩‍🏫', key: 'admin.nav.teachers', label: 'Teachers' },
  { page: 'attendance.html', icon: '📋', key: 'admin.nav.attendance', label: 'Attendance' },
  { page: 'fees.html', icon: '💰', key: 'admin.nav.fees', label: 'Fees' },
  { page: 'announcements.html', icon: '📣', key: 'admin.nav.announcements', label: 'Announcements' },
  { page: 'inquiries.html', icon: '✉️', key: 'admin.nav.inquiries', label: 'Inquiries' },
];

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = 'login.html';
    throw new Error('Not authenticated');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function requireAuth() {
  try {
    const { user } = await api('/api/auth/me');
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  } catch (err) {
    window.location.href = 'login.html';
    return null;
  }
}

function renderSidebar(activePage, user) {
  const mount = document.getElementById('sidebar');
  if (!mount) return;
  const links = NAV_ITEMS.map((item) => `
    <li>
      <a href="${item.page}" class="${item.page === activePage ? 'active' : ''}">
        <span>${item.icon}</span> <span data-i18n="${item.key}">${item.label}</span>
      </a>
    </li>
  `).join('');

  mount.innerHTML = `
    <div class="brand"><span class="brand-badge">🎈</span> GO-GO Admin</div>
    <div class="side-nav-scroll">
      <ul class="side-nav">${links}</ul>
    </div>
    <div class="sidebar-footer">
      <div class="sidebar-footer-info">
        <div class="user-name">${escapeHtml(user.name)}</div>
        <span class="role-badge" data-i18n="admin.role.${user.role}">${escapeHtml(user.role)}</span>
      </div>
      <div class="sidebar-toggles">
        <button class="icon-toggle-btn" data-theme-toggle onclick="toggleTheme()" aria-label="Toggle dark mode">🌙</button>
        <button class="icon-toggle-btn" data-lang-toggle onclick="toggleLang()">ខ្មែរ</button>
      </div>
      <button class="logout-btn" id="logout-btn" data-i18n="admin.logout">Log Out</button>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = 'login.html';
  });

  if (typeof window.applyLang === 'function') window.applyLang();
}

function showToast(message, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${isError ? 'error' : ''}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
