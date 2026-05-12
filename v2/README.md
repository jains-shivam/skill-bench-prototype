# Skill Bench - Click-through Prototype

A no-backend, no-install HTML prototype of the **Skill Bench** platform - a relay
workflow that produces proper **Harbor** task packages and evaluates AI agents on
**Daytona** sandboxes.

> Source of truth for the build: see the design + build plans in `.cursor/plans/`.

---

## How to view

1. Make sure you are online the first time (Tailwind and the Inter font load from a CDN).
2. Open `prototype/index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
3. Pick a role on the landing page to start exploring.
4. Use the **Switch role** link in the top-right at any time to return to the landing page.

That is it. No `npm install`, no Python server.

> If `file://` URLs are restricted by your browser, run `python3 -m http.server 8000` from the `prototype/` directory and visit <http://localhost:8000/>.

---

## The relay model

Skill Bench splits task creation across two people so the right expert touches the right part:

```
Prompter        ->   Tester          ->   Reviewer       ->   Registry
(prompt +            (environment +       (final check        (Harbor
 solution +           grading +            and approval)        package)
 skills)              Oracle test)
```

Then anyone with the right permission can run agents on the published task:

```
Evaluator -> with-skills or without-skills (or both A/B) -> Daytona sandboxes -> results
```

---

## What the prototype covers

23 screens across 5 personas. Each persona has its own coloured nav.

```
prototype/
  index.html                            login / role picker (5 roles)
  trainer/                              PROMPTER flow (folder kept for URL stability)
    dashboard.html                      My Prompts list with status pills
    wizard-1-template.html              Step 1 - pick a template
    wizard-2-brief.html                 Step 2 - name, difficulty, keywords
    wizard-3-instruction.html           Step 3 - markdown editor + live preview
    wizard-4-skills.html                Step 4 - attach skills (library + author tabs)
    wizard-5-solution.html              Step 5 - upload / in-browser editor / AI-generate
    wizard-6-preview.html               Step 6 - Harbor folder preview + Submit for testing
    task-detail.html                    Read-only Harbor view (preview + summary + runs)
  tester/                               TESTER flow
    queue.html                          Inbox of prompts waiting for testing
    wizard-1-environment.html           Step 1 - visual env builder + Harbor preview
    wizard-2-criteria.html              Step 2 - grading criteria builder + Harbor preview
    wizard-3-oracle.html                Step 3 - Oracle simulator (PASS / FAIL)
    wizard-4-preview.html               Step 4 - full Harbor preview + Submit for review
  reviewer/
    queue.html                          Pending reviews with prompter + tester
    workspace.html                      Tabbed review screen (Harbor preview first)
  evaluator/
    home.html                           Past + active jobs, KPI cards
    new-job.html                        Configure a job - skill mode required (with / without / both A/B)
    live-job.html                       Live progress, leaderboard, sandbox grid
    comparison.html                     With/without skills side-by-side + skill lift
    trial-detail.html                   Trajectory viewer with skill indicator
  admin/
    dashboard.html                      Users, templates, model providers, quotas
  assets/
    style.css                           design tokens + a few component classes
    script.js                           shared JS (nav, modals, Harbor preview, simulators)
    data.js                             hardcoded mock data including skills library
```

---

## What is new vs the first iteration

| Feedback                                              | What changed                                                                                          |
|-------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| Allow submit after writing prompt and golden solution | Split Trainer into Prompter (prompt + skills + solution -> submit) and Tester (env + grading + Oracle) |
| Full preview in draft and review mode                 | New "Harbor preview" component on every Submit step, in Task detail, and in the Reviewer workspace    |
| Separate multi-step forms for tester and prompters    | Two independent wizards with their own steppers (6 steps for Prompter, 4 for Tester)                  |
| Allow prompter to add skills                          | New wizard step with **From library** + **Author new** tabs; skills bundle into `environment/skills/` |
| For evaluator, add options for running with/without skill | New required **Skill mode** radio on the job form: With / Without / Both (A/B); doubles cost estimate |
| Proper Harbor format preview as per folder structure  | Folder tree on the left, file viewer on the right; renders `task.toml`, `instruction.md`, `environment/Dockerfile`, `environment/skills/<id>/SKILL.md`, `tests/test.sh`, `tests/rewardkit.yaml`, `solution/...` |

