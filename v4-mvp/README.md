# Skill Bench MVP — relay between domain expert and software developer

> **Build this first.** Trainers can be from **any domain** (finance, legal, marketing, data, …) and write **zero code**.
> Testers are **software developers** who convert plain-language artifacts into a runnable Harbor task package.

Full vision: [V3](../v3/index.html). This folder is the **scope contract** for engineering.

---

## Why the relay exists

| Persona | Knows | Does NOT need to know |
|---|---|---|
| **Trainer** | The problem domain, what success looks like | Docker, pytest, resource limits, shell |
| **Tester** | Environments, code, test harnesses, Oracle | The business domain (reads trainer brief) |
| **Reviewer** | Quality bar for published tasks | Either specialty in depth |

Reference systems that use the same split:

- **HackerRank / Codility** — problem setters write statements; platform owns runtime
- **Coursera autograders** — instructors write rubrics; platform engineers wire graders
- **Scale AI / Outlier** — SMEs write instructions; taskers convert to executable specs
- **Kaggle** — hosts define metric + data; kernels are pre-built environments

---

## Lifecycle (6 states)

```
trainer-draft  →  with-tester  →  in-review  →  published
                      ↑              ↓
                      └── changes-requested (→ trainer OR tester)
```

| State | Owner | Meaning |
|---|---|---|
| `trainer-draft` | Trainer | Writing plain-language brief |
| `with-tester` | Tester pool | Submitted; waiting for pickup or in progress |
| `in-review` | Reviewer | Tester submitted; Oracle PASS |
| `changes-requested` | Trainer or Tester | Reviewer sent back with a target role |
| `approved` | Admin | Approved (transitional) |
| `published` | — | Live in Harbor registry |

---

## Roles & screens (15 pages)

### Trainer — domain expert (plain language only)

| Screen | Purpose |
|---|---|
| `trainer/dashboard.html` | My tasks |
| `trainer/wizard-1-brief.html` | Name, description, domain tag, difficulty |
| `trainer/wizard-2-instruction.html` | Problem statement (Markdown) |
| `trainer/wizard-3-criteria.html` | Acceptance criteria + optional file attachments |
| `trainer/wizard-4-solution.html` | Golden solution (reference answer / approach) |
| `trainer/wizard-5-submit.html` | Preview → Submit to tester pool |
| `trainer/task-detail.html` | Read-only status + Harbor preview |

**Produces:** `instruction.md`, `tests/criteria.md`, `solution/golden.md`, `inputs/*`

### Tester — software developer

| Screen | Purpose |
|---|---|
| `tester/queue.html` | Available / My tasks / Submitted |
| `tester/wizard-1-environment.html` | Template picker (+ custom Dockerfile escape) |
| `tester/wizard-2-solution.html` | `solution/solve.sh` with trainer context sidebar |
| `tester/wizard-3-tests.html` | criteria.md (read-only) + `tests/test.sh` editor |
| `tester/wizard-4-oracle.html` | Oracle PASS required → Submit for review |

**Produces:** `environment/Dockerfile`, `solution/solve.sh`, `tests/test.sh`

### Reviewer

| Screen | Purpose |
|---|---|
| `reviewer/queue.html` | Pending / Awaiting fixes / Done |
| `reviewer/workspace.html` | Harbor preview, comments, approve, request changes (pick trainer or tester) |

### Admin

| Screen | Purpose |
|---|---|
| `admin/dashboard.html` | KPIs, people, environment template catalog, recent tasks |

---

## Environment templates (6 seeded)

Testers pick a card — they do **not** write Dockerfiles unless using the Custom tab:

| ID | Name |
|---|---|
| `python-3.12-pytest` | Python 3.12 + pytest |
| `python-3.12-pandas` | Python 3.12 + pandas |
| `node-20-jest` | Node 20 + Jest |
| `bash-cli` | Bash / CLI |
| `playwright-browser` | Playwright (browser) |
| `ml-gpu` | Python ML (GPU) |

---

## Demo script (~6 min)

1. **Landing** — explain Trainer (any domain) → Tester (dev) → Reviewer → Published.
2. **Trainer** — New task → Brief (domain: `finance`) → Instruction → Criteria in plain English + attach `filing_snippet.txt` → Submit to tester pool.
3. **Switch to Tester** — Queue → Pick up `finance-ebitda-extract` → Template `python-3.12-pandas` → Solution editor (trainer context on left) → Tests (criteria left, test.sh right) → Oracle PASS → Submit for review.
4. **Reviewer** — Open `csv-validator` → Harbor preview → Request changes **to tester** OR Approve (disabled if Oracle not PASS).
5. **Admin** — KPIs + template catalog.

---

## Deferred (post-MVP)

- Skills library + lifecycle
- Projects / Batches / Delivery batches
- Evaluator with/without skills A/B
- AI generation tabs
- No-code criteria builder (MVP: tester writes `test.sh` in code editor)
- PM auto-assignment / round-robin
- Admin UI to add templates (MVP: seeded in `data.js`)

---

## How to view

Open `v4-mvp/index.html` or run from repo root:

```bash
./serve.sh
# http://localhost:8000/v4-mvp/
```

---

## What is mocked

| Item | Prototype | Production |
|---|---|---|
| Auth | Click role | SSO + RBAC |
| Storage | `assets/data.js` | Postgres + blob |
| Attachments | Client-side FileReader | S3 upload |
| Oracle | 6s simulator | Daytona + Reward Kit |
| Template admin | Read-only table | CRUD API |
