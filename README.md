# Skill Bench - Click-through Prototypes (V1, V2, V3)

Three iterations of the Skill Bench prototype side-by-side for team comparison:

- **V1** (`v1/`) — Original. One **Trainer** persona owns the whole task (7-step wizard). No skills, no Harbor preview.
- **V2** (`v2/`) — Relay workflow. Split into **Prompter** (6 steps) + **Tester** (4 steps). Adds **skills library**, **with/without/A-B evaluation**, and **Harbor folder preview** everywhere.
- **V3** (`v3/`) — Latest. Adds **Project → Batch → Delivery Batch**, a **Project Manager** role, co-authored **task.toml**, a Tester **solution editor** (file tree + AI tidy + diff), expanded env config + **Daytona safety banner**, and an admin **Skills Lifecycle Manager**.

All three are pure HTML / Tailwind via CDN / vanilla JS. No build, no install.

---

## How to view

1. Open `index.html` in any modern browser — it's the top-level chooser with a 3-column comparison table and deep links to all three versions.
2. Click any version card to drop into that version's role picker.
3. Inside any page, click **← Compare versions** in the top-right to return to the chooser.

> If your browser blocks `file://` JS, run `./serve.sh` (or `python3 -m http.server 8000`) and visit <http://localhost:8000/>.

---

## What changed across versions

| Topic | V1 | V2 | V3 |
|---|---|---|---|
| Top-level scope | Flat task list | Flat task list | **Project → Batch → Delivery Batch** + workspace switcher |
| Roles | 4 (Trainer, Reviewer, Evaluator, Admin) | 5 (Prompter, Tester, Reviewer, Evaluator, Admin) | 6 (+ **Project Manager**) |
| task.toml | Generated implicitly | From Prompter's Brief step | **Co-authored**: Prompter (identity) + Tester (execution) |
| Tester env config | Packages list | Visual / upload / raw Dockerfile | + base image, resources, timeouts, env vars, **Daytona banner** |
| Solution editing | Trainer owns it | Tester sees read-only | New Tester step: file tree + editor + **AI tidy** + diff |
| Skills | None | Library + attach to tasks | + Admin **Lifecycle Manager** (Draft/Published/Deprecated/Archived) |
| File ownership | Single Trainer | Tester/Prompter split | + **task.toml shared**, **solution/ Tester-editable** |
| Harbor preview | None | Folder tree + file viewer | + shared-owner handling + Tester edit affordance |

See `index.html` for the full comparison table.

---

## Folder layout

```
index.html              ← TOP-LEVEL CHOOSER (open this first)
README.md               ← this file
serve.sh                ← one-liner local server
docs/                   ← backend planning docs
v1/                     ← Original prototype
v2/                     ← Relay + skills + Harbor preview
v3/                     ← Projects + lifecycle + co-authored config
  index.html            6-card role picker
  pm/                   Project Manager dashboard
  projects/             Projects list + detail (batches, delivery, members, settings)
  batches/              Batch detail (task table scoped to batch)
  delivery-batches/     Delivery batch manifest with package hashes
  trainer/              Prompter flow (6-step wizard)
  tester/               Tester flow (5-step wizard: env, solution, criteria, oracle, preview)
  reviewer/             Review queue + workspace
  evaluator/            Eval home, new job, live job, comparison, trial detail
  admin/                Dashboard + Skills Lifecycle Manager
  assets/               data.js, script.js, style.css
```

---

## What is mocked

- Authentication is a click. Real build: Harbor auth / RBAC.
- Task storage is `assets/data.js`. Real build: Postgres + blob.
- Oracle test is a 6-second simulator. Real build: Daytona sandbox + Reward Kit.
- Live evaluation is a `setInterval` tick. Real build: websocket stream.
- Projects / batches / delivery batches are static rows in `data.js`.
- Skill lifecycle state changes are in-memory only.
- Solution editor is a plain `<textarea>`. Real build: Monaco / CodeMirror.
- AI tidy is a string-rewriting stub. Real build: LLM call.