---

## Recommended demo script (~8 minutes)

### 1. Land on `index.html` (~30s)
Point out the 5 roles and the workflow strip across the top.

### 2. Prompter (~2 min)
- Click **Continue as Prompter** -> **My Prompts** list (statuses: Prompter draft, Ready for tester, Tester in progress, In review, Changes requested, Approved, Published).
- Click **New prompt**.
- **Step 1 Template**: pick **Python Script**.
- **Step 2 Brief**: prefilled name, add a keyword chip.
- **Step 3 Instruction**: type one line to demo the live preview.
- **Step 4 Skills**: click **Add skill** to open the modal.
  - **From library** tab: pick "Parse CSV safely" - it lands in the attached list.
  - **Author new** tab: write a short SKILL.md inline and see the live preview.
- **Step 5 Solution**: click through the three tabs (Upload / In-browser editor / Generate with AI).
- **Step 6 Preview**: this is the **Harbor preview** - click `task.toml`, `instruction.md`, then `environment/skills/parse-csv-safely/SKILL.md`. The tree shows which files are owned by Prompter vs Tester vs auto-generated. Submit for testing.

### 3. Tester (~2 min)
- Click **Switch role** -> **Continue as Tester** -> **Test queue** (the prompter's submission shows here).
- **Step 1 Environment**: visual builder. Scroll down - the **Full Harbor preview** at the bottom updates live as you build.
- **Step 2 Criteria**: open **+ Add criterion** to demo the picker. Note the preview now includes `tests/rewardkit.yaml` and `tests/test.sh`.
- **Step 3 Oracle**: click **Run Oracle Test**, watch the 6s simulator. Also show **Demo: run with FAIL outcome**.
- **Step 4 Preview**: this is the **final** Harbor folder, all sections filled. Submit for review.

### 4. Reviewer (~1 min)
- Click **Switch role** -> **Continue as Reviewer**.
- Open the top item; the first tab is **Harbor preview** showing the exact folder structure the registry will receive.
- Then click through Instruction / Environment / **Skills** / Criteria / Solution / Oracle log tabs.
- Add a comment, then **Approve and publish**.

### 5. Evaluator (~2 min)
- Click **Switch role** -> **Continue as Evaluator** -> **New evaluation job**.
- **Skill mode** is required - pick **Both (A/B)** to show how the cost estimate doubles.
- Pick agents, click **Start job**.
- **Live job**: notice the Skill mode badge on the header and the per-trial "with skills" / "no skills" tags in the feed.
- **View comparison**: side-by-side with/without columns, plus a **Skill lift** column. Use the View dropdown to switch between Side-by-side / With only / Without only / Lift.
- Click any reward cell to open the trial. The header carries a **Skills: with (1 mounted)** badge and links to the without-skills counterpart trial.

### 6. Optional - Admin (~30s)
Users / templates / providers / quotas overview.

---

## What is mocked

| Item                                | In the prototype                      | In the real build                                         |
|-------------------------------------|---------------------------------------|-----------------------------------------------------------|
| Authentication                      | Click a role to navigate              | OAuth / SSO via Harbor auth                               |
| Task storage                        | `assets/data.js`                      | Postgres + blob storage                                   |
| Skill library                       | `data.js` `skillsLibrary` (6 entries) | Admin-managed shared library, versioned                   |
| Form -> Harbor compilation          | JS string templates in `data.js`      | Real "Task Compiler" service writing the actual folder    |
| Oracle test                         | 6s simulated progress                 | Real Daytona sandbox via `harbor run` and Reward Kit      |
| Skill-mode evaluation               | Random pass-rate skewed by skill flag | Real `harbor run --skills-mode {with,without,both}` jobs  |
| Live evaluation                     | `setInterval` tick                    | Websocket stream from running trials                      |
| Agent trajectories                  | One hardcoded example                 | Real ATIF trajectories from Harbor                        |
| Cost estimates                      | Static linear formula                 | Estimator based on historical runs                        |

---

## Browser support

Tested on Chrome (124+) and Safari (17+). No build step.

---

## What to do after the team reviews

1. **Approved as-is** -> begin Phase 1 of the platform design plan.
2. **Approved with changes** -> tweak the prototype (cheap, no real code), re-share.
3. **Major direction change** -> rev the design plan first, then update the prototype.
