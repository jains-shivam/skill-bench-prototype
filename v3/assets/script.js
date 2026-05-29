/* Skill Bench prototype - shared JS.
   Vanilla. No frameworks. No fetches. Just enough to make the prototype
   feel like a real app. */

window.SB = (function () {

  /* ------------------------------ helpers ------------------------------ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      }
    }
    if (children) {
      for (const c of [].concat(children)) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      }
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Persisted role across pages (so the nav stays consistent). */
  function getRole() {
    return localStorage.getItem('sb-role') || 'prompter';
  }
  function setRole(role) {
    localStorage.setItem('sb-role', role);
  }
  function clearRole() {
    localStorage.removeItem('sb-role');
  }

  /* Path helper. Returns the relative path to the prototype root from the
     current page. We detect whether we are in one of the known subfolders
     instead of looking for a specific parent folder name, so the prototype
     keeps working when the folder is renamed or moved (e.g. ~/Downloads/...). */
  function basePath() {
    if (/\/(trainer|tester|reviewer|evaluator|admin|pm|projects|batches|delivery-batches)\//.test(location.pathname)) return '..';
    return '.';
  }

  /* ------------------------------ icons ------------------------------ */
  /* Heroicons (inline SVG, MIT). Keep small and consistent. */
  const ICONS = {
    logo:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    plus:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>',
    check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>',
    x:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    chev:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>',
    search:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    filter:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
    code:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
    globe:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    terminal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="m4 17 6-6-6-6M12 19h8"/></svg>',
    chart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="M3 3v18h18M7 14l4-4 4 4 5-5"/></svg>',
    bug:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><rect x="6" y="8" width="12" height="12" rx="6"/><path d="M12 8v12M8 12h8M5 7l2 2M19 7l-2 2M5 17l2-2M19 17l-2-2"/></svg>',
    blank:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    play:    '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>',
    folder:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    file:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    upload:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17l-1.9-5.1L4.4 10l5.7-1.3z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    menu:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    book:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    edit:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  };
  function icon(name) { return ICONS[name] || ''; }

  /* ------------------------------ nav ------------------------------ */

  const NAV_ITEMS = {
    pm: [
      { label: 'Projects',        href: 'projects/list.html' },
      { label: 'Delivery Batches', href: '#' },
      { label: 'Reports',          href: '#' },
    ],
    prompter: [
      { label: 'My Prompts',  href: 'trainer/dashboard.html' },
      { label: 'Projects',    href: 'projects/list.html' },
      { label: 'Skills library', href: '#' },
      { label: 'Help',           href: '#' },
    ],
    tester: [
      { label: 'Test Queue', href: 'tester/queue.html', badge: 2 },
      { label: 'Projects',   href: 'projects/list.html' },
      { label: 'My Tests',   href: '#' },
      { label: 'Help',       href: '#' },
    ],
    reviewer: [
      { label: 'Review Queue', href: 'reviewer/queue.html', badge: 3 },
      { label: 'Projects',     href: 'projects/list.html' },
      { label: 'Help',         href: '#' },
    ],
    evaluator: [
      { label: 'Evaluations', href: 'evaluator/home.html' },
      { label: 'Datasets',    href: '#' },
      { label: 'Help',        href: '#' },
    ],
    admin: [
      { label: 'Users',     href: 'admin/dashboard.html' },
      { label: 'Skills',    href: 'admin/skills.html' },
      { label: 'Projects',  href: 'projects/list.html' },
      { label: 'Usage',     href: '#' },
    ],
  };

  function renderNav(opts) {
    opts = opts || {};
    const role = opts.role || getRole();
    const user = SBData.users[role];
    if (!user) return;
    const items = NAV_ITEMS[role] || [];
    const base = basePath();

    const mount = $('#app-nav');
    if (!mount) return;

    const ws = SBData.workspaces || [];
    const curWs = (ws.find(w => w.current) || ws[0] || { label: 'No workspace' });

    const navHtml = `
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div class="mx-auto max-w-7xl px-6 h-14 flex items-center gap-4">
          <a href="${base}/index.html" class="flex items-center gap-2 text-slate-900 font-semibold">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-indigo-600 text-white">${icon('logo')}</span>
            <span>Skill Bench</span>
            <span class="ml-1 text-xs font-medium text-fuchsia-700 bg-fuchsia-100 px-1.5 py-0.5 rounded">V3</span>
          </a>

          <div class="hidden md:flex items-center gap-2 pl-3 ml-1 border-l border-slate-200">
            <button id="ws-switcher" class="group inline-flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-sm">
              <span class="w-2 h-2 rounded-full bg-violet-500"></span>
              <span class="font-medium text-slate-900 max-w-[10rem] truncate">${escapeHtml(curWs.label)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 text-slate-400 group-hover:text-slate-700"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>

          <nav class="hidden md:flex items-center gap-1 ml-2">
            ${items.map(i => `
              <a href="${base}/${i.href}" class="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md inline-flex items-center gap-2">
                ${i.label}
                ${i.badge ? `<span class="text-xs bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-0.5">${i.badge}</span>` : ''}
              </a>
            `).join('')}
          </nav>
          <div class="ml-auto flex items-center gap-3">
            <a href="${base}/../index.html" class="text-xs px-2 py-1 rounded bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 font-medium">&larr; Compare versions</a>
            <a href="${base}/index.html" class="text-sm text-slate-500 hover:text-slate-900">Switch role</a>
            <div class="flex items-center gap-2">
              <div class="avatar">${user.initials}</div>
              <div class="hidden sm:block leading-tight">
                <div class="text-sm font-medium text-slate-900">${user.name}</div>
                <div class="text-xs text-slate-500">${user.role}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace switcher dropdown (toggled) -->
        <div id="ws-menu" hidden class="absolute z-40 mt-1 ml-6 bg-white border border-slate-200 rounded-lg shadow-lg w-72 overflow-hidden">
          <div class="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">Switch project / batch</div>
          ${ws.map(w => `
            <a href="${base}/projects/detail.html?project=${encodeURIComponent(w.projectSlug)}&batch=${encodeURIComponent(w.batchSlug || '')}"
               class="block px-3 py-2 text-sm hover:bg-slate-50 ${w.current ? 'bg-fuchsia-50' : ''}">
              <div class="font-medium text-slate-900 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${w.current ? 'bg-fuchsia-500' : 'bg-slate-300'}"></span>
                ${escapeHtml(w.label)}
              </div>
              <div class="text-xs text-slate-500 ml-4">${escapeHtml(w.subtitle || '')}</div>
            </a>
          `).join('')}
          <a href="${base}/projects/list.html" class="block px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 border-t border-slate-200">View all projects &rarr;</a>
        </div>
      </header>`;
    mount.outerHTML = navHtml;

    /* Wire up workspace switcher */
    const swBtn = document.getElementById('ws-switcher');
    const swMenu = document.getElementById('ws-menu');
    if (swBtn && swMenu) {
      swBtn.addEventListener('click', (e) => { e.stopPropagation(); swMenu.hasAttribute('hidden') ? swMenu.removeAttribute('hidden') : swMenu.setAttribute('hidden', ''); });
      document.addEventListener('click', () => swMenu.setAttribute('hidden', ''));
    }
  }

  /* ------------------------------ toasts ------------------------------ */

  function ensureToastContainer() {
    let c = $('#toast-container');
    if (!c) {
      c = el('div', { id: 'toast-container' });
      document.body.appendChild(c);
    }
    return c;
  }
  function toast(message, kind) {
    const c = ensureToastContainer();
    const t = el('div', { class: 'toast ' + (kind || ''), html: `<div>${message}</div>` });
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  }

  /* ------------------------------ modal ------------------------------ */

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.removeAttribute('hidden');
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.setAttribute('hidden', '');
  }

  /* ------------------------------ wizard stepper ------------------------------ */

  const WIZARD_STEPS = {
    prompter: [
      { id: 1, label: 'Template',    href: 'wizard-1-template.html' },
      { id: 2, label: 'Brief',       href: 'wizard-2-brief.html' },
      { id: 3, label: 'Skills',      href: 'wizard-3-skills.html' },
      { id: 4, label: 'Instruction', href: 'wizard-4-instruction.html' },
      { id: 5, label: 'Solution',    href: 'wizard-5-solution.html' },
      { id: 6, label: 'Verifiers',   href: 'wizard-6-verifiers.html' },
      { id: 7, label: 'Preview',     href: 'wizard-7-preview.html' },
    ],
    tester: [
      { id: 1, label: 'Environment', href: 'wizard-1-environment.html' },
      { id: 2, label: 'Solution',    href: 'wizard-2-solution.html' },
      { id: 3, label: 'Criteria',    href: 'wizard-3-criteria.html' },
      { id: 4, label: 'Oracle test', href: 'wizard-4-oracle.html' },
      { id: 5, label: 'Preview',     href: 'wizard-5-preview.html' },
    ],
  };

  function renderWizardStepper(activeStep, role) {
    const mount = $('#wizard-stepper');
    if (!mount) return;
    const steps = WIZARD_STEPS[role || 'prompter'];
    if (!steps) return;
    const parts = [];
    steps.forEach((s, i) => {
      const state = s.id < activeStep ? 'done' : (s.id === activeStep ? 'active' : '');
      parts.push(`
        <a href="${s.href}" class="flex flex-col items-center min-w-0">
          <div class="step-dot ${state}"><span>${s.id}</span></div>
          <div class="mt-1.5 text-xs font-medium ${state ? 'text-slate-900' : 'text-slate-500'}">${s.label}</div>
        </a>`);
      if (i < steps.length - 1) {
        const lineState = s.id < activeStep ? 'done' : '';
        parts.push(`<div class="step-line ${lineState} mt-3"></div>`);
      }
    });
    mount.innerHTML = `
      <div class="flex items-start max-w-3xl mx-auto px-4">${parts.join('')}</div>
    `;
  }

  /* ------------------------------ oracle simulator ------------------------------ */

  function runOracle(opts) {
    opts = opts || {};
    const fail = opts.fail === true;
    const onProgress = opts.onProgress || function(){};
    const onComplete = opts.onComplete || function(){};
    const stages = [
      { label: 'Building environment from Dockerfile',     ms: 2000 },
      { label: 'Running solution/solve.sh',                ms: 1500 },
      { label: 'Running verifier (tests/test.sh)',         ms: 1500 },
      { label: 'Parsing /logs/verifier/reward.json',       ms:  700 },
    ];
    let i = 0;
    const totalMs = stages.reduce((a, s) => a + s.ms, 0);
    let elapsed = 0;
    function nextStage() {
      if (i >= stages.length) {
        const reward = fail ? 0.67 : 1.0;
        onComplete({
          reward,
          pass: !fail,
          rewards: fail
            ? { Structure: 1.0, Correctness: 0.0, Quality: 1.0 }
            : { Structure: 1.0, Correctness: 1.0, Quality: 1.0 },
        });
        return;
      }
      const s = stages[i];
      onProgress({ stage: s.label, stageIndex: i, totalStages: stages.length, percent: Math.round(100 * elapsed / totalMs), state: 'running' });
      setTimeout(() => {
        elapsed += s.ms;
        onProgress({ stage: s.label, stageIndex: i, totalStages: stages.length, percent: Math.round(100 * elapsed / totalMs), state: 'done' });
        i += 1;
        nextStage();
      }, s.ms);
    }
    nextStage();
  }

  /* ------------------------------ live job simulator ------------------------------ */

  function startLiveJobTicker(opts) {
    opts = opts || {};
    const tickMs = opts.tickMs || 2000;
    const onTick = opts.onTick || function(){};
    let progress = opts.startProgress || 0.66;
    let pass = Object.assign({ 'claude-code': { trials: 141, passed: 110 }, 'cursor-cli': { trials: 92, passed: 56 } }, opts.pass || {});
    function tick() {
      progress = Math.min(1.0, progress + 0.01 + Math.random() * 0.01);
      for (const k of Object.keys(pass)) {
        const inc = Math.floor(Math.random() * 3);
        pass[k].trials += inc;
        pass[k].passed += Math.floor(inc * (0.6 + Math.random() * 0.3));
      }
      onTick({ progress, pass });
      if (progress < 1.0) setTimeout(tick, tickMs);
    }
    setTimeout(tick, tickMs);
  }

  /* ------------------------------ Harbor preview ------------------------------ */
  /* Renders a folder-tree on the left and a viewer on the right that lets
     anyone click through the task as it would appear in the Harbor registry. */

  const OWNER_BADGE = {
    prompter: { label: 'Prompter', cls: 'bg-indigo-100 text-indigo-700' },
    tester:   { label: 'Tester',   cls: 'bg-emerald-100 text-emerald-700' },
    shared:   { label: 'Auto',     cls: 'bg-slate-100 text-slate-600' },
  };

  /* Default edit destinations per role + file owner.
     The Harbor preview uses these to wire the "Edit" button on owned files. */
  const EDIT_TARGETS = {
    prompter: {
      'task.toml':                                 'wizard-2-brief.html',
      'environment/skills/':                       'wizard-3-skills.html',
      'instruction.md':                            'wizard-4-instruction.html',
      'solution/':                                 'wizard-5-solution.html',
      'tests/verifiers.md':                        'wizard-6-verifiers.html',
    },
    tester: {
      'environment/Dockerfile':                    'wizard-1-environment.html',
      'task.toml':                                 'wizard-1-environment.html',
      'solution/':                                 'wizard-2-solution.html',
      'tests/test.sh':                             'wizard-3-criteria.html',
      'tests/rewardkit.yaml':                      'wizard-3-criteria.html',
    },
  };

  function editTargetFor(role, path) {
    const map = EDIT_TARGETS[role] || {};
    if (map[path]) return map[path];
    /* Match folder prefixes (skills/, solution/) */
    for (const k of Object.keys(map)) {
      if (k.endsWith('/') && path.startsWith(k)) return map[k];
    }
    return null;
  }

  function renderHarborPreview(mount, task, opts) {
    opts = opts || {};
    if (typeof mount === 'string') mount = $('#' + mount);
    if (!mount) return;
    const files = SBData.harborFiles(task);
    const onlyFiles = files.filter(f => f.type === 'file');

    const role = opts.role || null;             /* current viewer role */
    const showAffordance = !!role;              /* render "Edit" / "Read-only" labels */

    const TREE = files.map(f => {
      const depth = f.path.split('/').length - 1;
      return Object.assign({}, f, { depth });
    });

    const taskName = task.name || 'my-org/task';
    const initialPath = opts.initial || 'task.toml';

    mount.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-[18rem_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div class="bg-slate-50 px-3 py-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">Harbor folder</div>
          <div class="text-sm font-mono text-slate-900 mb-2 px-1">${escapeHtml(taskName)}/</div>
          <ul id="hp-tree" class="space-y-0.5 text-sm font-mono"></ul>
          <div class="mt-3 px-1 text-xs text-slate-500">
            <div class="font-semibold uppercase tracking-wider mb-1">Authored by</div>
            <div class="flex flex-wrap gap-1.5">
              <span class="text-[10px] px-1.5 py-0.5 rounded ${OWNER_BADGE.prompter.cls}">${OWNER_BADGE.prompter.label}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded ${OWNER_BADGE.tester.cls}">${OWNER_BADGE.tester.label}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded ${OWNER_BADGE.shared.cls}">${OWNER_BADGE.shared.label}</span>
            </div>
            ${role ? `<div class="mt-2 text-[11px]">Viewing as <b class="uppercase">${role}</b>. Files you own show <b>Edit</b>; the rest are read-only.</div>` : ''}
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white">
            <span class="text-slate-400">${icon('file')}</span>
            <code id="hp-current-path" class="text-sm text-slate-700"></code>
            <span id="hp-current-owner" class="ml-auto text-[10px] px-1.5 py-0.5 rounded"></span>
            <a id="hp-edit-link" href="#" class="hidden text-xs px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium inline-flex items-center gap-1">
              ${icon('edit')}
              <span>Edit</span>
            </a>
            <span id="hp-readonly-tag" class="hidden text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Read-only preview</span>
          </div>
          <pre id="hp-current-content" class="code-block scroll-y m-0 rounded-none flex-1" style="max-height: 32rem; min-height: 16rem;"></pre>
        </div>
      </div>
    `;

    const treeEl = $('#hp-tree', mount);
    TREE.forEach(node => {
      const li = document.createElement('li');
      li.style.paddingLeft = (node.depth * 0.75) + 'rem';
      if (node.type === 'dir') {
        li.innerHTML = `<span class="text-slate-500 inline-flex items-center gap-1.5">${icon('folder')}<span>${escapeHtml(node.label)}</span></span>`;
      } else {
        const owner = OWNER_BADGE[node.owner] || OWNER_BADGE.shared;
        const isMine = role && (node.owner === role || node.owner === 'shared' || !!editTargetFor(role, node.path));
        const tag = showAffordance
          ? (isMine
              ? `<span class="ml-auto text-[9px] uppercase tracking-wider px-1 rounded bg-indigo-600 text-white">Edit</span>`
              : `<span class="ml-auto text-[9px] uppercase tracking-wider px-1 rounded ${owner.cls}">${owner.label}</span>`)
          : `<span class="ml-auto text-[9px] uppercase tracking-wider px-1 rounded ${owner.cls}">${owner.label}</span>`;
        li.innerHTML = `
          <a href="#" data-path="${escapeHtml(node.path)}"
             class="hp-file inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-700 hover:bg-white rounded px-1 py-0.5 w-full">
            ${icon('file')}
            <span>${escapeHtml(node.label)}</span>
            ${tag}
          </a>`;
      }
      treeEl.appendChild(li);
    });

    function show(path) {
      const f = onlyFiles.find(x => x.path === path) || onlyFiles[0];
      if (!f) return;
      $('#hp-current-path', mount).textContent = (taskName + '/' + f.path);
      $('#hp-current-content', mount).textContent = f.content;
      const owner = OWNER_BADGE[f.owner] || OWNER_BADGE.shared;
      const ownerEl = $('#hp-current-owner', mount);
      ownerEl.textContent = owner.label;
      ownerEl.className = 'ml-auto text-[10px] px-1.5 py-0.5 rounded ' + owner.cls;

      /* Wire Edit / Read-only depending on the viewer's role and the file owner. */
      const editLink = $('#hp-edit-link', mount);
      const readTag  = $('#hp-readonly-tag', mount);
      editLink.classList.add('hidden');
      readTag.classList.add('hidden');
      if (showAffordance) {
        const isMine = f.owner === role || f.owner === 'shared' || !!editTargetFor(role, f.path);
        if (isMine) {
          const dest = editTargetFor(role, f.path);
          if (dest) {
            editLink.href = dest;
            editLink.classList.remove('hidden');
          }
        } else {
          readTag.classList.remove('hidden');
        }
      }

      $$('a.hp-file', mount).forEach(a => {
        a.classList.toggle('bg-white', a.dataset.path === f.path);
        a.classList.toggle('text-indigo-700', a.dataset.path === f.path);
        a.classList.toggle('font-semibold', a.dataset.path === f.path);
      });
    }
    $$('a.hp-file', mount).forEach(a => {
      a.addEventListener('click', (e) => { e.preventDefault(); show(a.dataset.path); });
    });
    show(initialPath);
  }

  /* ------------------------------ exports ------------------------------ */

  return {
    $, $$, el, icon, escapeHtml,
    getRole, setRole, clearRole,
    renderNav, renderWizardStepper,
    toast, openModal, closeModal,
    runOracle, startLiveJobTicker,
    renderHarborPreview,
  };
})();
