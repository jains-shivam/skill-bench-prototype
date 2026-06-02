/* Skill Bench MVP - Shared UI logic.
 *
 * 7 roles: superAdmin, admin, projectManager, prompter, domainReviewer, tester, taskReviewer
 *
 * MULTI-ROLE: a user can hold several roles. The auth session stores `roles[]`
 * (everything they may act as) and `role` (the currently ACTIVE role used for
 * nav + landing). switchActiveRole() flips the active role among assigned roles.
 *
 * WIZARD FLOW (Prompter): Brief → Skills → Problem → SOLUTION → VERIFIERS → Try Model → Submit.
 * Solution is authored BEFORE verifiers so each verifier can be validated
 * against a concrete reference solution (mirrors Harbor's oracle dry-run). */
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

  /* ───── Authentication ─────
   * Mock auth. CREDENTIALS maps email → userId; the user's roles are derived from
   * SBData.allUsers so the multi-role model stays in one place (the data layer). */
  const AUTH_KEY = 'sb-mvp-auth';
  const DEMO_PASSWORD = 'demo123';

  const CREDENTIALS = {
    'sarah@my-org.com': 'u0',
    'dave@my-org.com':  'u5',
    'nina@my-org.com':  'u8',
    'jane@my-org.com':  'u1',
    'raj@my-org.com':   'u2',
    'tara@my-org.com':  'u3',
    'bob@my-org.com':   'u4',
    'aisha@my-org.com': 'u6',
    'marco@my-org.com': 'u7',
  };

  const VALID_ROLES = ['superAdmin','admin','projectManager','prompter','domainReviewer','tester','taskReviewer'];

  /* Landing page per role. Used after login and when switching the active role. */
  const ROLE_HOME = {
    superAdmin: 'super-admin/dashboard.html',
    admin: 'admin/dashboard.html',
    projectManager: 'project-manager/dashboard.html',
    prompter: 'prompter/dashboard.html',
    domainReviewer: 'domain-reviewer/queue.html',
    tester: 'tester/queue.html',
    taskReviewer: 'reviewer/queue.html',
  };

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

  /* All role keys the logged-in user can act as (from their session). */
  function getSessionRoles() {
    const s = getSession();
    if (!s) return [];
    if (Array.isArray(s.roles) && s.roles.length) return s.roles.filter(r => VALID_ROLES.includes(r));
    return s.role ? [s.role] : [];
  }

  function login(email, password) {
    const userId = CREDENTIALS[email.toLowerCase()];
    if (!userId) return { success: false, error: 'No account found with this email address' };
    if (password !== DEMO_PASSWORD) return { success: false, error: 'Incorrect password. Try: demo123' };
    const user = SBData.allUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Account is not provisioned' };
    if (user.status === 'inactive') return { success: false, error: 'This account is deactivated. Contact your admin.' };
    const roles = SBData.userRoleKeys(user).filter(r => VALID_ROLES.includes(r));
    const active = (user.primaryRole && roles.includes(user.primaryRole)) ? user.primaryRole : (roles[0] || 'prompter');
    const session = { email: email.toLowerCase(), userId: user.id, name: user.name, roles, role: active, loginAt: Date.now() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    localStorage.setItem(ROLE_KEY, active);
    return { success: true, session };
  }

  /* Switch which role the user is currently acting as. Only roles the user
   * actually holds are allowed (enforced here, not just hidden in the UI). */
  function switchActiveRole(roleKey) {
    const s = getSession();
    if (!s) return false;
    const roles = getSessionRoles();
    if (!roles.includes(roleKey)) return false;
    s.role = roleKey;
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    localStorage.setItem(ROLE_KEY, roleKey);
    return true;
  }

  /* DEMO ONLY: jump into any role by logging in as that role's representative
   * user. Used by the index.html role gallery so reviewers can explore every
   * flow during a demo. In production this gallery would not exist; users only
   * ever switch among roles they actually hold (see goToRole). */
  const ROLE_DEMO_EMAIL = {
    superAdmin: 'sarah@my-org.com', admin: 'dave@my-org.com', projectManager: 'nina@my-org.com',
    prompter: 'jane@my-org.com', domainReviewer: 'raj@my-org.com', tester: 'tara@my-org.com',
    taskReviewer: 'bob@my-org.com',
  };
  function demoLoginAs(roleKey) {
    const email = ROLE_DEMO_EMAIL[roleKey];
    if (!email) return false;
    const r = login(email, DEMO_PASSWORD);
    if (r.success) { switchActiveRole(roleKey); setRole(roleKey); return true; }
    return false;
  }

  /* Switch active role AND navigate to that role's home (used by sidebar switcher). */
  function goToRole(roleKey) {
    if (!switchActiveRole(roleKey)) return;
    const base = basePath();
    location.href = base + '/' + (ROLE_HOME[roleKey] || 'index.html');
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
    return ROLE_HOME[session.role] || 'admin/dashboard.html';
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      const base = basePath();
      location.href = base + '/login.html';
      return false;
    }
    return true;
  }

  /* ───── Role management ─────
   * ROLE_KEY tracks the role whose sidebar/nav is currently shown. Each role page
   * declares its role via requireRole(), which doubles as an ACCESS GUARD. */
  const ROLE_KEY = 'sb-mvp-role';
  function getRole() { return localStorage.getItem(ROLE_KEY) || (getSession() ? getSession().role : 'prompter'); }
  function setRole(role) { localStorage.setItem(ROLE_KEY, role); }
  function clearRole() { localStorage.removeItem(ROLE_KEY); }

  /* Page-level access guard. Call at the top of every role-specific page:
   *   if (!SB.requireRole('prompter')) throw 'auth';
   * 1) Requires a valid session (else → login).
   * 2) Enforces that the logged-in user actually HOLDS this role (real access
   *    control, not just hidden nav). If not, redirect to their own home.
   * 3) Sets the active role so the correct sidebar renders. */
  function requireRole(roleKey) {
    if (!requireAuth()) return false;
    const roles = getSessionRoles();
    if (roleKey && roles.length && !roles.includes(roleKey)) {
      // Switch active role to the page's home owner only if allowed; otherwise bounce.
      const base = basePath();
      try { sessionStorage.setItem('sb-access-denied', roleKey); } catch(e) {}
      location.href = base + '/' + getHomePage();
      return false;
    }
    if (roleKey) { switchActiveRole(roleKey); setRole(roleKey); }
    return true;
  }

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

    /* Multi-role switcher: only list the roles THIS user actually holds. Each
     * entry flips the active role and lands on that role's home page. Shown only
     * when the user has more than one role. */
    const myRoles = getSessionRoles();
    let roleSwitcherHtml = '';
    if (myRoles.length > 1) {
      const links = myRoles.map(rk => {
        const rl = (SBData.ROLES[rk] || {}).label || rk;
        const isCur = rk === role;
        return `<a href="#" onclick="SB.goToRole('${rk}');return false;" class="sb-nav-item ${isCur ? 'active' : ''}" style="padding-left:0.65rem">
          <span class="sb-icon">${ICONS.switchRole}</span>
          <span class="sb-label">${escapeHtml(rl)}${isCur ? ' ✓' : ''}</span>
          <span class="sb-tooltip">Act as ${escapeHtml(rl)}</span>
        </a>`;
      }).join('');
      roleSwitcherHtml = `<div class="sb-nav-section-title">My roles</div>${links}`;
    }

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
            ${roleSwitcherHtml}
            <div class="sb-nav-section-title">Account</div>
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

  /* ───── Wizard stepper ─────
   * PROMPTER flow intentionally puts SOLUTION (4) before VERIFIERS (5): a verifier
   * is only meaningful when there is a concrete golden solution to check it
   * against. The Try Model step then runs the prompt+verifiers against a mock
   * model. TESTER flow turns the package into an executable environment + tests. */
  const WIZARD_STEPS = {
    prompter: [
      { id: 1, label: 'Brief',      href: 'wizard-1-brief.html' },
      { id: 2, label: 'Skills',     href: 'wizard-2-skills.html' },
      { id: 3, label: 'Problem',    href: 'wizard-3-instruction.html' },
      { id: 4, label: 'Solution',   href: 'wizard-4-solution.html' },
      { id: 5, label: 'Verifiers',  href: 'wizard-5-verifiers.html' },
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

  /* ───── Verifier validation (MOCK) ─────
   * Product intent: when a Prompter adds a verifier, the platform validates it
   * AGAINST THE GOLDEN SOLUTION + PROMPT to answer "is this verifier checkable
   * and does the reference solution satisfy it?". That requires an LLM at runtime.
   *
   * TODO (real implementation): replace this mock with a call to the verifier
   * validation service / LLM. Inputs: { verifierText, goldenSolution, prompt }.
   * Output: { status: 'validated'|'needs_review'|'failed', rationale }.
   *
   * MOCK heuristic (deterministic enough for demo): if the verifier text shares
   * meaningful keywords with the solution/prompt → 'validated'; if it is very
   * short or references nothing concrete → 'needs_review'; empty → 'failed'.
   * Always resolves after a short delay so the UI can show a "Validating…" state. */
  function validateVerifierMock(opts) {
    opts = opts || {};
    const text = (opts.verifierText || '').toLowerCase();
    const context = ((opts.goldenSolution || '') + ' ' + (opts.prompt || '')).toLowerCase();
    const onComplete = opts.onComplete || function () {};
    const delay = opts.delay != null ? opts.delay : (900 + Math.random() * 700);
    setTimeout(function () {
      let status = 'needs_review';
      let rationale = 'Could not confirm this check against the golden solution. Please review.';
      if (!text.trim()) {
        status = 'failed';
        rationale = 'Empty verifier.';
      } else {
        const words = text.split(/[^a-z0-9_./]+/).filter(w => w.length >= 4);
        const overlap = words.filter(w => context.includes(w));
        if (context && overlap.length >= 2) {
          status = 'validated';
          rationale = 'The golden solution appears to satisfy this check.';
        } else if (context && overlap.length === 1) {
          status = 'needs_review';
          rationale = 'Partial match with the solution — confirm this is fully covered.';
        }
      }
      onComplete({ status, rationale });
    }, delay);
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
      // Each row = a selectable label (checkbox + text) + a separate "View" link.
      // The View link opens the read-only skill definition (incl. uploaded file)
      // so a Prompter can inspect a skill before attaching it.
      const skillList = skills.length ? skills.map(s => {
        const checked = selectedSkills.includes(s.id);
        return `<div class="flex items-start gap-2 p-3 rounded-lg border ${checked ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'} transition-colors">
          <label class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
            <input type="checkbox" value="${s.id}" ${checked ? 'checked' : ''} class="mt-0.5 accent-indigo-600">
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-slate-900">${escapeHtml(s.name)}</div>
              <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(s.desc)}</div>
              <div class="mt-1 flex flex-wrap gap-1">${s.tags.map(t => `<span class="text-[10px] px-1 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(t)}</span>`).join('')}</div>
            </div>
          </label>
          <button type="button" data-view="${s.id}" class="skill-view-link text-xs text-indigo-600 hover:underline shrink-0 mt-0.5">View</button>
        </div>`;
      }).join('') : '<p class="text-sm text-slate-400 italic p-4">No skills in this domain yet.</p>';

      mount.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-4 border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div class="bg-slate-50 p-3 space-y-1 border-r border-slate-200 max-h-[24rem] overflow-y-auto scroll-y">${domainList}</div>
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
      mount.querySelectorAll('.skill-view-link').forEach(b => {
        b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); renderSkillViewModal(SBData.getSkillById(b.dataset.view)); });
      });
    }
    render();
  }

  /* ───── Skill viewer (read-only) ─────────────────────────────────────────
   * Shows a skill's definition plus the REQUIRED uploaded skill-file content.
   * Reused by the skills picker (Prompter) so skills can be inspected anywhere
   * they are listed, not just on the admin catalog page. */
  function renderSkillViewModal(skill) {
    if (!skill) return;
    const old = document.getElementById('skill-view-modal'); if (old) old.remove();
    const domainsHtml = SBData.skillDomainIds(skill).map(did => {
      const d = SBData.getDomain(did);
      return `<span class="text-[10px] px-2 py-0.5 rounded font-medium ${d ? d.color : 'bg-slate-100 text-slate-600'}">${escapeHtml(d ? d.name : did)}</span>`;
    }).join(' ') || '<span class="text-xs text-slate-400">—</span>';
    const tagsHtml = (skill.tags || []).map(t => `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(t)}</span>`).join(' ') || '<span class="text-xs text-slate-400">—</span>';
    const fileName = skill.file ? skill.file.name : '';
    const fileContent = skill.file && skill.file.content ? skill.file.content : '(No skill file uploaded)';
    const overlay = el('div', 'modal-overlay');
    overlay.id = 'skill-view-modal';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl mx-4">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-semibold text-lg">${escapeHtml(skill.name)}</h3>
          <button id="sv-close" type="button" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        <div class="px-6 py-5 space-y-4 overflow-y-auto scroll-y">
          <div><div class="text-xs font-semibold uppercase text-slate-500 mb-1">Description</div><p class="text-sm text-slate-700">${escapeHtml(skill.desc || '—')}</p></div>
          <div><div class="text-xs font-semibold uppercase text-slate-500 mb-1">Domains</div><div class="flex flex-wrap gap-1">${domainsHtml}</div></div>
          <div><div class="text-xs font-semibold uppercase text-slate-500 mb-1">Tags</div><div class="flex flex-wrap gap-1">${tagsHtml}</div></div>
          <div>
            <div class="text-xs font-semibold uppercase text-slate-500 mb-1 flex items-center justify-between"><span>Skill file</span><span class="font-mono normal-case text-[11px] text-slate-400">${escapeHtml(fileName)}</span></div>
            <pre class="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-72 overflow-y-auto scroll-y">${escapeHtml(fileContent)}</pre>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button id="sv-done" type="button" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Done</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('#sv-close').onclick = close;
    overlay.querySelector('#sv-done').onclick = close;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
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

  /* ───── State transitions ─────
   * Each transition keeps the audit trail (history) and, where relevant, clears
   * rework metadata so a resubmitted task no longer shows as "in rework". */
  function getSessionUser(fallback) {
    const session = getSession();
    return session ? (SBData.allUsers.find(u => u.id === session.userId) || fallback) : fallback;
  }

  function submitPrompterToDomainReview(t) {
    const now = 'just now';
    const prompterUser = getSessionUser(SBData.users.prompter);
    const prompterRef = { id: prompterUser.id, name: prompterUser.name, initials: prompterUser.initials };
    const existing = SBData.tasks.find(x => x.id && getWizardTaskId() === x.id);
    if (existing) {
      Object.assign(existing, {
        name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
        instructionMd: t.instructionMd, verifiers: t.verifiers || [], goldenSolution: t.goldenSolution || '',
        selectedSkills: t.selectedSkills || [], attachments: t.attachments || [],
        status: 'domain-review', domainReviewer: null, updatedAt: now,
        // Clear rework flags on resubmit (the task is fresh in the review queue again).
        changesTarget: null, reworkReason: null, reworkRequestedBy: null,
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
    const reviewer = getSessionUser(SBData.users.domainReviewer);
    t.status = 'with-tester';
    t.domainReviewer = { id: reviewer.id, name: reviewer.name, initials: reviewer.initials };
    t.updatedAt = 'just now';
    // Approving clears any prior rework flags.
    t.changesTarget = null; t.reworkReason = null; t.reworkRequestedBy = null;
    t.history.push({ when: 'just now', who: reviewer.name, event: 'Domain review approved' });
  }

  /* Domain reviewer can only route rework back to the PROMPTER: at this stage no
   * tester has been assigned yet, so the prompter is the only valid owner. */
  function domainReviewerReject(taskId, comment) {
    const t = SBData.getTaskById(taskId);
    if (!t) return;
    const reviewer = getSessionUser(SBData.users.domainReviewer);
    t.status = 'changes-requested';
    t.changesTarget = 'prompter';
    t.reworkReason = comment || 'Changes requested by domain reviewer.';
    t.reworkRequestedBy = reviewer.name;
    t.reworkCount = (t.reworkCount || 0) + 1;
    t.updatedAt = 'just now';
    t.domainReviewer = { id: reviewer.id, name: reviewer.name, initials: reviewer.initials };
    t.history.push({ when: 'just now', who: reviewer.name, event: 'Requested changes (prompter)' });
    if (comment) t.comments.push({ author: { id: reviewer.id, name: reviewer.name, initials: reviewer.initials, role: 'Domain Reviewer' }, when: 'just now', body: comment });
  }

  function pickUpTask(taskId) {
    const t = SBData.getTaskById(taskId);
    if (!t) return;
    const user = getSessionUser(SBData.users.tester);
    t.tester = { id: user.id, name: user.name, initials: user.initials };
    t.updatedAt = 'just now';
    t.history.push({ when: 'just now', who: user.name, event: 'Picked up from tester queue' });
  }

  function submitTesterToReview(t) {
    const now = 'just now';
    const tester = getSessionUser(SBData.users.tester);
    const id = getWizardTaskId();
    const row = id ? SBData.getTaskById(id) : null;
    if (row) {
      Object.assign(row, {
        templateId: t.templateId, dockerfile: t.dockerfile, solveSh: t.solveSh, testSh: t.testSh,
        oraclePassed: t.oraclePassed, oracleReward: t.oracleReward,
        testingNotes: t.testingNotes || row.testingNotes || '',
        // Reaching review means the tester reproduced the task and Oracle PASSed.
        testOutcome: 'pass',
        status: 'in-review', updatedAt: now,
        // Tester resubmitting after rework clears the tester-targeted rework flags.
        changesTarget: null, reworkReason: null, reworkRequestedBy: null,
      });
      row.history.push({ when: now, who: tester.name, event: 'Submitted for tech review (Oracle PASS)' });
    }
  }

  /* ───── Role + status based task permissions ─────────────────────────────
   * Single source of truth for "what can role X do on a task in status Y".
   * UI screens read this instead of re-deriving permissions inline, so edit
   * access is intentional and workflow-based rather than scattered/guessed.
   *
   * Editing rationale:
   *  - Domain Reviewer (status = domain-review): owns quality of the Prompter's
   *    content before it reaches a Tester, so may edit that content INLINE
   *    (problem statement, golden solution, verifiers, skills, domain, difficulty)
   *    to fix small issues instead of bouncing every typo back. Identity fields
   *    (name/id), status and assignees stay locked.
   *  - Tester (status = with-tester / tester-targeted rework): owns the
   *    implementation artifacts (Dockerfile, solve.sh, test.sh) and may make
   *    MINOR fixes to the spec text. For anything substantive (wrong golden
   *    solution, impossible verifier, missing input) they send the task BACK as
   *    rework rather than rewriting the Prompter's intent.
   *  - Task Reviewer (status = in-review): approves/publishes or requests rework;
   *    does not edit content directly.
   */
  function taskPermissions(task, roleKey) {
    const status = task ? task.status : null;
    const p = {
      role: roleKey, status: status,
      canEditContent: false,   // full edit of Prompter-authored fields
      canEditMinor: false,     // small fixes to spec text only
      canEditArtifacts: false, // Dockerfile / solve.sh / test.sh
      canApprove: false,
      canRequestRework: false,
      canSendBack: false,
      lockedFields: ['id', 'name', 'status', 'prompter', 'tester', 'domainReviewer'],
    };
    if (roleKey === 'domainReviewer' && status === 'domain-review') {
      p.canEditContent = true; p.canApprove = true; p.canRequestRework = true;
    } else if (roleKey === 'tester' &&
        (status === 'with-tester' || (status === 'changes-requested' && task.changesTarget === 'tester'))) {
      p.canEditArtifacts = true; p.canEditMinor = true; p.canSendBack = true;
    } else if (roleKey === 'taskReviewer' && status === 'in-review') {
      p.canApprove = true; p.canRequestRework = true;
    }
    return p;
  }

  /* Apply an edited patch to a live task and record an audit-trail entry.
   * Used by Domain Reviewer (full content edit) and Tester (minor edits). */
  function updateTaskFields(taskId, patch, eventLabel) {
    const t = SBData.getTaskById(taskId);
    if (!t) return null;
    Object.assign(t, patch || {});
    t.updatedAt = 'just now';
    const actor = getSessionUser({ name: 'Someone' });
    if (!t.history) t.history = [];
    t.history.push({ when: 'just now', who: actor.name, event: eventLabel || 'Edited task' });
    return t;
  }

  /* Tester bounces a task back when the spec itself is broken. Routes to the
   * Prompter (content/intent problems) or Domain Reviewer (review-stage miss),
   * captures a plain-language reason + a test outcome, and increments rework. */
  function testerSendBack(task, opts) {
    opts = opts || {};
    const t = SBData.getTaskById(task.id) || task;
    const tester = getSessionUser(SBData.users.tester);
    t.status = 'changes-requested';
    t.changesTarget = opts.target || 'prompter';
    t.reworkReason = opts.reason || 'Tester reported a problem with the task spec.';
    t.reworkRequestedBy = tester.name;
    t.reworkCount = (t.reworkCount || 0) + 1;
    t.testOutcome = opts.outcome || 'blocked';
    if (opts.notes != null) t.testingNotes = opts.notes;
    t.updatedAt = 'just now';
    if (!t.history) t.history = [];
    t.history.push({ when: 'just now', who: tester.name,
      event: 'Tester sent back to ' + t.changesTarget + ' (' + t.testOutcome + ')' });
    if (!t.comments) t.comments = [];
    if (opts.reason) t.comments.push({ author: { id: tester.id, name: tester.name, initials: tester.initials, role: 'Tester' }, when: 'just now', body: opts.reason });
    return t;
  }

  /* ───── Generic Edit-Task modal ─────────────────────────────────────────
   * Reused by Domain Reviewer (full content) and Tester (minor fixes). `fields`
   * controls which inputs render so each role only edits what it is allowed to.
   * Supported keys: domain, difficulty, instructionMd, goldenSolution,
   * verifiers, skills, testingNotes. Calls onSave(patch) with only those keys. */
  function renderEditTaskModal(task, opts) {
    opts = opts || {};
    const fields = opts.fields || ['instructionMd', 'goldenSolution', 'verifiers', 'skills', 'domain', 'difficulty'];
    const has = (k) => fields.includes(k);
    const existing = document.getElementById('edit-task-modal');
    if (existing) existing.remove();

    // Work on copies so Cancel discards cleanly.
    let verifiers = JSON.parse(JSON.stringify(task.verifiers || []));
    let selectedSkills = (task.selectedSkills || []).slice();

    const domainOptions = SBData.skillDomains.map(d => `<option value="${d.id}" ${d.id === task.domain ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('');
    const diffOptions = ['easy', 'medium', 'hard'].map(d => `<option value="${d}" ${(task.difficulty || 'medium') === d ? 'selected' : ''}>${d}</option>`).join('');

    const overlay = el('div', 'modal-overlay');
    overlay.id = 'edit-task-modal';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg max-w-3xl w-full shadow-xl mx-4 max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-semibold text-lg">${escapeHtml(opts.title || 'Edit task')}</h3>
          <button id="et-close" type="button" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>
        ${opts.note ? `<div class="px-6 pt-3 text-xs text-slate-500">${opts.note}</div>` : ''}
        <div class="px-6 py-4 space-y-5 overflow-y-auto scroll-y">
          ${(has('domain') || has('difficulty')) ? `<div class="grid grid-cols-2 gap-3">
            ${has('domain') ? `<div><label class="text-sm font-medium">Domain</label><select id="et-domain" class="mt-1 w-full px-3 py-2 text-sm border rounded-md">${domainOptions}</select></div>` : ''}
            ${has('difficulty') ? `<div><label class="text-sm font-medium">Difficulty</label><select id="et-difficulty" class="mt-1 w-full px-3 py-2 text-sm border rounded-md">${diffOptions}</select></div>` : ''}
          </div>` : ''}
          ${has('instructionMd') ? `<div><label class="text-sm font-medium">Problem statement</label><textarea id="et-instruction" rows="8" class="mt-1 w-full px-3 py-2 text-sm border rounded-md font-mono">${escapeHtml(task.instructionMd || '')}</textarea></div>` : ''}
          ${has('goldenSolution') ? `<div><label class="text-sm font-medium">Golden solution</label><textarea id="et-golden" rows="6" class="mt-1 w-full px-3 py-2 text-sm border rounded-md font-mono">${escapeHtml(task.goldenSolution || '')}</textarea></div>` : ''}
          ${has('verifiers') ? `<div><div class="flex items-center justify-between"><label class="text-sm font-medium">Verifiers</label><button id="et-add-ver" type="button" class="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">+ Add verifier</button></div><div id="et-verifiers" class="mt-2 space-y-2"></div></div>` : ''}
          ${has('testingNotes') ? `<div><label class="text-sm font-medium">Testing notes</label><textarea id="et-notes" rows="3" placeholder="What you observed while testing..." class="mt-1 w-full px-3 py-2 text-sm border rounded-md">${escapeHtml(task.testingNotes || '')}</textarea></div>` : ''}
          ${has('skills') ? `<div><label class="text-sm font-medium">Skills</label><div id="et-skills" class="mt-1"></div></div>` : ''}
        </div>
        <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button id="et-cancel" type="button" class="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50">Cancel</button>
          <button id="et-save" type="button" class="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium">Save changes</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const catOpts = (sel) => '<option value="">No category</option>' + SBData.VERIFIER_CATEGORIES.map(c => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${escapeHtml(c.label)}</option>`).join('');
    function renderVerifiers() {
      const wrap = overlay.querySelector('#et-verifiers');
      if (!wrap) return;
      if (!verifiers.length) { wrap.innerHTML = '<p class="text-xs text-slate-400 italic">No verifiers yet. Add at least one.</p>'; return; }
      wrap.innerHTML = '';
      verifiers.forEach((v, i) => {
        const row = el('div', 'border border-slate-200 rounded-md p-2 space-y-1');
        row.innerHTML = `
          <div class="flex gap-2 items-center">
            <select data-i="${i}" class="et-vcat text-xs px-2 py-1 border rounded-md">${catOpts(v.category)}</select>
            <button data-i="${i}" type="button" class="et-vdel ml-auto text-xs text-rose-600 hover:underline">Remove</button>
          </div>
          <textarea data-i="${i}" rows="2" class="et-vdesc w-full px-2 py-1 text-sm border rounded-md" placeholder="Describe the success criterion in plain language">${escapeHtml(v.description || '')}</textarea>`;
        wrap.appendChild(row);
      });
      wrap.querySelectorAll('.et-vdesc').forEach(t => t.addEventListener('input', e => { verifiers[+e.target.dataset.i].description = e.target.value; }));
      wrap.querySelectorAll('.et-vcat').forEach(s => s.addEventListener('change', e => { verifiers[+e.target.dataset.i].category = e.target.value || null; }));
      wrap.querySelectorAll('.et-vdel').forEach(b => b.addEventListener('click', e => { verifiers.splice(+e.currentTarget.dataset.i, 1); renderVerifiers(); }));
    }
    renderVerifiers();
    const addVer = overlay.querySelector('#et-add-ver');
    if (addVer) addVer.addEventListener('click', () => { verifiers.push({ description: '', category: null, validationStatus: 'pending' }); renderVerifiers(); });
    if (has('skills')) renderSkillsPicker(overlay.querySelector('#et-skills'), selectedSkills, (sk) => { selectedSkills = sk; });

    const close = () => overlay.remove();
    overlay.querySelector('#et-close').onclick = close;
    overlay.querySelector('#et-cancel').onclick = close;
    overlay.querySelector('#et-save').onclick = () => {
      const patch = {};
      if (has('domain')) patch.domain = overlay.querySelector('#et-domain').value;
      if (has('difficulty')) patch.difficulty = overlay.querySelector('#et-difficulty').value;
      if (has('instructionMd')) patch.instructionMd = overlay.querySelector('#et-instruction').value;
      if (has('goldenSolution')) patch.goldenSolution = overlay.querySelector('#et-golden').value;
      if (has('verifiers')) patch.verifiers = verifiers;
      if (has('testingNotes')) patch.testingNotes = overlay.querySelector('#et-notes').value;
      if (has('skills')) patch.selectedSkills = selectedSkills;
      if (has('instructionMd') && !patch.instructionMd.trim()) { toast('Problem statement cannot be empty.', 'warning'); return; }
      if (has('verifiers') && patch.verifiers.some(v => !(v.description || '').trim())) { toast('Every verifier needs a description (or remove it).', 'warning'); return; }
      close();
      if (opts.onSave) opts.onSave(patch);
    };
  }

  /* Tester "send back" modal: target (prompter / domain reviewer), reason,
   * and a test outcome. Distinct from the reviewer's request-changes modal. */
  function renderSendBackModal(task, onSubmit) {
    const existing = document.getElementById('sendback-modal');
    if (existing) existing.remove();
    const overlay = el('div', 'modal-overlay');
    overlay.id = 'sendback-modal';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl mx-4">
        <h3 class="font-semibold text-lg mb-1">Send task back</h3>
        <p class="text-sm text-slate-500 mb-4">Use this when the task spec itself is wrong and needs the author to fix it.</p>
        <label class="text-sm font-medium">Route to</label>
        <div class="flex gap-2 mt-1 mb-3">
          <label class="flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300"><input type="radio" name="sb-target" value="prompter" checked class="mr-1">Prompter</label>
          <label class="flex-1 text-center px-3 py-2 border rounded-md cursor-pointer text-sm has-[:checked]:bg-violet-50 has-[:checked]:border-violet-300"><input type="radio" name="sb-target" value="domainReviewer" class="mr-1">Domain Reviewer</label>
        </div>
        <label class="text-sm font-medium">Test outcome</label>
        <select id="sb-outcome" class="mt-1 mb-3 w-full px-3 py-2 text-sm border rounded-md">
          <option value="fail">Fail — solution/verifiers don't work</option>
          <option value="blocked">Blocked — missing input or unclear spec</option>
        </select>
        <label class="text-sm font-medium">What needs to change</label>
        <textarea id="sb-reason" rows="3" placeholder="Describe the problem you hit while testing..." class="mt-1 w-full px-3 py-2 text-sm border rounded-md"></textarea>
        <div class="mt-4 flex justify-end gap-2">
          <button id="sb-cancel" type="button" class="px-3 py-1.5 text-sm border rounded-md hover:bg-slate-50">Cancel</button>
          <button id="sb-send" type="button" class="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium">Send back</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('#sb-cancel').onclick = close;
    overlay.querySelector('#sb-send').onclick = () => {
      const reason = overlay.querySelector('#sb-reason').value.trim();
      const target = overlay.querySelector('input[name="sb-target"]:checked').value;
      const outcome = overlay.querySelector('#sb-outcome').value;
      if (!reason) { toast('Please describe what needs to change.', 'warning'); return; }
      close();
      if (onSubmit) onSubmit({ target, outcome, reason });
    };
  }

  return {
    $, $$, el, icon, escapeHtml,
    isAuthenticated, getSession, getSessionRoles, login, logout, getHomePage, requireAuth,
    getRole, setRole, clearRole, requireRole, switchActiveRole, goToRole, demoLoginAs,
    getWizardTaskId, setWizardTaskId, loadWizardTask, getWizardTaskFromSession, saveWizardTaskToSession,
    renderNav, renderWizardStepper, toast,
    runOracle, runMockModel, validateVerifierMock, renderHarborPreview, renderTemplatePicker, renderSkillsPicker, renderSkillViewModal,
    openModal, closeModal, renderRequestChangesModal, renderEditTaskModal, renderSendBackModal,
    taskPermissions, updateTaskFields, testerSendBack,
    submitPrompterToDomainReview, domainReviewerApprove, domainReviewerReject,
    pickUpTask, submitTesterToReview,
  };
})();
