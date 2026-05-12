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

  /* Persisted role across pages (so the nav stays consistent). */
  function getRole() {
    return localStorage.getItem('sb-role') || 'trainer';
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
    if (/\/(trainer|reviewer|evaluator|admin)\//.test(location.pathname)) return '..';
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
  };
  function icon(name) { return ICONS[name] || ''; }

  /* ------------------------------ nav ------------------------------ */

  const NAV_ITEMS = {
    trainer: [
      { label: 'My Tasks',  href: 'trainer/dashboard.html' },
      { label: 'Datasets',  href: '#' },
      { label: 'Help',      href: '#' },
    ],
    reviewer: [
      { label: 'Review Queue', href: 'reviewer/queue.html', badge: 3 },
      { label: 'Help',         href: '#' },
    ],
    evaluator: [
      { label: 'Evaluations', href: 'evaluator/home.html' },
      { label: 'Datasets',    href: '#' },
      { label: 'Help',        href: '#' },
    ],
    admin: [
      { label: 'Users',     href: 'admin/dashboard.html' },
      { label: 'Templates', href: '#' },
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

    const navHtml = `
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div class="mx-auto max-w-7xl px-6 h-14 flex items-center gap-6">
          <a href="${base}/index.html" class="flex items-center gap-2 text-slate-900 font-semibold">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-indigo-600 text-white">${icon('logo')}</span>
            <span>Skill Bench</span>
            <span class="ml-1 text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">prototype</span>
          </a>
          <nav class="hidden md:flex items-center gap-1 ml-2">
            ${items.map(i => `
              <a href="${base}/${i.href}" class="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md inline-flex items-center gap-2">
                ${i.label}
                ${i.badge ? `<span class="text-xs bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-0.5">${i.badge}</span>` : ''}
              </a>
            `).join('')}
          </nav>
          <div class="ml-auto flex items-center gap-3">
            <a href="${base}/../index.html" class="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">&larr; Compare versions</a>
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
      </header>`;
    mount.outerHTML = navHtml;
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

  const WIZARD_STEPS = [
    { id: 1, label: 'Template',    href: 'wizard-1-template.html' },
    { id: 2, label: 'Brief',       href: 'wizard-2-brief.html' },
    { id: 3, label: 'Instruction', href: 'wizard-3-instruction.html' },
    { id: 4, label: 'Environment', href: 'wizard-4-environment.html' },
    { id: 5, label: 'Criteria',    href: 'wizard-5-criteria.html' },
    { id: 6, label: 'Solution',    href: 'wizard-6-solution.html' },
    { id: 7, label: 'Test',        href: 'wizard-7-test.html' },
  ];

  function renderWizardStepper(activeStep) {
    const mount = $('#wizard-stepper');
    if (!mount) return;
    const parts = [];
    WIZARD_STEPS.forEach((s, i) => {
      const state = s.id < activeStep ? 'done' : (s.id === activeStep ? 'active' : '');
      parts.push(`
        <a href="${s.href}" class="flex flex-col items-center min-w-0">
          <div class="step-dot ${state}"><span>${s.id}</span></div>
          <div class="mt-1.5 text-xs font-medium ${state ? 'text-slate-900' : 'text-slate-500'}">${s.label}</div>
        </a>`);
      if (i < WIZARD_STEPS.length - 1) {
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

  /* ------------------------------ exports ------------------------------ */

  return {
    $, $$, el, icon,
    getRole, setRole, clearRole,
    renderNav, renderWizardStepper,
    toast, openModal, closeModal,
    runOracle, startLiveJobTicker,
  };
})();
