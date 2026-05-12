# Skill Bench - Click-through Prototype

A no-backend, no-install HTML prototype of the **Skill Bench** platform. Designed to share with stakeholders for visual sign-off before the real build begins.

> Source of truth for the build: see the design + build plans in `.cursor/plans/`.

---

## How to view

1. Make sure you are online the first time (Tailwind and the Inter font load from a CDN).
2. Open `prototype/index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
3. Pick a role on the landing page to start exploring.
4. Use the **Switch role** link in the top-right at any time to return to the landing page.

That is it. No `npm install`, no Python server.

> If file URLs are restricted by your browser, you can also run `python3 -m http.server 8000` from the `prototype/` directory and visit <http://localhost:8000/>. The prototype was designed to work over `file://` though.

---

## What the prototype covers

18 screens across 4 personas. Each persona has its own coloured nav.

```
prototype/
  index.html                          login / role picker
  trainer/
    dashboard.html                    My Tasks list with status pills
    wizard-1-template.html            Step 1 - pick a template
    wizard-2-brief.html               Step 2 - name, difficulty, keywords
    wizard-3-instruction.html         Step 3 - markdown editor + live preview
    wizard-4-environment.html         Step 4 - visual env builder (no Dockerfile)
    wizard-5-criteria.html            Step 5 - grading criteria builder + modal
    wizard-6-solution.html            Step 6 - upload / in-browser editor / AI-generate
    wizard-7-test.html                Step 7 - Oracle simulator (PASS / FAIL)
    task-detail.html                  Read-only task view
  reviewer/
    queue.html                        Pending reviews
    workspace.html                    Tabbed review screen + comments + decisions
  evaluator/
    home.html                         Past + active jobs, KPI cards
    new-job.html                      Configure a new evaluation
    live-job.html                     Live progress, leaderboard, sandbox grid
    comparison.html                   Side-by-side agent comparison
    trial-detail.html                 Trajectory viewer + reward breakdown
  admin/
    dashboard.html                    Users, templates, model providers, quotas
  assets/
    style.css                         design tokens + a few component classes
    script.js                         shared JS (nav, modals, simulators)
    data.js                           hardcoded mock data
```

---

## Recommended demo script (~6 minutes)

Use this when walking through the prototype with the team.

### 1. Land on `index.html` (~30s)

- Point out the four personas. Click **Continue as Trainer**.

### 2. Trainer dashboard (~30s)

- 5 sample tasks with varied statuses: Draft, In Review, Changes Requested, Approved, Published.
- Click **Create Task**.

### 3. Wizard, steps 1 through 7 (~3 min)

- **Step 1 Template**: pick **Python Script**.
- **Step 2 Brief**: name is pre-filled. Add a keyword chip to show how it works.
- **Step 3 Instruction**: type one line in the editor to show the live preview update.
- **Step 4 Environment**: highlight the package picker and the resource sliders. Open the **Advanced** disclosure to show the auto-generated Dockerfile - the trainer never has to touch it.
- **Step 5 Criteria**: open **+ Add criterion** on the Structure card. Show that the picker is grouped by Files / Commands / Data / AI Judge. Add one. Note the indigo summary card at the bottom updating.
- **Step 6 Solution**: click each of the three tabs - Upload, In-browser editor, Generate with AI.
- **Step 7 Test**: click **Run Oracle Test**. Watch the simulated progress run for ~6 seconds and the PASS banner appear. Click **Submit for review**.
  - To demo the failure path: click **Demo: run with FAIL outcome** instead.

### 4. Reviewer flow (~1 min)

- Use **Switch role** -> **Continue as Reviewer**.
- Open the top item in the queue (`text-stats-pipeline`).
- Click through the **Instruction / Environment / Criteria / Solution / Oracle log** tabs.
- Add a comment in the right panel - it appears instantly.
- Click **Approve and publish** - the toast announces it was published to the Harbor registry.

### 5. Evaluator flow (~1 min)

- Use **Switch role** -> **Continue as Evaluator**.
- Open the running job (`skill-bench-v1 x 2 agents`).
- Show the live progress bar, the leaderboard updating every 2 seconds, and the recent-trials feed.
- Click **View comparison**.
- Click any cell in the comparison table to drill into a single trial's trajectory.

### 6. Optional - Admin (~20s)

- Use **Switch role** -> **Continue as Admin**.
- Show the user list, template library, provider keys, and usage quotas.

---

## What is mocked

| Item | In the prototype | In the real build |
|------|------------------|-------------------|
| Authentication | Click a role to navigate | OAuth / SSO via Harbor auth |
| Task storage | `assets/data.js` | Postgres + blob storage |
| Form -> Harbor task compilation | Skipped | Real "Task Compiler" service |
| Oracle test | 6s simulated progress | Real Daytona sandbox via `harbor run` |
| Live evaluation | Setinterval tick | Websocket stream from running trials |
| Agent trajectories | One hardcoded example | Real ATIF trajectories from Harbor |
| Cost estimates | Static linear formula | Estimator based on historical runs |

---

## Browser support

Tested on the latest Chrome (124+) and Safari (17+). The prototype uses no build step or transpilation - just modern HTML, vanilla JS, and Tailwind via the play CDN.

---

## What to do after the team reviews

1. **Approved as-is** -> begin Phase 1 of the platform design plan.
2. **Approved with changes** -> tweak the prototype (cheap, no real code), re-share.
3. **Major direction change** -> rev the design plan first, then update the prototype.

If you have feedback while clicking through, jot it on the slide deck or in a doc - we can iterate on this prototype quickly.
