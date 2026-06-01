# SkillBench - Project Knowledge & Overview

## Introduction

SkillBench is a benchmarking and evaluation platform designed to measure how much AI model performance improves when domain-specific **Skills** are provided.

The platform allows teams to create benchmark tasks, attach relevant Skills, convert tasks into a standardized execution format (Harbor), validate them via Oracle runs, and ultimately compare model performance with and without Skills.

The primary goal is not just to test AI models, but to **measure the impact of Skills on model performance** across different domains.

---

## Problem Statement

Modern AI models (GPT, Claude, Gemini, open-source models) have strong general capabilities. However, when performing domain-specific workflows such as:

- Finance & Banking
- Security & Compliance
- Healthcare
- Software Development
- Data Engineering
- Legal & Contract Analysis

they often lack specialized procedural knowledge.

Traditional solutions include fine-tuning, prompt engineering, and RAG systems. SkillBench introduces a different approach: instead of modifying the model itself, we **provide domain-specific Skills at inference time** and evaluate whether those Skills improve the model's performance.

---

## What is a Skill?

A **Skill** is a reusable set of instructions, procedures, best practices, or domain knowledge that helps a model perform a task more effectively.

Skills are organized by **domain** and tagged for discoverability. They are reusable and can be attached to multiple tasks.

### Skill Domains (8 in MVP)

| Domain | Description |
|--------|-------------|
| Python | Python language patterns, idioms, standard library |
| Data & ML | pandas, numpy, spark, ML pipelines |
| Web | FastAPI, Flask, REST, frontend frameworks |
| DevOps | Docker, CI/CD, deploy, cloud CLIs |
| Shell / CLI | Bash scripting, CLI tooling |
| Finance | Financial analysis, EBITDA, statements |
| Legal | Contract review, compliance, NDA analysis |
| General | Cross-domain conventions, formatting |

### Example Skills

- **Parse CSV safely** (Data) - Robustly parse CSV with pandas, handling encoding errors
- **EBITDA extraction** (Finance) - Parse EBITDA from financial filings with tolerance handling
- **NDA clause validation** (Legal) - Check for non-compete, confidentiality, and term clauses
- **Bash strict mode** (Shell) - Always start with `set -euo pipefail` for reliable scripts
- **REST error handling** (Web) - Return correct HTTP status codes and structured error body
- **Deterministic output** (Python) - Sort dict keys so test assertions are stable across runs

---

## Core Objective

Measure **Performance With Skill** vs **Performance Without Skill**.

**Example:**
- Task: Extract EBITDA from a 10-K filing and return structured JSON
- Run 1: Model executes without any Skill
- Run 2: Model executes with the "EBITDA extraction" Skill attached

SkillBench compares: Accuracy, Pass Rate, Quality, Cost, Runtime, and Evaluation Score. The resulting comparison shows whether the Skill improved performance.

---

## Core Concepts

### Task

A benchmark problem that tests model capabilities. Each task includes:

- **Name** - Namespaced identifier (e.g., `my-org/text-stats-pipeline`)
- **Description** - What the task asks the model to do
- **Domain** - Subject area (data, finance, python, web, etc.)
- **Difficulty** - easy / medium / hard
- **Instruction** - Full problem statement in Markdown (`instruction.md`)
- **Verifiers** - Structured rules that determine correctness (typed: file_exists, json_key_equals, command_output, csv_cell_equals, llm_judge, freeform)
- **Golden Solution** - The ideal expected solution from a subject matter expert
- **Attachments** - Reference files provided to the model (PDFs, CSVs, text files, etc.)
- **Selected Skills** - Skills attached to this task for with-Skill evaluation

### Verifiers

Verifiers are structured rules (comparable to test cases / rubrics / assertions) that determine whether a model's response is correct. Each verifier has a **type** and a **description**.

