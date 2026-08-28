(function () {
  const KEY = 'gogo-theme';

  function getTheme() {
    return localStorage.getItem(KEY);
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function apply(theme) {
    const resolved = theme || getTheme() || (systemPrefersDark() ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', resolved);
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.textContent = resolved === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
  }

  window.toggleTheme = toggleTheme;
  apply();
  document.addEventListener('DOMContentLoaded', () => apply());
})();
