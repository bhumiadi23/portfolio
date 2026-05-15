// Inject sidebar HTML into .sidebar element
function renderSidebar(activePage) {
  const nav = [
    { href: 'dashboard.html', icon: '📊', label: 'Dashboard', id: 'dashboard' },
    { href: 'report.html', icon: '⚠️', label: 'Report Scam', id: 'report' },
    { href: 'search.html', icon: '🔍', label: 'Investigate', id: 'search' },
    { href: 'admin.html', icon: '⚙️', label: 'Admin Panel', id: 'admin', adminOnly: true },
  ];

  const html = `
    <div class="sidebar-logo">
      <span class="logo-icon">⬡ CYBERSHIELD</span>
      <h1>Cyber<span>Shield</span></h1>
    </div>
    <nav>
      <div class="nav-section">Navigation</div>
      ${nav.map(n => `
        <a href="${n.href}" class="nav-item${activePage === n.id ? ' active' : ''}${n.adminOnly ? ' admin-only' : ''}"
           style="${n.adminOnly ? 'display:none' : ''}">
          <span class="icon">${n.icon}</span>${n.label}
        </a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-info" id="sidebar-user">[ loading... ]</div>
      <div id="sidebar-role" style="font-size:10px;letter-spacing:2px;margin-bottom:8px"></div>
      <button class="btn btn-outline btn-sm btn-full" onclick="logout()">⏻ LOGOUT</button>
    </div>
  `;

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.innerHTML = html;
}