| Verifier Type | Purpose |
|---------------|---------|
| File must exist | Check that an output file was created |
| File contains text | Check that a file contains a specific string |
| JSON key equals | Check that a JSON field has the expected value |
| Command output matches | Check that a command exits with expected code/output |
| CSV cell equals | Check a specific cell in CSV output |
| LLM / agent judge | Use an LLM to evaluate subjective quality |
| Free-form note | Any other verification requirement |

### Golden Solution

The ideal expected solution created by a subject matter expert. Acts as the reference answer and guide for the Tester when implementing the executable solution.

### Harbor Format

All tasks are converted into **Harbor format** - a standardized execution package. Harbor provides a structured environment containing everything needed to run and evaluate the task consistently across models.

#### Harbor Folder Structure

```
my-org/task-name/
├── task.toml              ← Shared metadata (auto-generated)
├── instruction.md         ← Problem statement (Prompter)
├── environment/
│   └── Dockerfile         ← Execution environment (Tester)
├── inputs/                ← Reference files (Prompter)
│   └── sample.txt
├── tests/
│   ├── verifiers.md       ← Structured verifier list (Prompter)
│   └── test.sh            ← Executable test script (Tester)
└── solution/
    ├── golden.md          ← Reference solution (Prompter)
    └── solve.sh           ← Executable solution script (Tester)
```

#### task.toml Schema

```toml
[package]
name        = "my-org/task-name"
version     = "1.0"
description = "Task description"
domain      = "data"
difficulty  = "medium"
author      = "prompter@my-org.com"
tester      = "tester@my-org.com"

[verifier]
test_script = "tests/test.sh"
timeout_sec = 600

[environment]
dockerfile = "environment/Dockerfile"
internet   = true

[resources]
cpus       = 2
memory_gb  = 4
storage_gb = 10
gpu        = false

[oracle]
status      = "passed"
last_reward = 1.00
```

#### File Ownership

Each file in the Harbor package has a clear owner:

