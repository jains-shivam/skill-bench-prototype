# Skill Bench MVP (v4)

Minimal end-to-end prototype demonstrating the 5-role relay model for task creation and review.

## Roles (5)

| # | Role | What they do |
|---|------|-------------|
| 1 | **Prompter** | Domain expert who writes the task prompt, selects skills, defines structured verifiers, provides a golden solution, and runs mock model validation |
| 2 | **Domain Expert Reviewer** | Reviews prompt quality, golden solution, and verifier logic before handoff to tester |
| 3 | **Tester** | Sets up Docker environment, implements solve.sh from golden solution, compiles test.sh from verifiers, runs Oracle |
| 4 | **Technical Reviewer** | Reviews full Harbor package (solution first), approves or requests changes |
| 5 | **Admin** | KPIs, people, templates, skills catalog overview |

## Lifecycle (7 states)

```
prompter-draft → domain-review → with-tester → in-review → approved → published
                                                    ↓
                                          changes-requested
                                            (→ prompter or tester)
```

## Wizard Steps

### Prompter (7 steps)
1. **Brief** — name, description, domain, difficulty
2. **Skills** — two-panel domain/skill picker
3. **Problem** — instruction.md with live preview
4. **Verifiers** — structured verifier builder (type dropdown + AI suggest)
5. **Solution** — golden solution markdown editor
6. **Try Model** — mock model execution + verifier validation
7. **Submit** — summary + submit for domain review

### Tester (5 steps)
1. **Context** — read-only view of everything prompter provided
2. **Environment** — template picker or custom Dockerfile
3. **Solution** — solve.sh editor with prompter's golden solution as reference
4. **Tests** — test.sh editor with verifiers as reference
5. **Oracle** — alignment eval + Oracle run + submit for tech review

## Harbor Folder Structure

```
my-org/task-name/
├── task.toml           (shared metadata)
├── instruction.md      (prompter)
├── environment/
│   └── Dockerfile      (tester)
├── inputs/             (prompter attachments)
│   └── sample.txt
├── tests/
│   ├── verifiers.md    (prompter - structured)
│   └── test.sh         (tester - compiled)
└── solution/
    ├── golden.md       (prompter - reference)
    └── solve.sh        (tester - executable)
```

## Tech

- Pure HTML + Tailwind CSS (CDN) + vanilla JS
- Client-side mock data (`assets/data.js`)
- Session storage for wizard state persistence
- No server, no build step — open `index.html` to use

## Running

```bash
cd v4-mvp
python3 -m http.server 8080
# Open http://localhost:8080
```
