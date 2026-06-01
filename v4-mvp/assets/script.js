/* Skill Bench MVP - Shared UI logic.
   7 roles: superAdmin, admin, projectManager, prompter, domainReviewer, tester, taskReviewer */
const SB = (function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function icon(name) {
    const icons = {
      file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
      folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    };
    return icons[name] || '';
  }

  /* ───── Authentication ───── */
  const AUTH_KEY = 'sb-mvp-auth';
  const DEMO_PASSWORD = 'demo123';

  const CREDENTIALS = {
    'sarah@my-org.com': { role: 'superAdmin',      userId: 'u0' },
    'dave@my-org.com':  { role: 'admin',           userId: 'u5' },
    'nina@my-org.com':  { role: 'projectManager',  userId: 'u8' },
    'jane@my-org.com':  { role: 'prompter',        userId: 'u1' },
    'raj@my-org.com':   { role: 'domainReviewer',  userId: 'u2' },
    'tara@my-org.com':  { role: 'tester',          userId: 'u3' },
    'bob@my-org.com':   { role: 'taskReviewer',    userId: 'u4' },
    'aisha@my-org.com': { role: 'prompter',        userId: 'u6' },
    'marco@my-org.com': { role: 'tester',          userId: 'u7' },
  };

  const VALID_ROLES = ['superAdmin','admin','projectManager','prompter','domainReviewer','tester','taskReviewer'];

  function isAuthenticated() {
    const session = localStorage.getItem(AUTH_KEY);
    if (!session) return false;
    try {
      const s = JSON.parse(session);
      if (!s.email || !s.role) return false;
      if (!VALID_ROLES.includes(s.role)) { localStorage.removeItem(AUTH_KEY); return false; }
      return true;
    } catch(e) { return false; }
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch(e) { return null; }
  }

  function login(email, password) {
    const cred = CREDENTIALS[email.toLowerCase()];
    if (!cred) return { success: false, error: 'No account found with this email address' };
    if (password !== DEMO_PASSWORD) return { success: false, error: 'Incorrect password. Try: demo123' };
    const user = SBData.users[cred.role] || Object.values(SBData.users).find(u => u.id === cred.userId);
    const session = { email: email.toLowerCase(), role: cred.role, userId: cred.userId, name: user ? user.name : email, loginAt: Date.now() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    localStorage.setItem(ROLE_KEY, cred.role);
    return { success: true, session };
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(SIDEBAR_KEY);
    sessionStorage.clear();
    const base = basePath();
    location.href = base + '/login.html?logout';
  }

  function getHomePage() {
    const session = getSession();
    if (!session) return 'login.html';
    const routes = {
      superAdmin: 'super-admin/dashboard.html',
      admin: 'admin/dashboard.html',
      projectManager: 'project-manager/dashboard.html',
      prompter: 'prompter/dashboard.html',
      domainReviewer: 'domain-reviewer/queue.html',
      tester: 'tester/queue.html',
      taskReviewer: 'reviewer/queue.html',
    };
    return routes[session.role] || 'admin/dashboard.html';
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      const base = basePath();
      location.href = base + '/login.html';
      return false;
    }
    return true;
  }

  /* ───── Role management ───── */
  const ROLE_KEY = 'sb-mvp-role';
  function getRole() { return localStorage.getItem(ROLE_KEY) || (getSession() ? getSession().role : 'prompter'); }
  function setRole(role) { localStorage.setItem(ROLE_KEY, role); }
  function clearRole() { localStorage.removeItem(ROLE_KEY); }

  /* ───── Wizard task persistence (survives page navigation) ───── */
  const WIZARD_TASK_KEY = 'sb-mvp-wizard-task-id';
  const WIZARD_DATA_KEY = 'sb-mvp-wizard-data';

  function getWizardTaskId() {
    return new URLSearchParams(location.search).get('id') || sessionStorage.getItem(WIZARD_TASK_KEY) || null;
  }
  function setWizardTaskId(id) {
    if (id) sessionStorage.setItem(WIZARD_TASK_KEY, id);
    else { sessionStorage.removeItem(WIZARD_TASK_KEY); sessionStorage.removeItem(WIZARD_DATA_KEY); }
  }
  function loadWizardTask() {
    const saved = sessionStorage.getItem(WIZARD_DATA_KEY);
    if (saved) { try { return JSON.parse(saved); } catch(e) {} }
    const id = getWizardTaskId();
    if (id) { const t = SBData.getTaskById(id); if (t) return JSON.parse(JSON.stringify(t)); }
    return JSON.parse(JSON.stringify(SBData.wizardTask));
  }
  function saveWizardTaskToSession(t) {
    window.__sbWizardTask = t;
    try { sessionStorage.setItem(WIZARD_DATA_KEY, JSON.stringify(t)); } catch(e) {}
  }
  function getWizardTaskFromSession() {
    if (window.__sbWizardTask) return window.__sbWizardTask;
    const id = getWizardTaskId();
    if (id) { const stored = SBData.getTaskById(id); if (stored) { window.__sbWizardTask = JSON.parse(JSON.stringify(stored)); saveWizardTaskToSession(window.__sbWizardTask); return window.__sbWizardTask; } }
    window.__sbWizardTask = loadWizardTask();
    return window.__sbWizardTask;
  }

  /* ───── Navigation & Layout ───── */
  function basePath() {
    if (/\/(prompter|tester|reviewer|admin|domain-reviewer|super-admin|project-manager)\//.test(location.pathname)) return '..';
    return '.';
  }

  const ROLE_ACCENT = {
    superAdmin:     { color: 'rose', step: 'rose' },
    admin:          { color: 'slate', step: 'slate' },
    projectManager: { color: 'cyan', step: 'cyan' },
    prompter:       { color: 'indigo', step: 'indigo' },
    domainReviewer: { color: 'violet', step: 'violet' },
    tester:         { color: 'emerald', step: 'emerald' },
    taskReviewer:   { color: 'amber', step: 'amber' },
  };

  const SIDEBAR_KEY = 'sb-sidebar-collapsed';
  function isSidebarCollapsed() { return localStorage.getItem(SIDEBAR_KEY) === '1'; }
  function setSidebarCollapsed(v) { localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0'); }

  /* SVG icon set for sidebar */
  const ICONS = {
    tasks:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>',
    plus:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    queue:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
    review:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    clipboard:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
    dashboard:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    users:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    settings:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    skills:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    chart:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    folder:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    assign:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
    shield:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    switchRole: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>',
  };

  /* Role-based sidebar navigation config */
  const SIDEBAR_NAV = {
    superAdmin: [
      { section: 'Platform' },
      { id: 'sa-dash', label: 'Dashboard', icon: ICONS.dashboard, href: 'super-admin/dashboard.html' },
      { id: 'sa-people', label: 'People', icon: ICONS.users, href: 'super-admin/people.html' },
      { section: 'Catalog' },
      { id: 'sa-skills', label: 'Skills', icon: ICONS.skills, href: 'super-admin/skills.html' },
    ],
    admin: [
      { section: 'Overview' },
      { id: 'admin-dash', label: 'Dashboard', icon: ICONS.dashboard, href: 'admin/dashboard.html' },
      { id: 'admin-people', label: 'People', icon: ICONS.users, href: 'admin/people.html' },
      { section: 'Management' },
      { id: 'admin-skills', label: 'Skills', icon: ICONS.skills, href: 'admin/skills.html' },
    ],
    projectManager: [
      { section: 'Workspace' },
      { id: 'pm-dash', label: 'Dashboard', icon: ICONS.dashboard, href: 'project-manager/dashboard.html' },
      { id: 'pm-tasks', label: 'All Tasks', icon: ICONS.tasks, href: 'project-manager/tasks.html' },
      { id: 'pm-assign', label: 'Assignments', icon: ICONS.assign, href: 'project-manager/assignments.html' },
    ],
    prompter: [
      { section: 'Workspace' },
      { id: 'my-tasks', label: 'My Tasks', icon: ICONS.tasks, href: 'prompter/dashboard.html' },
      { id: 'new-task', label: 'New Task', icon: ICONS.plus, href: 'prompter/wizard-1-brief.html', action: 'newTask' },
    ],
    domainReviewer: [
      { section: 'Review' },
      { id: 'dr-queue', label: 'Review Queue', icon: ICONS.review, href: 'domain-reviewer/queue.html', badge: () => SBData.tasks.filter(t => t.status === 'domain-review').length },
    ],
    tester: [
      { section: 'Workspace' },
      { id: 'test-queue', label: 'Test Queue', icon: ICONS.queue, href: 'tester/queue.html', badge: () => SBData.tasks.filter(t => t.status === 'with-tester' && !t.tester).length },
    ],
    taskReviewer: [
      { section: 'Review' },
      { id: 'rev-queue', label: 'Review Queue', icon: ICONS.clipboard, href: 'reviewer/queue.html', badge: () => SBData.tasks.filter(t => t.status === 'in-review').length },
    ],
  };

  function detectActiveItem(role) {
    const path = location.pathname;
    const navItems = SIDEBAR_NAV[role] || [];
    // Exact file match first
    for (const item of navItems) {
      if (!item.href) continue;
      const hrefFile = item.href.split('/').pop();
      if (path.endsWith(hrefFile)) return item.id;
    }
    // Wizard pages highlight their parent nav item
    if (path.includes('/wizard-') || path.includes('/task-detail') || path.includes('/workspace')) {
      const first = navItems.find(i => i.id && !i.action);
      return first ? first.id : '';
    }
    // Folder match
    for (const item of navItems) {
      if (!item.href || item.action) continue;
      const folder = item.href.split('/')[0];
      if (path.includes('/' + folder + '/')) return item.id;
    }
    return navItems.find(i => i.id && !i.action)?.id || '';
  }

  function renderNav() {
    const mount = document.getElementById('app-nav');
    if (!mount) return;
    const role = getRole();
    const session = getSession();
    const sessionUser = session ? SBData.allUsers.find(u => u.id === session.userId) : null;
    const user = sessionUser || SBData.users[role] || SBData.users.prompter;
    const base = basePath();
    const collapsed = isSidebarCollapsed();
    const navItems = SIDEBAR_NAV[role] || [];
    const activeId = detectActiveItem(role);

    const sidebarItems = navItems.map(item => {
      if (item.section) return `<div class="sb-nav-section-title">${escapeHtml(item.section)}</div>`;
      const badgeVal = item.badge ? item.badge() : 0;
      const isActive = item.id === activeId;
      const href = item.action === 'newTask' ? `${base}/${item.href}` : `${base}/${item.href}`;
      const onclick = item.action === 'newTask' ? ' onclick="SB.setWizardTaskId(null)"' : '';
      return `<a href="${href}" class="sb-nav-item ${isActive ? 'active' : ''}"${onclick}>
        <span class="sb-icon">${item.icon}</span>
        <span class="sb-label">${escapeHtml(item.label)}</span>
        ${badgeVal ? `<span class="sb-badge">${badgeVal}</span>` : ''}
        <span class="sb-tooltip">${escapeHtml(item.label)}${badgeVal ? ' (' + badgeVal + ')' : ''}</span>
      </a>`;
    }).join('');

    const roleLabel = (SBData.ROLES[role] || {}).label || role;

    mount.innerHTML = `
      <aside class="app-sidebar ${collapsed ? 'collapsed' : ''}" id="app-sidebar">
        <div class="sb-brand">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-indigo-600 text-white shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          </span>
          <span class="sb-brand-label">Skill Bench</span>
        </div>
        <nav class="sb-nav">
          <div class="sb-nav-section">${sidebarItems}</div>
          <div class="sb-nav-section" style="margin-top:auto; padding-top:0.5rem; border-top:1px solid #1e293b;">
            <div class="sb-nav-section-title">Account</div>
            <a href="${base}/index.html" class="sb-nav-item">
              <span class="sb-icon">${ICONS.switchRole}</span>
              <span class="sb-label">Switch Role</span>
              <span class="sb-tooltip">Switch Role</span>
            </a>
            <a href="#" onclick="SB.logout();return false;" class="sb-nav-item">
              <span class="sb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
              <span class="sb-label">Logout</span>
              <span class="sb-tooltip">Logout</span>
            </a>
          </div>
        </nav>
        <div class="sb-user">
          <div class="avatar" style="width:1.75rem;height:1.75rem;font-size:0.6rem;flex-shrink:0">${user.initials}</div>
          <div class="sb-user-info">
            <div style="font-size:0.75rem;font-weight:500;color:#f1f5f9">${escapeHtml(user.name)}</div>
            <div style="font-size:0.625rem;color:#64748b">${escapeHtml(roleLabel)}</div>
          </div>
        </div>
        <div class="sb-toggle" id="sb-toggle-btn" title="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
      </aside>
      <div id="mobile-overlay" class="mobile-overlay hidden"></div>`;

    // Wrap <main> inside app-main container
    const mainEl = document.querySelector('main');
    if (mainEl && !mainEl.closest('.app-main')) {
      const shell = document.createElement('div');
      shell.className = 'app-shell';
      mount.parentNode.insertBefore(shell, mount);
      shell.appendChild(mount);

      const appMain = document.createElement('div');
      appMain.className = 'app-main';

      const topbar = document.createElement('div');
      topbar.className = 'app-topbar';
      topbar.innerHTML = `
        <div class="flex items-center gap-3">
          <button class="mobile-menu-btn" id="mobile-menu-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <span class="text-xs text-slate-500 font-medium">${escapeHtml(roleLabel)}</span>
          <span class="mvp-badge" style="font-size:0.6rem">MVP</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="hidden sm:inline">${escapeHtml(user.name)}</span>
        </div>`;
      appMain.appendChild(topbar);

      const content = document.createElement('div');
      content.className = 'app-content';
      content.appendChild(mainEl);
      appMain.appendChild(content);
      shell.appendChild(appMain);
    }

    // Event listeners
    const toggleBtn = document.getElementById('sb-toggle-btn');
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('mobile-overlay');
    const mobileBtn = document.getElementById('mobile-menu-btn');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        setSidebarCollapsed(sidebar.classList.contains('collapsed'));
      });
    }
    if (mobileBtn && sidebar && overlay) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        overlay.classList.remove('hidden');
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.add('hidden');
      });
    }
  }

  /* ───── Toasts ───── */
  function toast(msg, type) {
    let c = document.getElementById('toast-container');
    if (!c) { c = el('div', ''); c.id = 'toast-container'; document.body.appendChild(c); }
    const cls = 'toast-item toast-' + (type || 'info');
    const t = el('div', cls, escapeHtml(msg));
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3200);
  }

  /* ───── Wizard stepper ───── */
  const WIZARD_STEPS = {
    prompter: [
      { id: 1, label: 'Brief',      href: 'wizard-1-brief.html' },
      { id: 2, label: 'Skills',     href: 'wizard-2-skills.html' },
      { id: 3, label: 'Problem',    href: 'wizard-3-instruction.html' },
      { id: 4, label: 'Verifiers',  href: 'wizard-4-verifiers.html' },
      { id: 5, label: 'Solution',   href: 'wizard-5-solution.html' },
      { id: 6, label: 'Try Model',  href: 'wizard-6-trymodel.html' },
      { id: 7, label: 'Submit',     href: 'wizard-7-submit.html' },
    ],
    tester: [
      { id: 1, label: 'Context',     href: 'wizard-1-context.html' },
      { id: 2, label: 'Solution',    href: 'wizard-3-solution.html' },
      { id: 3, label: 'Tests',       href: 'wizard-4-tests.html' },
      { id: 4, label: 'Oracle',      href: 'wizard-5-oracle.html' },
    ],
  };

  function renderWizardStepper(activeStep, role) {
    const mount = document.getElementById('wizard-stepper');
    if (!mount) return;
    role = role || getRole();
    const steps = WIZARD_STEPS[role];
    if (!steps) return;
    const accent = ROLE_ACCENT[role] || ROLE_ACCENT.prompter;
    const colorMap = { indigo: '#4f46e5', emerald: '#059669', amber: '#f59e0b', violet: '#7c3aed', slate: '#475569', rose: '#e11d48', cyan: '#0891b2' };
    const activeColor = colorMap[accent.step] || colorMap.indigo;

    const parts = [];
    steps.forEach((s, i) => {
      const state = s.id < activeStep ? 'done' : (s.id === activeStep ? 'active' : '');
      const href = s.href + (getWizardTaskId() ? '?id=' + encodeURIComponent(getWizardTaskId()) : '');
      parts.push(`
        <a href="${href}" class="flex flex-col items-center min-w-0">
          <div class="step-dot ${state}"><span>${s.id}</span></div>
          <div class="mt-1 text-[11px] font-medium ${state ? 'text-slate-900' : 'text-slate-500'} truncate max-w-[4.5rem] text-center">${s.label}</div>
        </a>`);
      if (i < steps.length - 1) {
        parts.push(`<div class="step-line ${s.id < activeStep ? 'done' : ''} mt-3" style="${s.id < activeStep ? 'background:' + activeColor : ''}"></div>`);
      }
    });
    mount.innerHTML = `<div class="flex items-start max-w-2xl mx-auto px-2">${parts.join('')}</div>`;
    mount.classList.add('stepper-' + role);
  }

  /* ───── Oracle simulator ───── */
  function runOracle(opts) {
    opts = opts || {};
    const fail = opts.fail === true;
    const onProgress = opts.onProgress || function () {};
    const onComplete = opts.onComplete || function () {};
    const stages = [
      { label: 'Building environment from Dockerfile', ms: 2000 },
      { label: 'Running solution/solve.sh', ms: 1500 },
      { label: 'Running verifier (tests/test.sh)', ms: 1500 },
      { label: 'Parsing /logs/verifier/reward.json', ms: 700 },
    ];
    let i = 0;
    const totalMs = stages.reduce((a, s) => a + s.ms, 0);
    let elapsed = 0;
    function nextStage() {
      if (i >= stages.length) { onComplete({ reward: fail ? 0.5 : 1.0, pass: !fail, runtimeSec: (totalMs / 1000).toFixed(1) }); return; }
      const s = stages[i];
      elapsed += s.ms;
      onProgress({ stage: s.label, stageIndex: i, percent: Math.round(elapsed / totalMs * 100) });
      i++;
      setTimeout(nextStage, s.ms);
    }
    nextStage();
  }

  /* ───── Mock model execution (for prompter try-model) ───── */
  function runMockModel(opts) {
    opts = opts || {};
    const onProgress = opts.onProgress || function () {};
    const onComplete = opts.onComplete || function () {};
    const stages = [
      { label: 'Sending prompt to model...', ms: 1500 },
      { label: 'Model generating response...', ms: 2500 },
      { label: 'Checking verifiers against response...', ms: 1000 },
    ];
    let i = 0;
    function next() {
      if (i >= stages.length) {
        const verifiers = opts.verifiers || [];
        const results = verifiers.map(v => ({
          ...v,
          passed: Math.random() > 0.15,
        }));
        onComplete({ results, allPassed: results.every(r => r.passed) });
        return;
      }
      onProgress({ stage: stages[i].label, stageIndex: i, percent: Math.round((i + 1) / stages.length * 100) });
      const ms = stages[i].ms;
      i++;
      setTimeout(next, ms);
    }
    next();
  }

  /* ───── Harbor preview ───── */
  function renderHarborPreview(mount, task, opts) {
    opts = opts || {};
    if (typeof mount === 'string') mount = document.getElementById(mount) || $(mount);
    if (!mount) return;
    const files = SBData.harborFiles(task);
    const onlyFiles = files.filter(f => f.type === 'file');
    const TREE = files.map(f => Object.assign({}, f, { depth: f.path.split('/').length - 1 }));
    const taskName = task.name || 'my-org/task';
    const initialPath = opts.initial || 'solution/solve.sh';
    const ownerCls = { prompter: 'bg-indigo-100 text-indigo-700', tester: 'bg-emerald-100 text-emerald-700', shared: 'bg-slate-100 text-slate-600' };

    mount.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-[15rem_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div class="bg-slate-50 px-3 py-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">Harbor folder</div>
          <div class="text-xs font-mono text-slate-900 mb-2 px-1">${escapeHtml(taskName)}/</div>
          <ul id="hp-tree" class="space-y-0.5 text-xs font-mono"></ul>
          <div class="mt-3 px-1 text-[10px] text-slate-500">
            <span class="px-1 py-0.5 rounded bg-indigo-100 text-indigo-700">Prompter</span>
            <span class="px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-1">Tester</span>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white">
            <span class="text-slate-400">${icon('file')}</span>
            <code id="hp-current-path" class="text-xs text-slate-700"></code>
            <span id="hp-owner-badge" class="ml-auto text-[10px] px-1.5 py-0.5 rounded"></span>
          </div>
          <pre id="hp-current-content" class="code-block scroll-y m-0 rounded-none flex-1" style="max-height:24rem;min-height:10rem"></pre>
        </div>
      </div>`;

    const treeEl = mount.querySelector('#hp-tree');
    TREE.forEach(node => {
      const li = document.createElement('li');
      li.style.paddingLeft = (node.depth * 0.75) + 'rem';
      if (node.type === 'dir') {
        li.innerHTML = `<span class="text-slate-500 inline-flex items-center gap-1">${icon('folder')}<span>${escapeHtml(node.label)}</span></span>`;
      } else {
        const oc = ownerCls[node.owner] || ownerCls.shared;
        li.innerHTML = `<a href="#" data-path="${escapeHtml(node.path)}" class="hp-file inline-flex items-center gap-1 text-slate-700 hover:text-indigo-700 rounded px-1 py-0.5 w-full">${icon('file')}<span class="truncate">${escapeHtml(node.label)}</span><span class="ml-auto text-[9px] uppercase px-1 rounded ${oc}">${node.owner||'shared'}</span></a>`;
      }
      treeEl.appendChild(li);
    });

    function show(path) {
      const f = onlyFiles.find(x => x.path === path) || onlyFiles[0];
      if (!f) return;
      mount.querySelector('#hp-current-path').textContent = taskName + '/' + f.path;
      mount.querySelector('#hp-current-content').textContent = f.content;
      const badge = mount.querySelector('#hp-owner-badge');
      badge.textContent = f.owner || 'shared';
      badge.className = 'ml-auto text-[10px] px-1.5 py-0.5 rounded ' + (ownerCls[f.owner] || ownerCls.shared);
      mount.querySelectorAll('a.hp-file').forEach(a => {
        const on = a.dataset.path === f.path;
        a.classList.toggle('bg-white', on);
        a.classList.toggle('text-indigo-700', on);
        a.classList.toggle('font-semibold', on);
      });
    }
    mount.querySelectorAll('a.hp-file').forEach(a => a.addEventListener('click', e => { e.preventDefault(); show(a.dataset.path); }));
    show(initialPath);
  }

  /* ───── Template picker ───── */
  function renderTemplatePicker(mount, selectedId, onSelect) {
    if (typeof mount === 'string') mount = document.getElementById(mount) || $(mount);
    if (!mount) return;
    const cards = SBData.templates.map(tpl => {
      const sel = tpl.id === selectedId;
      return `<button type="button" data-tpl="${escapeHtml(tpl.id)}" class="tpl-card text-left w-full p-4 rounded-lg border-2 transition-all ${sel ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300 bg-white'}">
        <div class="font-semibold text-slate-900">${escapeHtml(tpl.name)}</div>
        <div class="text-xs text-slate-500 mt-1">${escapeHtml(tpl.desc)}</div>
        <div class="mt-2 flex flex-wrap gap-1">${tpl.tags.map(tag => `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="mt-2 text-[10px] text-slate-500">${tpl.resources.cpus} CPU · ${tpl.resources.memoryGB} GB RAM${tpl.resources.gpu ? ' · GPU' : ''}</div>
      </button>`;
    }).join('');
    mount.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${cards}</div>`;
    mount.querySelectorAll('.tpl-card').forEach(btn => {
      btn.addEventListener('click', () => {
        mount.querySelectorAll('.tpl-card').forEach(b => { b.classList.remove('border-emerald-500','bg-emerald-50','ring-2','ring-emerald-200'); b.classList.add('border-slate-200','bg-white'); });
        btn.classList.remove('border-slate-200','bg-white');
        btn.classList.add('border-emerald-500','bg-emerald-50','ring-2','ring-emerald-200');
        if (onSelect) onSelect(btn.dataset.tpl);
      });
    });
  }

  /* ───── Skills picker (two-panel) ───── */
  function renderSkillsPicker(mount, selectedSkills, onChange) {
    if (typeof mount === 'string') mount = document.getElementById(mount) || $(mount);
    if (!mount) return;
    const domains = SBData.skillDomains;
    let activeDomain = domains[0].id;
    function render() {
      const domainList = domains.map(d => `<button data-domain="${d.id}" class="skill-domain-btn w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${d.id === activeDomain ? d.color + ' font-semibold' : 'hover:bg-slate-100 text-slate-700'}">${escapeHtml(d.name)}</button>`).join('');
      const skills = SBData.getSkillsByDomain(activeDomain);
      const skillList = skills.length ? skills.map(s => {
        const checked = selectedSkills.includes(s.id);
        return `<label class="flex items-start gap-3 p-3 rounded-lg border ${checked ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'} cursor-pointer transition-colors">
          <input type="checkbox" value="${s.id}" ${checked ? 'checked' : ''} class="mt-0.5 accent-indigo-600">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm text-slate-900">${escapeHtml(s.name)}</div>
            <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(s.desc)}</div>
            <div class="mt-1 flex flex-wrap gap-1">${s.tags.map(t => `<span class="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </label>`;
      }).join('') : '<p class="text-sm text-slate-400 italic p-4">No skills in this domain yet.</p>';

      mount.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-4 border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div class="bg-slate-50 p-3 space-y-1 border-r border-slate-200">${domainList}</div>
          <div class="p-4 space-y-2 max-h-[24rem] overflow-y-auto scroll-y">${skillList}</div>
        </div>
        <div class="mt-2 text-xs text-slate-500">${selectedSkills.length} skill(s) selected</div>`;

      mount.querySelectorAll('.skill-domain-btn').forEach(btn => {
        btn.addEventListener('click', () => { activeDomain = btn.dataset.domain; render(); });
      });
      mount.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked && !selectedSkills.includes(cb.value)) selectedSkills.push(cb.value);
          else { const idx = selectedSkills.indexOf(cb.value); if (idx >= 0) selectedSkills.splice(idx, 1); }
          if (onChange) onChange(selectedSkills);
          render();
        });
      });
    }
    render();
  }

  /* ───── Modals ───── */
  function openModal(id) { const m = document.getElementById(id); if (m) m.removeAttribute('hidden'); }
  function closeModal(id) { const m = document.getElementById(id); if (m) m.setAttribute('hidden', ''); }

  function renderRequestChangesModal(task, onSubmit) {
    let existing = document.getElementById('changes-modal');
    if (existing) existing.remove();
    const modal = el('div', 'modal-overlay');
    modal.id = 'changes-modal';
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 class="font-semibold text-lg mb-3">Request changes</h3>
        <div class="mb-3"><label class="text-sm font-medium">Route to:</label>
          <div class="flex gap-2 mt-1">
            <label class="flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300"><input type="radio" name="target" value="prompter" checked class="mr-1">Prompter</label>
            <label class="flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-300"><input type="radio" name="target" value="tester" class="mr-1">Tester</label>
          </div>
        </div>
        <textarea id="changes-body" rows="3" placeholder="Describe what needs to change..." class="w-full px-3 py-2 text-sm border rounded-md"></textarea>
        <div class="mt-4 flex justify-end gap-2">
          <button id="changes-cancel" class="px-3 py-1.5 text-sm border rounded-md">Cancel</button>
          <button id="changes-send" class="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md font-medium">Send</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#changes-cancel').onclick = () => modal.remove();
    modal.querySelector('#changes-send').onclick = () => {
      const body = modal.querySelector('#changes-body').value.trim();
      const target = modal.querySelector('input[name="target"]:checked').value;
      if (!body) { toast('Please add a comment.', 'warning'); return; }
      modal.remove();
      if (onSubmit) onSubmit({ body, target });
    };
  }

  /* ───── State transitions ───── */
  function submitPrompterToDomainReview(t) {
    const now = 'just now';
    const session = getSession();
    const prompterUser = session ? (SBData.allUsers.find(u => u.id === session.userId) || SBData.users.prompter) : SBData.users.prompter;
    const prompterRef = { id: prompterUser.id, name: prompterUser.name, initials: prompterUser.initials };
    const existing = SBData.tasks.find(x => x.id && getWizardTaskId() === x.id);
    if (existing) {
      Object.assign(existing, {
        name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
        instructionMd: t.instructionMd, verifiers: t.verifiers || [], goldenSolution: t.goldenSolution || '',
        selectedSkills: t.selectedSkills || [], attachments: t.attachments || [],
        status: 'domain-review', domainReviewer: null, updatedAt: now,
        history: (existing.history || []).concat([{ when: now, who: prompterUser.name, event: 'Submitted for domain review' }]),
      });
      return existing;
    }
    const id = 'tnew_' + Date.now();
    const row = {
      id, name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
      status: 'domain-review', prompter: prompterRef, domainReviewer: null, tester: null, templateId: null,
      updatedAt: now, instructionMd: t.instructionMd, verifiers: t.verifiers || [],
      goldenSolution: t.goldenSolution || '', selectedSkills: t.selectedSkills || [],
      attachments: t.attachments || [], dockerfile: '', solveSh: '', testSh: '',
      oraclePassed: false, history: [
        { when: now, who: prompterUser.name, event: 'Created draft' },
        { when: now, who: prompterUser.name, event: 'Submitted for domain review' },
      ], comments: [],
    };
    SBData.tasks.unshift(row);
    return row;
  }

  function domainReviewerApprove(taskId) {
    const t = SBData.getTaskById(taskId);
    if (!t) return;
    t.status = 'with-tester';
    t.domainReviewer = SBData.users.domainReviewer;
    t.updatedAt = 'just now';
    t.history.push({ when: 'just now', who: SBData.users.domainReviewer.name, event: 'Domain review approved' });
  }

  function domainReviewerReject(taskId, comment) {
    const t = SBData.getTaskById(taskId);
    if (!t) return;
    t.status = 'changes-requested';
    t.changesTarget = 'prompter';
    t.updatedAt = 'just now';
    t.domainReviewer = SBData.users.domainReviewer;
    t.history.push({ when: 'just now', who: SBData.users.domainReviewer.name, event: 'Requested changes (prompter)' });
    if (comment) t.comments.push({ author: SBData.users.domainReviewer, when: 'just now', body: comment });
  }

  function pickUpTask(taskId) {
    const t = SBData.getTaskById(taskId);
    if (!t) return;
    const session = getSession();
    const user = session ? SBData.allUsers.find(u => u.id === session.userId) || SBData.users.tester : SBData.users.tester;
    t.tester = { id: user.id, name: user.name, initials: user.initials };
    t.updatedAt = 'just now';
    t.history.push({ when: 'just now', who: user.name, event: 'Picked up from tester queue' });
  }

  function submitTesterToReview(t) {
    const now = 'just now';
    const id = getWizardTaskId();
    const row = id ? SBData.getTaskById(id) : null;
    if (row) {
      Object.assign(row, {
        templateId: t.templateId, dockerfile: t.dockerfile, solveSh: t.solveSh, testSh: t.testSh,
        oraclePassed: t.oraclePassed, oracleReward: t.oracleReward,
        status: 'in-review', updatedAt: now,
      });
      row.history.push({ when: now, who: SBData.users.tester.name, event: 'Submitted for tech review (Oracle PASS)' });
    }
  }

  return {
    $, $$, el, icon, escapeHtml,
    isAuthenticated, getSession, login, logout, getHomePage, requireAuth,
    getRole, setRole, clearRole,
    getWizardTaskId, setWizardTaskId, loadWizardTask, getWizardTaskFromSession, saveWizardTaskToSession,
    renderNav, renderWizardStepper, toast,
    runOracle, runMockModel, renderHarborPreview, renderTemplatePicker, renderSkillsPicker,
    openModal, closeModal, renderRequestChangesModal,
    submitPrompterToDomainReview, domainReviewerApprove, domainReviewerReject,
    pickUpTask, submitTesterToReview,
  };
})();