| Owner | Files |
|-------|-------|
| **Prompter** | instruction.md, inputs/*, tests/verifiers.md, solution/golden.md |
| **Tester** | environment/Dockerfile, tests/test.sh, solution/solve.sh |
| **Shared** | task.toml (auto-generated from both contributions) |

### Environment Templates

Pre-configured Docker environments the Tester can choose from:

| Template | Stack | Resources |
|----------|-------|-----------|
| Python 3.12 + pytest | Lean Python with pytest | 1 CPU, 2 GB RAM |
| Python 3.12 + pandas | Data-science: pandas, numpy, scipy | 2 CPU, 4 GB RAM |
| Node 20 + Jest | JavaScript/TypeScript with Jest | 1 CPU, 2 GB RAM |
| Rust 1.78 | Systems programming with cargo | 2 CPU, 4 GB RAM |
| Ubuntu + ML (GPU) | PyTorch 2.x on CUDA | 4 CPU, 16 GB RAM, GPU |
| Go 1.22 | Go with standard testing | 1 CPU, 2 GB RAM |

Testers can also write a fully custom Dockerfile.

### Oracle

Before evaluating models, the system runs Oracle validation to verify that the **Golden Solution passes all Verifiers**. The Oracle executes:

1. Build environment from Dockerfile
2. Run `solution/solve.sh`
3. Run verifier (`tests/test.sh`)
4. Parse reward from `/logs/verifier/reward.json`

A task **cannot be submitted for final review** unless Oracle returns PASS (reward = 1.0).

---

## User Roles (7)

| # | Role | Key | Description |
|---|------|-----|-------------|
| 1 | **Super Admin** | `superAdmin` | Full platform control, system settings, user management across all orgs |
| 2 | **Admin** | `admin` | Organization admin, manages team, views analytics |
| 3 | **Project Manager** | `projectManager` | Assigns tasks, manages workload, monitors pipeline progress |
| 4 | **Prompter** | `prompter` | Domain expert who creates prompts, verifiers, golden solutions, attaches Skills |
| 5 | **Domain Reviewer** | `domainReviewer` | Reviews prompt quality, verifier logic, golden solution correctness |
| 6 | **Tester** | `tester` | Sets up Docker environment, implements solve.sh and test.sh, runs Oracle |
| 7 | **Task Reviewer** | `taskReviewer` | Final technical review of complete Harbor package before publish |

### Role Responsibilities

**Super Admin**
- Platform-wide user management (add/edit/activate/deactivate)
- System settings (general, authentication, SSO)
- Skills catalog management (full CRUD on domains and skills)
- Platform KPIs and health monitoring

**Admin**
- Organization-level KPIs and pipeline analytics
- Team management within their org
- Skills catalog management
- Task pipeline monitoring

**Project Manager**
- Pipeline progress dashboard (tasks by status, needs-attention items)
- Task assignment (assign Prompter, Tester, or Reviewer to tasks)
- Team workload monitoring and balancing
- Activity feed tracking

**Prompter**
- Creates benchmark tasks via a 7-step wizard
- Defines task brief (name, description, domain, difficulty)
- Selects relevant Skills from the catalog
- Writes problem instruction in Markdown
- Defines structured verifiers
- Writes golden solution
- Runs mock model validation before submitting
- Addresses change requests from reviewers

**Domain Reviewer**
- Reviews tasks submitted by Prompters
- Evaluates instruction clarity, verifier logic, and golden solution correctness
- Approves tasks (moves to Tester) or requests changes (returns to Prompter)
- Adds comments for feedback

**Tester**
- Picks up tasks from the available queue
- Selects or creates Docker environment (from template or custom Dockerfile)
- Implements `solve.sh` using the Prompter's golden solution as reference
- Compiles `test.sh` from the Prompter's structured verifiers
- Runs Oracle to validate alignment
- Submits completed Harbor package for review

**Task Reviewer**
- Reviews the complete Harbor package (environment, solution, tests)
- Verifies Oracle has passed
- Approves and publishes, or requests changes routed to either Prompter or Tester
- Solution-first review layout (prioritizes code review)

---

## Task Lifecycle (7 States)

```
prompter-draft → domain-review → with-tester → in-review → approved → published
                     ↓                              ↓
              changes-requested ←───────────────────┘
              (→ prompter OR tester)
```

| State | Label | Who Acts | Next States |
|-------|-------|----------|-------------|
| `prompter-draft` | Draft | Prompter continues wizard | → `domain-review` |
| `domain-review` | Domain Review | Domain Reviewer evaluates | → `with-tester` or `changes-requested` |
| `with-tester` | With Tester | Tester picks up and implements | → `in-review` |
| `in-review` | Task Review | Task Reviewer evaluates | → `published` or `changes-requested` |
| `changes-requested` | Changes Requested | Prompter or Tester fixes (routed via `changesTarget`) | → `domain-review` or `in-review` |
| `approved` | Approved | (defined, reviewer currently skips to published) | → `published` |
| `published` | Published | Terminal state | — |

### Changes Requested Routing

When a reviewer requests changes, they specify a **target** (Prompter or Tester). The task's `changesTarget` field determines who sees it in their queue and is responsible for addressing the feedback. Comments are preserved on the task for context.

---

## Workflow Detail

### Phase 1: Task Creation (Prompter - 7-Step Wizard)

| Step | Name | What Happens |
|------|------|-------------|
| 1 | **Brief** | Set task name (`org/name` format), description, domain, difficulty (easy/medium/hard) |
| 2 | **Skills** | Two-panel picker: browse skill domains on the left, select individual skills on the right. Skills are optional but recommended. |
| 3 | **Problem** | Write `instruction.md` in Markdown with live preview. Can import content from files. |
| 4 | **Verifiers** | Build structured verifier list with type dropdown + description. "AI Suggest" button generates sample verifiers. |
| 5 | **Solution** | Write golden solution in Markdown with live preview. |
| 6 | **Try Model** | Run mock model execution against verifiers. Shows per-verifier pass/fail (~85% random pass rate per verifier). Helps validate task feasibility. |
| 7 | **Submit** | Review checklist (requires verifiers + golden solution). Submit transitions task to `domain-review`. |

Wizard state persists in `sessionStorage` across page navigation within a session. Each step saves on input.

### Phase 2: Domain Review

Domain Reviewer sees tasks in their **Review Queue** and opens a 3-column workspace:
- Left: instruction.md
- Center: golden solution
- Right: verifiers list

Actions:
- **Approve** → task moves to `with-tester`
- **Request Changes** → task moves to `changes-requested` (target: prompter), comment added

### Phase 3: Tester Implementation (5-Step Wizard)

| Step | Name | What Happens |
|------|------|-------------|
| 1 | **Context** | Read-only view of everything the Prompter provided: instruction, verifiers, golden solution, attachments. Pick up task if unassigned. |
| 2 | **Environment** | Choose from template library or write custom Dockerfile. Auto-adds `COPY` for attachments. |
| 3 | **Solution** | Write `solve.sh` with the Prompter's golden solution visible as reference in a side panel. |
| 4 | **Tests** | Write `test.sh` with the verifiers list visible as reference in a side panel. |
| 5 | **Oracle** | Run alignment evaluation (simulated). Oracle must PASS before submission is allowed. Submits to `in-review`. |

### Phase 4: Task Review

Task Reviewer sees tasks in their **Review Queue** (tabs: Pending, Awaiting Fixes, Approved/Published) and opens a workspace with:
- Solution-first layout (prioritizes reviewing solve.sh and test.sh)
- Full Harbor preview (file tree + content viewer with owner badges)
- History timeline and comments

Actions:
- **Approve** → requires Oracle PASS; publishes task
- **Request Changes** → routes to either Prompter or Tester with comment

### Phase 5: Publication

Published tasks are the terminal state. They represent complete, validated Harbor packages ready for evaluation runs.

---

## Platform Modules

### Authentication & Role Management
- Login with email/password
- Role-based access control (7 roles)
- Session management via localStorage
- Role switching for demo/development purposes

### People Management (Super Admin / Admin)
- User directory with search and filter
- Add / edit / activate / deactivate users
- View last seen, task counts, join dates
- Role assignment

### Skills Catalog (Super Admin / Admin)
- Skill domains: create, edit, delete
- Skills within domains: full CRUD with tags
- Skills browsable by all roles during task creation

### Task Pipeline (Project Manager)
- Pipeline KPIs (tasks by status, completion rates)
- "Needs attention" list (stalled or overdue tasks)
- Task assignment modal (assign Prompter, Tester, or Reviewer based on current status)
- Team workload cards showing per-person task counts
- Unassigned task tracking

### Prompter Workspace
- Personal task list filtered by logged-in user
- Task actions: Continue wizard / View detail / Address changes
- Task detail view with Harbor preview, history, comments
- 7-step creation wizard (see Workflow Detail)

### Review Workspaces (Domain Reviewer / Task Reviewer)
- Queue with badge counts
- Side-by-side content review
- Approve / Request Changes with routing
- Comment thread on tasks

### Tester Workspace
- Queue with tabs: Available (unassigned), My Tasks, Submitted
- 5-step implementation wizard (see Workflow Detail)
- Environment template picker
- Code editors for solve.sh and test.sh
- Oracle execution and validation

### Harbor Preview
- Interactive file tree with folder/file navigation
- Content viewer with syntax highlighting
- Owner badges (Prompter/Tester/Shared) on each file
- Available in task detail, reviewer workspaces, and wizard steps

### Dashboards

| Role | Dashboard Content |
|------|-------------------|
| Super Admin | Platform-wide KPIs, role distribution, pipeline breakdown, recent users, system health, quick actions |
| Admin | Organization pipeline KPIs, all-tasks table, team table, activity feed, skills summary |
| Project Manager | Pipeline KPIs, needs-attention list, team workload cards, activity feed |
| Prompter | Personal task list with status filters, workflow explainer |
| Domain Reviewer | Review queue (no aggregate dashboard) |
| Tester | Task queue with tabs (no aggregate dashboard) |
| Task Reviewer | Review queue with tabs (no aggregate dashboard) |

---

## Data Model Summary

### Primary Entities

**Task** (central entity)
- Identity: `id`, `name`, `description`, `domain`, `difficulty`
- People: `prompter`, `domainReviewer`, `tester` (embedded user refs)
- Status: `status`, `changesTarget`, `updatedAt`
- Prompter content: `instructionMd`, `verifiers[]`, `goldenSolution`, `selectedSkills[]`, `attachments[]`
- Tester content: `templateId`, `dockerfile`, `solveSh`, `testSh`
- Oracle: `oraclePassed`, `oracleReward`
- Audit: `history[]` (timestamped events), `comments[]` (threaded feedback)

**Skill** - `id`, `domain`, `name`, `desc`, `tags[]`

**Skill Domain** - `id`, `name`, `color`, `desc`

**Environment Template** - `id`, `name`, `desc`, `tags[]`, `resources` (cpus, memory, storage, gpu, internet), `dockerfile`

**User** - `id`, `name`, `email`, `role`, `initials`, `lastSeen`, `tasksCount`, `status`, `joinedAt`

### Key Relationships

- Task → Skills via `selectedSkills[]` (array of skill IDs)
- Task → Environment Template via `templateId`
- Task → Users via embedded `prompter`, `domainReviewer`, `tester` refs
- Skill → Skill Domain via `domain` field

---

## MVP Technical Stack

- **Frontend:** Pure HTML + Tailwind CSS (CDN) + vanilla JavaScript
- **Data layer:** Client-side mock data (`assets/data.js`) — in-memory, no persistence beyond session
- **Wizard state:** `sessionStorage` for cross-page wizard persistence
- **Auth:** `localStorage` session with hardcoded demo credentials
- **Build:** None — open HTML files directly or serve with any static server
- **Styling:** CSS custom properties for theming, role-colored accents, responsive sidebar/topbar shell

### What is Simulated in MVP

| Feature | Current State | Production Target |
|---------|---------------|-------------------|
| Data persistence | In-memory; resets on page reload | PostgreSQL + blob storage |
| Authentication | Hardcoded credentials (`demo123`) | SSO / RBAC via Harbor auth |
| Oracle execution | Timed fake stages (6 seconds) | Daytona sandbox + Reward Kit |
| Mock model (Try Model) | Random verifier pass/fail | Real LLM API call |
| AI Suggest verifiers | Inserts 3 fixed samples | LLM-generated suggestions |
| File uploads | Read into editor client-side | Cloud storage |
| Markdown preview | Lightweight custom parser | Full CommonMark renderer |
| Notifications | Toast messages only | Email / Slack / in-app |
| Settings | UI-only, no persistence | Stored configuration |
| Admin metrics | Hardcoded KPIs | Real-time analytics |

---

## End-to-End Workflow (Happy Path)

```
1. Project Manager assigns Prompter to task (optional)
        ↓
2. Prompter creates task via 7-step wizard → Submits for domain review
        ↓
3. Domain Reviewer approves prompt quality → Task moves to Tester queue
        ↓
4. Tester picks up task → Implements environment, solve.sh, test.sh → Runs Oracle (PASS) → Submits
        ↓
5. Task Reviewer approves complete Harbor package → Task published
        ↓
6. Published task is ready for evaluation runs
```

At any review gate, **changes can be requested** and routed back to either the Prompter or the Tester with comments preserved.

---

## MVP File Structure

```
v4-mvp/
├── index.html                          # Role switcher (post-login)
├── login.html                          # Sign-in page
├── assets/
│   ├── data.js                         # Mock data layer (SBData)
│   ├── script.js                       # Shared UI logic (SB)
│   └── style.css                       # Design tokens + app shell
├── super-admin/
│   ├── dashboard.html                  # Platform KPIs, system health
│   ├── people.html                     # User management (CRUD)
│   ├── settings.html                   # General + Auth settings
│   └── skills.html                     # Domain + Skill catalog CRUD
├── admin/
│   ├── dashboard.html                  # Org KPIs, task table, team
│   ├── people.html                     # Org user management
│   └── skills.html                     # Skills catalog
├── project-manager/
│   ├── dashboard.html                  # Pipeline KPIs, attention items
│   ├── tasks.html                      # All tasks + assignment modal
│   └── assignments.html                # Workload + unassigned tasks
├── prompter/
│   ├── dashboard.html                  # My Tasks list
│   ├── task-detail.html                # Harbor preview, history, comments
│   ├── wizard-1-brief.html             # Name, description, domain, difficulty
│   ├── wizard-2-skills.html            # Two-panel skill picker
│   ├── wizard-3-instruction.html       # Markdown instruction editor
│   ├── wizard-4-verifiers.html         # Structured verifier builder
│   ├── wizard-5-solution.html          # Golden solution editor
│   ├── wizard-6-trymodel.html          # Mock model execution
│   └── wizard-7-submit.html            # Summary + submit
├── domain-reviewer/
│   ├── queue.html                      # Tasks awaiting domain review
│   └── workspace.html                  # 3-column review workspace
├── tester/
│   ├── queue.html                      # Available / My / Submitted tabs
│   ├── wizard-1-context.html           # Read-only prompter content
│   ├── wizard-2-environment.html       # Template picker / custom Dockerfile
│   ├── wizard-3-solution.html          # solve.sh editor
│   ├── wizard-4-tests.html             # test.sh editor
│   └── wizard-5-oracle.html            # Oracle run + submit
└── reviewer/
    ├── queue.html                      # Pending / Awaiting / Published tabs
    └── workspace.html                  # Solution-first review workspace
```

---

## Future Vision

SkillBench is designed as a reusable benchmark generation and evaluation system. Future capabilities include:

- **Evaluation Engine** - Run tasks on real AI models with and without Skills
- **Result Dashboard** - Evaluation reports, Skill impact analysis, model comparison
- **Multiple Projects & Batches** - Project → Batch → Delivery Batch hierarchy
- **Automated Harbor Generation** - AI-assisted task.toml and test.sh generation
- **AI-Assisted Task Creation** - LLM-powered instruction writing and verifier generation
- **Skill Recommendation** - Automatically suggest Skills based on task domain
- **Model Leaderboard** - Compare model performance across tasks and domains
- **Cost Optimization Reporting** - Track and optimize evaluation costs
- **Multi-Model Comparison** - Side-by-side evaluation across GPT, Claude, Gemini, etc.
- **Enterprise Reporting** - Organization-level analytics and audit trails
- **Real Sandbox Execution** - Daytona integration for real Docker-based Oracle runs
- **Webhook Notifications** - Email/Slack notifications for status changes

---

## Success Criteria

SkillBench will be considered successful if it can:

1. Create and manage reusable Skills organized by domain
2. Create benchmark tasks efficiently via guided wizards
3. Convert tasks into standardized Harbor format with clear ownership
4. Validate tasks through Oracle before publication
5. Execute evaluation runs comparing models with and without Skills
6. Measure Skill impact accurately with structured verifiers
7. Support multiple domains (currently 8 skill domains)
8. Scale into a generalized benchmark platform

---

## One-Line Summary

SkillBench is a platform for creating domain-specific benchmark tasks with attached Skills, packaging them into standardized Harbor format with Oracle validation, and evaluating AI models with and without those Skills to measure the impact of domain knowledge on model performance.
