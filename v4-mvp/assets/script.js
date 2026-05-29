/* Skill Bench MVP - shared JS (relay model). */

window.SB = (function () {

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
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const ROLE_KEY = 'sb-mvp-role';
  function getRole() { return localStorage.getItem(ROLE_KEY) || 'trainer'; }
  function setRole(role) { localStorage.setItem(ROLE_KEY, role); }
  function clearRole() { localStorage.removeItem(ROLE_KEY); }

  const WIZARD_TASK_KEY = 'sb-mvp-wizard-task-id';
  const WIZARD_DATA_KEY = 'sb-mvp-wizard-data';

  function getWizardTaskId() {
    return new URLSearchParams(location.search).get('id') || sessionStorage.getItem(WIZARD_TASK_KEY) || null;
  }
  function setWizardTaskId(id) {
    if (id) sessionStorage.setItem(WIZARD_TASK_KEY, id);
    else {
      sessionStorage.removeItem(WIZARD_TASK_KEY);
      sessionStorage.removeItem(WIZARD_DATA_KEY);
    }
  }

  function loadWizardTask() {
    const saved = sessionStorage.getItem(WIZARD_DATA_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    const id = getWizardTaskId();
    if (id) {
      const t = SBData.getTaskById(id);
      if (t) return JSON.parse(JSON.stringify(t));
    }
    return JSON.parse(JSON.stringify(SBData.wizardTask));
  }

  function saveWizardTaskToSession(t) {
    window.__sbWizardTask = t;
    try { sessionStorage.setItem(WIZARD_DATA_KEY, JSON.stringify(t)); } catch(e) {}
  }
  function getWizardTaskFromSession() {
    if (window.__sbWizardTask) return window.__sbWizardTask;
    const id = getWizardTaskId();
    if (id) {
      const stored = SBData.getTaskById(id);
      if (stored) {
        window.__sbWizardTask = JSON.parse(JSON.stringify(stored));
        saveWizardTaskToSession(window.__sbWizardTask);
        return window.__sbWizardTask;
      }
    }
    window.__sbWizardTask = loadWizardTask();
    return window.__sbWizardTask;
  }

  function basePath() {
    if (/\/(trainer|tester|reviewer|admin)\//.test(location.pathname)) return '..';
    return '.';
  }

  const ICONS = {
    logo:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    file:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    folder:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    upload:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
    play:    '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  };
  function icon(name) { return ICONS[name] || ''; }

  const ROLE_ACCENT = {
    trainer:  { nav: 'indigo',  step: 'indigo' },
    tester:   { nav: 'emerald', step: 'emerald' },
    reviewer: { nav: 'amber',   step: 'amber' },
    admin:    { nav: 'slate',   step: 'slate' },
  };

  const NAV_ITEMS = {
    trainer:  [{ label: 'My Tasks', href: 'trainer/dashboard.html' }],
    tester:   [{ label: 'Test Queue', href: 'tester/queue.html', badge: 1 }],
    reviewer: [{ label: 'Review Queue', href: 'reviewer/queue.html', badge: 1 }],
    admin:    [{ label: 'Dashboard', href: 'admin/dashboard.html' }],
  };

  function renderNav() {
    const role = getRole();
    const user = SBData.users[role];
    if (!user) return;
    const items = NAV_ITEMS[role] || [];
    const base = basePath();
    const mount = $('#app-nav');
    if (!mount) return;

    mount.outerHTML = `
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div class="mx-auto max-w-7xl px-6 h-14 flex items-center gap-4">
          <a href="${base}/index.html" class="flex items-center gap-2 text-slate-900 font-semibold">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-indigo-600 text-white">${icon('logo')}</span>
            <span>Skill Bench</span>
            <span class="mvp-badge ml-1">MVP</span>
          </a>
          <nav class="hidden md:flex items-center gap-1 ml-4">
            ${items.map(i => `
              <a href="${base}/${i.href}" class="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md inline-flex items-center gap-2">
                ${i.label}
                ${i.badge ? `<span class="text-xs bg-indigo-100 text-indigo-700 rounded-full px-1.5 py-0.5">${i.badge}</span>` : ''}
              </a>`).join('')}
          </nav>
          <div class="ml-auto flex items-center gap-3">
            <a href="${base}/../index.html" class="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium">&larr; Versions</a>
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
  }

  function ensureToastContainer() {
    let c = $('#toast-container');
    if (!c) { c = el('div', { id: 'toast-container' }); document.body.appendChild(c); }
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

  const WIZARD_STEPS = {
    trainer: [
      { id: 1, label: 'Brief',       href: 'wizard-1-brief.html' },
      { id: 2, label: 'Problem',     href: 'wizard-2-instruction.html' },
      { id: 3, label: 'Criteria',    href: 'wizard-3-criteria.html' },
      { id: 4, label: 'Solution',    href: 'wizard-4-solution.html' },
      { id: 5, label: 'Submit',      href: 'wizard-5-submit.html' },
    ],
    tester: [
      { id: 1, label: 'Environment', href: 'wizard-1-environment.html' },
      { id: 2, label: 'Solution',    href: 'wizard-2-solution.html' },
      { id: 3, label: 'Tests',       href: 'wizard-3-tests.html' },
      { id: 4, label: 'Oracle',      href: 'wizard-4-oracle.html' },
    ],
  };

  function renderWizardStepper(activeStep, role) {
    const mount = $('#wizard-stepper');
    if (!mount) return;
    role = role || getRole();
    const steps = WIZARD_STEPS[role];
    if (!steps) return;
    const accent = ROLE_ACCENT[role] || ROLE_ACCENT.trainer;
    const activeCls = accent.step === 'emerald' ? 'border-emerald-600 bg-emerald-600' :
                      accent.step === 'amber' ? 'border-amber-500 bg-amber-500' : 'border-indigo-600 bg-indigo-600';
    const lineDone = accent.step === 'emerald' ? 'bg-emerald-600' : accent.step === 'amber' ? 'bg-amber-500' : 'bg-indigo-600';

    const parts = [];
    steps.forEach((s, i) => {
      const state = s.id < activeStep ? 'done' : (s.id === activeStep ? 'active' : '');
      parts.push(`
        <a href="${s.href}${getWizardTaskId() ? '?id=' + encodeURIComponent(getWizardTaskId()) : ''}" class="flex flex-col items-center min-w-0">
          <div class="step-dot ${state}" style="${state === 'active' ? '' : ''}"><span>${s.id}</span></div>
          <div class="mt-1.5 text-xs font-medium ${state ? 'text-slate-900' : 'text-slate-500'}">${s.label}</div>
        </a>`);
      if (i < steps.length - 1) {
        parts.push(`<div class="step-line ${s.id < activeStep ? 'done' : ''} mt-3" style="${s.id < activeStep ? 'background:' + (accent.step === 'emerald' ? '#059669' : accent.step === 'amber' ? '#f59e0b' : '#4f46e5') : ''}"></div>`);
      }
    });
    mount.innerHTML = `<div class="flex items-start max-w-lg mx-auto px-4">${parts.join('')}</div>`;
    /* Re-apply active color via class on mount parent role */
    mount.classList.add('stepper-' + role);
  }

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
      if (i >= stages.length) {
        onComplete({ reward: fail ? 0.5 : 1.0, pass: !fail, runtimeSec: (totalMs / 1000).toFixed(1) });
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

  function renderHarborPreview(mount, task, opts) {
    opts = opts || {};
    if (typeof mount === 'string') {
      mount = document.getElementById(mount) || $(mount);
    }
    if (!mount) return;
    const files = SBData.harborFiles(task);
    const onlyFiles = files.filter(f => f.type === 'file');
    const TREE = files.map(f => Object.assign({}, f, { depth: f.path.split('/').length - 1 }));
    const taskName = task.name || 'my-org/task';
    const initialPath = opts.initial || 'instruction.md';

    mount.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-[16rem_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div class="bg-slate-50 px-3 py-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">Harbor folder</div>
          <div class="text-sm font-mono text-slate-900 mb-2 px-1">${escapeHtml(taskName)}/</div>
          <ul id="hp-tree" class="space-y-0.5 text-sm font-mono"></ul>
          <div class="mt-3 px-1 text-xs text-slate-500">
            <span class="text-[10px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-700">Trainer</span>
            <span class="text-[10px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 ml-1">Tester</span>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white">
            <span class="text-slate-400">${icon('file')}</span>
            <code id="hp-current-path" class="text-sm text-slate-700"></code>
            <span id="hp-owner-badge" class="ml-auto text-[10px] px-1.5 py-0.5 rounded"></span>
          </div>
          <pre id="hp-current-content" class="code-block scroll-y m-0 rounded-none flex-1" style="max-height: 28rem; min-height: 12rem;"></pre>
        </div>
      </div>`;

    const treeEl = $('#hp-tree', mount);
    const ownerCls = { trainer: 'bg-indigo-100 text-indigo-700', tester: 'bg-emerald-100 text-emerald-700', shared: 'bg-slate-100 text-slate-600' };
    TREE.forEach(node => {
      const li = document.createElement('li');
      li.style.paddingLeft = (node.depth * 0.75) + 'rem';
      if (node.type === 'dir') {
        li.innerHTML = `<span class="text-slate-500 inline-flex items-center gap-1.5">${icon('folder')}<span>${escapeHtml(node.label)}</span></span>`;
      } else {
        const oc = ownerCls[node.owner] || ownerCls.shared;
        li.innerHTML = `
          <a href="#" data-path="${escapeHtml(node.path)}" class="hp-file inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-700 hover:bg-white rounded px-1 py-0.5 w-full">
            ${icon('file')}<span class="truncate">${escapeHtml(node.label)}</span>
            <span class="ml-auto text-[9px] uppercase tracking-wider px-1 rounded ${oc}">${node.owner || 'shared'}</span>
          </a>`;
      }
      treeEl.appendChild(li);
    });

    function show(path) {
      const f = onlyFiles.find(x => x.path === path) || onlyFiles[0];
      if (!f) return;
      $('#hp-current-path', mount).textContent = taskName + '/' + f.path;
      $('#hp-current-content', mount).textContent = f.content;
      const badge = $('#hp-owner-badge', mount);
      badge.textContent = f.owner || 'shared';
      badge.className = 'ml-auto text-[10px] px-1.5 py-0.5 rounded ' + (ownerCls[f.owner] || ownerCls.shared);
      $$('a.hp-file', mount).forEach(a => {
        const on = a.dataset.path === f.path;
        a.classList.toggle('bg-white', on);
        a.classList.toggle('text-indigo-700', on);
        a.classList.toggle('font-semibold', on);
      });
    }
    $$('a.hp-file', mount).forEach(a => a.addEventListener('click', e => { e.preventDefault(); show(a.dataset.path); }));
    show(initialPath);
  }

  /** Template card picker - mounts into #template-picker */
  function renderTemplatePicker(mount, selectedId, onSelect) {
    if (typeof mount === 'string') mount = document.getElementById(mount) || $(mount);
    if (!mount) return;
    const cards = SBData.templates.map(tpl => {
      const sel = tpl.id === selectedId;
      return `
        <button type="button" data-tpl="${escapeHtml(tpl.id)}"
          class="tpl-card text-left w-full p-4 rounded-lg border-2 transition-all ${sel ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-emerald-300 bg-white'}">
          <div class="font-semibold text-slate-900">${escapeHtml(tpl.name)}</div>
          <div class="text-xs text-slate-500 mt-1">${escapeHtml(tpl.desc)}</div>
          <div class="mt-2 flex flex-wrap gap-1">
            ${tpl.tags.map(tag => `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="mt-2 text-[10px] text-slate-500">${tpl.resources.cpus} CPU &middot; ${tpl.resources.memoryGB} GB RAM${tpl.resources.gpu ? ' &middot; GPU' : ''}</div>
        </button>`;
    }).join('');
    mount.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${cards}</div>`;
    mount.querySelectorAll('.tpl-card').forEach(btn => {
      btn.addEventListener('click', () => {
        mount.querySelectorAll('.tpl-card').forEach(b => {
          b.classList.remove('border-emerald-500', 'bg-emerald-50', 'ring-2', 'ring-emerald-200');
          b.classList.add('border-slate-200', 'bg-white');
        });
        btn.classList.add('border-emerald-500', 'bg-emerald-50', 'ring-2', 'ring-emerald-200');
        btn.classList.remove('border-slate-200', 'bg-white');
        if (onSelect) onSelect(btn.dataset.tpl);
      });
    });
  }

  function renderHandoffBanner(mount, task, role) {
    if (typeof mount === 'string') mount = document.getElementById(mount) || $(mount);
    if (!mount || !task) return;
    if (role === 'tester' && task.trainer) {
      mount.innerHTML = `
        <div class="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3 text-sm">
          <div class="avatar" style="width:1.75rem;height:1.75rem;font-size:0.7rem">${task.trainer.initials}</div>
          <div class="flex-1 text-slate-700">
            <b class="text-indigo-900">From Trainer: ${escapeHtml(task.trainer.name)}</b>
            <span class="text-slate-500"> &middot; domain: <b>${escapeHtml(task.domain || '—')}</b></span>
            <div class="mt-1">They submitted brief, criteria, and golden solution. You convert into environment, executable solve.sh, and tests.</div>
          </div>
          <span class="pill pill-running shrink-0">With tester</span>
        </div>`;
    } else if (role === 'trainer' && task.tester) {
      mount.innerHTML = `
        <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-slate-700">
          <b class="text-emerald-900">Tester: ${escapeHtml(task.tester.name)}</b> is handling the technical setup.
        </div>`;
    } else {
      mount.innerHTML = '';
    }
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.removeAttribute('hidden');
  }
  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.setAttribute('hidden', '');
  }

  function renderRequestChangesModal(task, onConfirm) {
    let modal = document.getElementById('modal-request-changes');
    if (!modal) {
      modal = el('div', { id: 'modal-request-changes', class: 'modal-overlay', hidden: '' });
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6" role="dialog">
        <h3 class="text-lg font-semibold text-slate-900">Request changes</h3>
        <p class="text-sm text-slate-500 mt-1">Add a comment and choose who should fix it.</p>
        <textarea id="rc-comment" rows="4" class="mt-4 w-full px-3 py-2 text-sm border border-slate-200 rounded-md" placeholder="What needs to change?"></textarea>
        <div class="mt-4">
          <div class="text-sm font-medium text-slate-700 mb-2">Send back to</div>
          <label class="flex items-center gap-2 text-sm mb-2 cursor-pointer">
            <input type="radio" name="rc-target" value="trainer" class="accent-amber-600" checked>
            <span><b>Trainer</b> — clarify problem statement or acceptance criteria</span>
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="rc-target" value="tester" class="accent-amber-600">
            <span><b>Tester</b> — fix environment, solution, or tests</span>
          </label>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" id="rc-cancel" class="px-4 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50">Cancel</button>
          <button type="button" id="rc-confirm" class="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium">Request changes</button>
        </div>
      </div>`;
    modal.removeAttribute('hidden');
    $('#rc-cancel', modal).onclick = () => closeModal('modal-request-changes');
    modal.addEventListener('click', e => { if (e.target === modal) closeModal('modal-request-changes'); });
    $('#rc-confirm', modal).onclick = () => {
      const body = $('#rc-comment', modal).value.trim();
      const target = (document.querySelector('input[name="rc-target"]:checked') || {}).value || 'trainer';
      if (!body) { toast('Please add a comment explaining what needs to change.', 'warning'); return; }
      closeModal('modal-request-changes');
      if (onConfirm) onConfirm({ body, target });
    };
  }

  function submitTrainerToTesterPool(t) {
    const now = 'just now';
    const existing = SBData.tasks.find(x => x.id && getWizardTaskId() === x.id);
    if (existing) {
      Object.assign(existing, {
        name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
        instructionMd: t.instructionMd, criteriaMd: t.criteriaMd, goldenSolution: t.goldenSolution || '',
        attachments: t.attachments || [],
        status: 'with-tester', tester: null, updatedAt: now,
        history: (existing.history || []).concat([{ when: now, who: SBData.users.trainer.name, event: 'Submitted to tester pool' }]),
      });
      return existing;
    }
    const id = 'tnew_' + Date.now();
    const row = {
      id, name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
      status: 'with-tester', trainer: SBData.users.trainer, tester: null, templateId: null,
      updatedAt: now, instructionMd: t.instructionMd, criteriaMd: t.criteriaMd,
      goldenSolution: t.goldenSolution || '',
      attachments: t.attachments || [], dockerfile: '', solveSh: '', testSh: '',
      oraclePassed: false, history: [
        { when: now, who: SBData.users.trainer.name, event: 'Created draft' },
        { when: now, who: SBData.users.trainer.name, event: 'Submitted to tester pool' },
      ], comments: [],
    };
    SBData.tasks.unshift(row);
    return row;
  }

  function pickUpTask(taskId) {
    const t = SBData.getTaskById(taskId);
    if (!t || t.status !== 'with-tester' || t.tester) return null;
    t.tester = SBData.users.tester;
    t.updatedAt = 'just now';
    t.history = (t.history || []).concat([{ when: 'just now', who: SBData.users.tester.name, event: 'Picked up from queue' }]);
    setWizardTaskId(taskId);
    return t;
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
        history: (row.history || []).concat([{ when: now, who: SBData.users.tester.name, event: 'Submitted for review (Oracle PASS)' }]),
      });
      return row;
    }
    return null;
  }

  return {
    $, $$, el, icon, escapeHtml,
    getRole, setRole, clearRole,
    getWizardTaskId, setWizardTaskId, loadWizardTask, getWizardTaskFromSession, saveWizardTaskToSession,
    renderNav, renderWizardStepper, toast,
    runOracle, renderHarborPreview, renderTemplatePicker, renderHandoffBanner,
    openModal, closeModal, renderRequestChangesModal,
    submitTrainerToTesterPool, pickUpTask, submitTesterToReview,
  };
})();
