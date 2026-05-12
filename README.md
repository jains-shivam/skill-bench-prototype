# Skill Bench - Click-through Prototypes (two versions)

This folder contains **two** versions of the Skill Bench prototype side-by-side so the team can compare:

- **V1** (`v1/`) - the first prototype we shared. One **Trainer** persona owns the whole task: instruction, environment, criteria, solution, Oracle.
- **V2** (`v2/`) - reworked around the V1 feedback. Splits into **Prompter + Tester** (relay), adds the **skills library**, adds the **with/without/A-B skill evaluation**, and adds a **Harbor folder preview** everywhere.

Both are pure HTML / Tailwind via CDN / vanilla JS. No build, no install.

---

## How to view

1. Open `index.html` in any modern browser. That's the top-level chooser that explains the differences and links to both versions.
2. From the chooser, click **V1 - Original** or **V2 - Relay + skills + Harbor preview** to drop into that version's role picker.
3. Inside any page in V1 or V2, click **&larr; Compare versions** in the top-right to come back to the chooser. **Switch role** takes you to that version's role picker.

> If your browser blocks `file://` JS, run `./serve.sh` (or `python3 -m http.server 8000`) from the repo root and visit <http://localhost:8000/>.

---

## What changed in V2 (against V1 feedback)

| Feedback                                              | V1 today                                                                | V2 proposal                                                                                                                                                                  |
|-------------------------------------------------------|-------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Allow submit after prompt + golden solution           | Trainer must finish all 7 steps before submitting                       | Prompter submits after Brief / Instruction / Skills / Solution; Tester picks up                                                                                              |
| Full preview in draft and review mode                 | Each wizard step shows only its own form                                | "Harbor preview" panel (folder tree + file viewer) on every submit step, in Task detail, and as the default Reviewer tab                                                     |
| Separate multi-step forms for Tester and Prompter     | One Trainer role with one 7-step form                                   | Two relay flows: Prompter (6 steps) and Tester (4 steps), each with its own dashboard / queue and stepper                                                                    |
| Allow Prompter to add skills                          | No skill concept anywhere                                               | New Skills wizard step with "From library" + "Author new" tabs. Skills compile into `environment/skills/<id>/SKILL.md`                                                       |
| Evaluator: run with / without skills                  | Job form takes agents, attempts, concurrency only                       | Required **Skill mode** radio: With / Without / Both (A/B). Cost estimate doubles for A/B. Comparison shows a per-task skill lift                                            |
| Proper Harbor format preview                          | Sections shown as custom UI cards (no folder shape)                     | Generated Harbor folder tree: `task.toml`, `instruction.md`, `environment/Dockerfile`, `environment/skills/`, `tests/test.sh`, `tests/rewardkit.yaml`, `solution/` - viewable |
| File ownership during testing                         | One Trainer, no ownership model                                         | Tester authors `Dockerfile` + `test.sh` + `rewardkit.yaml` (visual / upload / raw). Prompter retains `instruction.md` + `skills/` + `solution/` and can revise while testing is in progress (Revise CTA). Other files are read-only preview |

---

## Folder layout

```
.
  index.html              <- TOP-LEVEL CHOOSER (open this first)
  README.md               <- this file
  serve.sh                <- one-liner local server (python3 -m http.server)
  v1/                     <- ORIGINAL prototype (unchanged)
    index.html            5-card role picker
    trainer/              7-step wizard (Template -> ... -> Oracle test)
    reviewer/
    evaluator/
    admin/
    assets/
    README.md             v1-specific demo script
  v2/                     <- NEW prototype with feedback applied
    index.html            5-card role picker (Prompter, Tester, Reviewer, Evaluator, Admin)
    trainer/              PROMPTER flow (folder name kept for URL stability)
      wizard-1-template / wizard-2-brief / wizard-3-instruction
      wizard-4-skills    <- NEW
      wizard-5-solution
      wizard-6-preview   <- NEW (full Harbor preview + Submit for testing)
    tester/                <- NEW persona folder
      queue
      wizard-1-environment / wizard-2-criteria / wizard-3-oracle
      wizard-4-preview   <- NEW (full Harbor preview + Submit for review)
    reviewer/             Harbor preview tab added
    evaluator/            Skill-mode radio + skill-lift comparison
    admin/
    assets/
    README.md             v2-specific demo script
```

---

## Suggested demo order (~10 min total)

### V1 walkthrough (~3 min)
1. Open `v1/index.html`. Note the **single Trainer persona** does everything.
2. **Trainer dashboard** -> **Create Task** -> walk steps 1 to 7.
3. Call out what the team flagged: "Trainer can't submit until they've done env, criteria and Oracle"; "no folder-level preview"; "no skills"; "evaluator can't tell whether skills helped".

### V2 walkthrough (~6 min)
4. Open `v2/index.html` (or click **&larr; Compare to V2** from any V1 page, then **Open V2**).
5. **Prompter** flow: write the prompt, attach a skill from the library, give a golden solution, click **Step 6 Preview** to see the Harbor folder, **Submit for testing**.
6. Switch to **Tester** -> open the prompt from the queue, walk env + criteria, run Oracle, look at the Harbor preview, **Submit for review**.
7. Switch to **Reviewer** -> the default tab is the **Harbor preview**, so they see the proper folder structure on the way in.
8. Switch to **Evaluator** -> new job, pick **Both (A/B)** as the skill mode, watch the cost double, view comparison with skill lift, drill into a trial.

### Wrap (~1 min)
9. Open the top-level chooser again (`index.html`) and walk the diff table.

---

## What is mocked

In both versions:
- Authentication is a click. Real build uses Harbor auth.
- Task storage is `assets/data.js`. Real build: Postgres + blob.
- Oracle test is a 6-second simulator. Real build: Daytona sandbox via `harbor run` + Reward Kit.
- Live evaluation is a `setInterval` tick. Real build: websocket stream.
- Agent trajectories are hardcoded. Real build: ATIF trajectories from Harbor.

V2 adds these mocks on top of V1:
- Skills library has 6 sample entries. Real build: admin-managed shared library.
- Skill-mode evaluation is simulated with skewed pass rates. Real build: `harbor run --skills-mode {with,without,both}`.
- Harbor folder preview is generated client-side from form state. Real build: "Task Compiler" service that writes the real folder.

---

## What to do after the team reviews

1. **V2 approved as-is** -> begin Phase 1 of the platform design plan.
2. **V2 approved with changes** -> tweak this prototype (cheap, no real code), re-share.
3. **Mix and match** -> if the team wants some V1 patterns kept and some V2 patterns adopted, jot the picks per row of the diff table.
