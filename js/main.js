document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach((a) => {
    if (a.dataset.page === path) a.classList.add('active');
  });

  loadAnnouncements();
  setupContactForm();
});

async function loadAnnouncements() {
  const list = document.getElementById('announcement-list');
  if (!list) return;
  try {
    const res = await fetch('/api/public/announcements');
    const data = await res.json();
    if (!data.length) {
      list.innerHTML = '<p>No announcements right now — check back soon!</p>';
      return;
    }
    list.innerHTML = data.slice(0, 4).map((a) => `
      <div class="announcement-card">
        <div class="date">${formatDate(a.date)}</div>
        <h3>${escapeHtml(a.title)}</h3>
        <p>${escapeHtml(a.body)}</p>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p>Announcements are unavailable right now.</p>';
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const msg = document.getElementById('form-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg';
    msg.textContent = '';

    const payload = {
      parentName: form.parentName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      childAge: form.childAge.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      msg.className = 'form-msg success';
      msg.textContent = "Thank you! We've received your message and will get back to you soon.";
      form.reset();
    } catch (err) {
      msg.className = 'form-msg error';
      msg.textContent = err.message;
    }
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
