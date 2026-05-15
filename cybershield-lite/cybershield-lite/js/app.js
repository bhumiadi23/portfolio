// CyberShield Lite - App JS

const API = '/api';

// ---- TOAST ----
function toast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3500);
}

// ---- API HELPER ----
async function apiFetch(url, opts = {}) {
  const res = await fetch(API + url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ---- AUTH CHECK ----
async function requireAuth(redirectAdmin = false) {
  try {
    const user = await apiFetch('/auth/me');
    updateSidebarUser(user);
    if (redirectAdmin && user.role !== 'admin') {
      location.href = 'dashboard.html';
    }
    return user;
  } catch {
    location.href = 'login.html';
    return null;
  }
}

function updateSidebarUser(user) {
  const el = document.getElementById('sidebar-user');
  if (el) el.textContent = `[ ${user.username} ]`;
  const roleEl = document.getElementById('sidebar-role');
  if (roleEl) roleEl.textContent = user.role.toUpperCase();
  if (user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  }
}

// ---- LOGOUT ----
async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' });
  location.href = 'login.html';
}

// ---- HAMBURGER SIDEBAR ----
function initSidebar() {
  const btn = document.createElement('button');
  btn.className = 'hamburger';
  btn.innerHTML = '☰';
  btn.onclick = () => document.querySelector('.sidebar')?.classList.toggle('open');
  document.body.prepend(btn);
}

// ---- CHARTS (Canvas-based, no lib) ----
function drawBarChart(canvasId, labels, values, color = '#00ff41') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 200;
  ctx.clearRect(0, 0, W, H);

  const max = Math.max(...values, 1);
  const barW = (W - 40) / labels.length - 8;
  const chartH = H - 40;

  labels.forEach((label, i) => {
    const x = 20 + i * ((W - 40) / labels.length) + 4;
    const h = (values[i] / max) * chartH;
    const y = chartH - h + 10;

    ctx.fillStyle = color + '33';
    ctx.fillRect(x, y, barW, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barW, h);

    ctx.fillStyle = color;
    ctx.font = '10px Share Tech Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(values[i], x + barW / 2, y - 4);

    ctx.fillStyle = '#6a8a6a';
    const lbl = label.length > 10 ? label.slice(0, 10) + '..' : label;
    ctx.fillText(lbl, x + barW / 2, H - 6);
  });
}

function drawLineChart(canvasId, labels, values, color = '#00d4ff') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 200;
  ctx.clearRect(0, 0, W, H);

  if (values.length < 2) { ctx.fillStyle = '#6a8a6a'; ctx.font = '12px monospace'; ctx.fillText('Not enough data', W/2 - 50, H/2); return; }

  const max = Math.max(...values, 1);
  const padL = 30, padR = 20, padT = 20, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
  }

  // Area fill
  const gradient = ctx.createLinearGradient(0, padT, 0, H - padB);
  gradient.addColorStop(0, color + '44');
  gradient.addColorStop(1, 'transparent');

  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - (v / max) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(padL + chartW, H - padB);
  ctx.lineTo(padL, H - padB);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - (v / max) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  ctx.fillStyle = color;
  values.forEach((v, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const y = padT + chartH - (v / max) * chartH;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  });

  // Labels
  ctx.fillStyle = '#6a8a6a';
  ctx.font = '9px Share Tech Mono, monospace';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => {
    const x = padL + (i / (values.length - 1)) * chartW;
    const lbl = l.slice(5); // show MM-DD
    ctx.fillText(lbl, x, H - 6);
  });
}

// ---- UTILS ----
function statusBadge(s) {
  return `<span class="badge badge-${s}">${s}</span>`;
}

function truncate(str, n = 40) {
  return str && str.length > n ? str.slice(0, n) + '…' : str || '—';
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function fraudIcon(type) {
  const map = { 'Phishing': '🎣', 'Phone Scam': '📞', 'Crypto Fraud': '₿', 'Banking Fraud': '🏦', 'Tech Support Scam': '💻', 'Lottery Scam': '🎰' };
  return map[type] || '⚠️';
}

// ---- SEARCH PAGE LOGIC ----
function initSearch() {
  const form = document.getElementById('number-form');
  const urlForm = document.getElementById('url-form');

  if (form) form.onsubmit = async (e) => {
    e.preventDefault();
    const num = document.getElementById('search-number').value.trim();
    if (!num) return;
    const res = document.getElementById('number-results');
    res.innerHTML = '<div class="loading">Scanning</div>';
    try {
      const data = await apiFetch(`/reports/number/${encodeURIComponent(num)}`);
      if (data.count === 0) {
        res.innerHTML = '<div class="empty-state"><div class="icon">✅</div>No reports found for this number.</div>';
        return;
      }
      res.innerHTML = `<div class="alert alert-error">⚠ ${data.count} report(s) found for this number</div>` +
        renderReportsTable(data.reports);
    } catch (e) { res.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
  };

  if (urlForm) urlForm.onsubmit = async (e) => {
    e.preventDefault();
    const url = document.getElementById('check-url').value.trim();
    if (!url) return;
    const res = document.getElementById('url-results');
    res.innerHTML = '<div class="loading">Analyzing URL</div>';
    try {
      const data = await apiFetch(`/reports/url-check?url=${encodeURIComponent(url)}`);
      const riskColor = { low: 'green', medium: 'yellow', high: 'red' }[data.risk];
      res.innerHTML = `
        <div class="risk-meter">
          <div class="text-muted mono" style="font-size:11px;letter-spacing:2px;margin-bottom:8px">RISK ASSESSMENT</div>
          <div class="risk-display risk-${data.risk} pulse">${data.risk.toUpperCase()}</div>
          <div class="mono" style="font-size:12px;color:var(--text2)">Domain: ${data.domain}</div>
          <div class="mono" style="font-size:12px;margin-top:8px">Reports: <span class="text-${riskColor}">${data.reportCount}</span></div>
        </div>
        ${data.reports.length ? '<hr class="divider">' + renderReportsTable(data.reports) : ''}
      `;
    } catch (e) { res.innerHTML = `<div class="alert alert-error">${e.message}</div>`; }
  };
}

function renderReportsTable(reports) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Type</th><th>Number</th><th>URL</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>${reports.map(r => `<tr>
      <td class="mono text-muted">#${r.id}</td>
      <td>${fraudIcon(r.fraud_type)} ${r.fraud_type}</td>
      <td class="num-cell">${r.scam_number || '—'}</td>
      <td class="url-cell">${r.suspicious_url || '—'}</td>
      <td>${statusBadge(r.status)}</td>
      <td class="text-muted mono" style="font-size:11px">${timeAgo(r.created_at)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

window.onload = () => initSidebar();
