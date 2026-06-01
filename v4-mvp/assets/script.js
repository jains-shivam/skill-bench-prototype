/* Skill Bench MVP - Shared UI logic.
   5 roles: prompter, domainReviewer, tester, reviewer, admin */
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

  /* ───── Role management ───── */
  const ROLE_KEY = 'sb-mvp-role';
  function getRole() { return localStorage.getItem(ROLE_KEY) || 'prompter'; }
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

  /* ───── Navigation ───── */
  function basePath() {
    if (/\/(prompter|tester|reviewer|admin|domain-reviewer)\//.test(location.pathname)) return '..';
    return '.';
  }

  const ROLE_ACCENT = {
    prompter:       { color: 'indigo', step: 'indigo' },
    domainReviewer: { color: 'violet', step: 'violet' },
    tester:         { color: 'emerald', step: 'emerald' },
    reviewer:       { color: 'amber', step: 'amber' },
    admin:          { color: 'slate', step: 'slate' },
  };

  const NAV_ITEMS = {
    prompter:       [{ label: 'My Tasks', href: 'prompter/dashboard.html' }],
    domainReviewer: [{ label: 'Review Queue', href: 'domain-reviewer/queue.html' }],
    tester:         [{ label: 'Test Queue', href: 'tester/queue.html' }],
    reviewer:       [{ label: 'Review Queue', href: 'reviewer/queue.html' }],
    admin:          [{ label: 'Dashboard', href: 'admin/dashboard.html' }],
  };

  function renderNav() {
    const mount = document.getElementById('app-nav');
    if (!mount) return;
    const role = getRole();
    const user = SBData.users[role] || SBData.users.prompter;
    const accent = ROLE_ACCENT[role] || ROLE_ACCENT.prompter;
    const base = basePath();
    const items = NAV_ITEMS[role] || [];
    const navLinks = items.map(n => `<a href="${base}/${n.href}" class="text-sm text-slate-300 hover:text-white">${n.label}</a>`).join('');
    const badge = role === 'domainReviewer' ? SBData.tasks.filter(t => t.status === 'domain-review').length : (role === 'tester' ? SBData.tasks.filter(t => t.status === 'with-tester' && !t.tester).length : 0);
    mount.innerHTML = `
      <nav class="bg-slate-900 text-white px-6 py-3">
        <div class="mx-auto max-w-7xl flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a href="${base}/index.html" class="flex items-center gap-2 font-semibold">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded bg-indigo-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg></span>
              Skill Bench
            </a>
            <span class="mvp-badge">MVP</span>
            ${navLinks}
            ${badge ? `<span class="text-xs bg-emerald-500 text-white rounded-full px-1.5 py-0.5">${badge}</span>` : ''}
          </div>
          <div class="flex items-center gap-3">
            <a href="${base}/index.html" class="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600">Switch role</a>
            <div class="flex items-center gap-2">
              <div class="avatar" style="width:1.75rem;height:1.75rem;font-size:0.65rem">${user.initials}</div>
              <div class="text-xs"><div class="font-medium">${escapeHtml(user.name)}</div><div class="text-slate-400">${escapeHtml(user.role)}</div></div>
            </div>
          </div>
        </div>
      </nav>`;
  }

  /* ───── Toasts ───── */
  function toast(msg, type) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = el('div', 'toast ' + (type || ''), escapeHtml(msg));
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
      { id: 2, label: 'Environment', href: 'wizard-2-environment.html' },
      { id: 3, label: 'Solution',    href: 'wizard-3-solution.html' },
      { id: 4, label: 'Tests',       href: 'wizard-4-tests.html' },
      { id: 5, label: 'Oracle',      href: 'wizard-5-oracle.html' },
    ],
  };

  function renderWizardStepper(activeStep, role) {
    const mount = document.getElementById('wizard-stepper');
    if (!mount) return;
    role = role || getRole();
    const steps = WIZARD_STEPS[role];
    if (!steps) return;
    const accent = ROLE_ACCENT[role] || ROLE_ACCENT.prompter;
    const colorMap = { indigo: '#4f46e5', emerald: '#059669', amber: '#f59e0b', violet: '#7c3aed', slate: '#475569' };
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
    const existing = SBData.tasks.find(x => x.id && getWizardTaskId() === x.id);
    if (existing) {
      Object.assign(existing, {
        name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
        instructionMd: t.instructionMd, verifiers: t.verifiers || [], goldenSolution: t.goldenSolution || '',
        selectedSkills: t.selectedSkills || [], attachments: t.attachments || [],
        status: 'domain-review', domainReviewer: null, updatedAt: now,
        history: (existing.history || []).concat([{ when: now, who: SBData.users.prompter.name, event: 'Submitted for domain review' }]),
      });
      return existing;
    }
    const id = 'tnew_' + Date.now();
    const row = {
      id, name: t.name, description: t.description, domain: t.domain, difficulty: t.difficulty,
      status: 'domain-review', prompter: SBData.users.prompter, domainReviewer: null, tester: null, templateId: null,
      updatedAt: now, instructionMd: t.instructionMd, verifiers: t.verifiers || [],
      goldenSolution: t.goldenSolution || '', selectedSkills: t.selectedSkills || [],
      attachments: t.attachments || [], dockerfile: '', solveSh: '', testSh: '',
      oraclePassed: false, history: [
        { when: now, who: SBData.users.prompter.name, event: 'Created draft' },
        { when: now, who: SBData.users.prompter.name, event: 'Submitted for domain review' },
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
    t.tester = SBData.users.tester;
    t.updatedAt = 'just now';
    t.history.push({ when: 'just now', who: SBData.users.tester.name, event: 'Picked up from tester queue' });
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
    getRole, setRole, clearRole,
    getWizardTaskId, setWizardTaskId, loadWizardTask, getWizardTaskFromSession, saveWizardTaskToSession,
    renderNav, renderWizardStepper, toast,
    runOracle, runMockModel, renderHarborPreview, renderTemplatePicker, renderSkillsPicker,
    openModal, closeModal, renderRequestChangesModal,
    submitPrompterToDomainReview, domainReviewerApprove, domainReviewerReject,
    pickUpTask, submitTesterToReview,
  };
})();
