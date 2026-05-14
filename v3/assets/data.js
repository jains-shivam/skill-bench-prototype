/* Skill Bench prototype - mock data.
   All hardcoded; no fetches anywhere in the prototype.
   The workflow models a relay between Prompter -> Tester -> Reviewer
   -> Evaluator, matching the Harbor task lifecycle. */

window.SBData = (function () {
  const users = {
    pm:        { id: 'u0', name: 'Priya Kapoor', email: 'priya@my-org.com', role: 'Project Manager', initials: 'PK' },
    prompter:  { id: 'u1', name: 'Jane Doe',     email: 'jane@my-org.com',  role: 'Prompter',  initials: 'JD' },
    tester:    { id: 'u2', name: 'Tara Wu',      email: 'tara@my-org.com',  role: 'Tester',    initials: 'TW' },
    reviewer:  { id: 'u3', name: 'Bob Smith',    email: 'bob@my-org.com',   role: 'Reviewer',  initials: 'BS' },
    evaluator: { id: 'u4', name: 'Carol Lee',    email: 'carol@my-org.com', role: 'Evaluator', initials: 'CL' },
    admin:     { id: 'u5', name: 'Dave Patel',   email: 'dave@my-org.com',  role: 'Admin',     initials: 'DP' },
  };

  /* ---------------------- V3: Projects / Batches / Delivery batches ---------------------- */

  const projects = [
    {
      slug: 'acme-coding',
      name: 'Acme Coding Tasks',
      customer: 'Acme Corp',
      ownerId: 'u0',
      status: 'active',
      description: 'Curated coding tasks for training Acme\u2019s internal coding agent.',
      createdAt: '2026-03-01',
      stats: { batches: 3, tasks: 47, delivered: 22 },
    },
    {
      slug: 'data-pipelines',
      name: 'Data Pipeline Benchmarks',
      customer: 'Internal R&D',
      ownerId: 'u0',
      status: 'active',
      description: 'Tasks exercising pandas, spark, and SQL pipelines for agent benchmarking.',
      createdAt: '2026-04-12',
      stats: { batches: 2, tasks: 28, delivered: 0 },
    },
    {
      slug: 'web-tooling',
      name: 'Web Tooling',
      customer: 'BetaScale Inc.',
      ownerId: 'u5',
      status: 'paused',
      description: 'FastAPI + frontend bug-fix scenarios.',
      createdAt: '2026-02-09',
      stats: { batches: 1, tasks: 12, delivered: 12 },
    },
  ];

  const batches = [
    /* Acme Coding */
    { id: 'b1', projectSlug: 'acme-coding',   slug: 'sprint-1', name: 'Sprint 1 - Python Foundations', target: 15, deadline: '2026-04-30', status: 'closed', tasks: 15 },
    { id: 'b2', projectSlug: 'acme-coding',   slug: 'sprint-2', name: 'Sprint 2 - File I/O & Pandas',   target: 20, deadline: '2026-05-22', status: 'in-progress', tasks: 17 },
    { id: 'b3', projectSlug: 'acme-coding',   slug: 'sprint-3', name: 'Sprint 3 - APIs & Auth',         target: 15, deadline: '2026-06-10', status: 'in-progress', tasks: 15 },
    /* Data Pipelines */
    { id: 'b4', projectSlug: 'data-pipelines', slug: 'pandas-basic',  name: 'Pandas - Basic Transforms', target: 12, deadline: '2026-05-31', status: 'in-progress', tasks: 12 },
    { id: 'b5', projectSlug: 'data-pipelines', slug: 'spark-onboard', name: 'Spark Onboarding',          target: 16, deadline: '2026-06-30', status: 'open', tasks: 16 },
    /* Web Tooling */
    { id: 'b6', projectSlug: 'web-tooling',    slug: 'bugfix-1',      name: 'FastAPI Bug-Fix Pack',      target: 12, deadline: '2026-03-15', status: 'closed', tasks: 12 },
  ];

  const deliveryBatches = [
    { id: 'db1', batchId: 'b1', name: 'Acme Coding · Sprint 1 · Delivery',  tasksCount: 12, deliveredAt: '2026-05-02', recipient: 'Acme Corp',     status: 'delivered' },
    { id: 'db2', batchId: 'b2', name: 'Acme Coding · Sprint 2 · Pilot',     tasksCount: 6,  deliveredAt: null,         recipient: 'Acme Corp',     status: 'staged' },
    { id: 'db3', batchId: 'b6', name: 'Web Tooling · Bug-Fix Pack',         tasksCount: 12, deliveredAt: '2026-03-18', recipient: 'BetaScale Inc.', status: 'delivered' },
  ];

  /* Skill lifecycle - one row per skill in the registry plus version history.
     state: draft | published | deprecated | archived. */
  const skillLifecycle = [
    {
      id: 'parse-csv-safely',
      name: 'Parse CSV safely',
      author: 'platform',
      state: 'published',
      currentVersion: '1.3.0',
      usageTasks: 28,
      usageJobs: 47,
      pendingChanges: 0,
      history: [
        { version: '1.3.0', publishedAt: '2026-04-22', author: 'Priya Kapoor', changes: 'Add encoding fallback chain.' },
        { version: '1.2.1', publishedAt: '2026-03-09', author: 'Jane Doe',     changes: 'Tighten on_bad_lines guidance.' },
        { version: '1.0.0', publishedAt: '2026-01-18', author: 'platform',     changes: 'Initial publish.' },
      ],
    },
    {
      id: 'format-json-output',
      name: 'Format JSON output',
      author: 'platform',
      state: 'published',
      currentVersion: '2.0.0',
      usageTasks: 41,
      usageJobs: 63,
      pendingChanges: 0,
      history: [
        { version: '2.0.0', publishedAt: '2026-05-01', author: 'Sam Allen', changes: 'Breaking - require sort_keys=True.' },
        { version: '1.0.0', publishedAt: '2026-02-04', author: 'platform',  changes: 'Initial publish.' },
      ],
    },
    {
      id: 'design-fastapi-routes',
      name: 'Design FastAPI routes',
      author: 'platform',
      state: 'published',
      currentVersion: '1.1.0',
      usageTasks: 14,
      usageJobs: 22,
      pendingChanges: 1,
      history: [
        { version: '1.1.0', publishedAt: '2026-03-30', author: 'Jane Doe',  changes: 'Add response_model guidance.' },
        { version: '1.0.0', publishedAt: '2026-02-22', author: 'platform',  changes: 'Initial publish.' },
      ],
    },
    {
      id: 'handle-pdf-extraction',
      name: 'Handle PDF extraction',
      author: 'jane@my-org.com',
      state: 'draft',
      currentVersion: '0.1.0',
      usageTasks: 0,
      usageJobs: 0,
      pendingChanges: 0,
      history: [
        { version: '0.1.0', publishedAt: null, author: 'Jane Doe', changes: 'New skill, drafting.' },
      ],
    },
    {
      id: 'spark-onboarding-v0',
      name: 'Spark onboarding (legacy)',
      author: 'platform',
      state: 'deprecated',
      currentVersion: '0.9.0',
      usageTasks: 3,
      usageJobs: 12,
      pendingChanges: 0,
      replacedBy: 'spark-onboarding-v1',
      history: [
        { version: '0.9.0', publishedAt: '2025-11-04', author: 'platform', changes: 'Deprecated in favor of spark-onboarding-v1.' },
      ],
    },
    {
      id: 'aws-cli-2024',
      name: 'AWS CLI v2 patterns (2024)',
      author: 'platform',
      state: 'archived',
      currentVersion: '0.8.0',
      usageTasks: 0,
      usageJobs: 0,
      pendingChanges: 0,
      history: [
        { version: '0.8.0', publishedAt: '2024-09-09', author: 'platform', changes: 'Initial publish.' },
      ],
    },
  ];

  /* The user is currently "in" this workspace. The nav workspace switcher
     reads from this list. `current` flag drives the dropdown highlight. */
  const workspaces = [
    { projectSlug: 'acme-coding',   batchSlug: 'sprint-3',     label: 'Acme Coding / Sprint 3',     subtitle: '15 tasks, 8 in progress', current: true },
    { projectSlug: 'acme-coding',   batchSlug: 'sprint-2',     label: 'Acme Coding / Sprint 2',     subtitle: '17 tasks, 4 in review',   current: false },
    { projectSlug: 'data-pipelines',batchSlug: 'pandas-basic', label: 'Data Pipelines / Pandas',    subtitle: '12 tasks, 6 published',   current: false },
    { projectSlug: 'web-tooling',   batchSlug: 'bugfix-1',     label: 'Web Tooling / Bug-Fix Pack', subtitle: '12 tasks, delivered',      current: false },
  ];

  const templates = [
    { id: 'python-script', name: 'Python Script',  desc: 'A single python file plus tests.',         icon: 'code',     popular: true },
    { id: 'web-app',       name: 'Web App',        desc: 'A FastAPI or Flask backend with tests.',   icon: 'globe',    popular: false },
    { id: 'cli-tool',      name: 'CLI Tool',       desc: 'A bash or Python CLI plus tests.',         icon: 'terminal', popular: true },
    { id: 'data-analysis', name: 'Data Analysis',  desc: 'Pandas / numpy task with sample data.',    icon: 'chart',    popular: true },
    { id: 'bug-fix',       name: 'Bug Fix',        desc: 'Fix code in an existing repository.',      icon: 'bug',      popular: false },
    { id: 'custom',        name: 'Custom',         desc: 'Start from a blank task.',                 icon: 'blank',    popular: false },
  ];

  const criteriaLibrary = [
    { id: 'file_exists',          group: 'Files',     name: 'File exists',           desc: 'Check that a file is present at a path.',        weight: 1.0 },
    { id: 'file_contains',        group: 'Files',     name: 'File contains text',    desc: 'A file contains an exact string.',               weight: 1.0 },
    { id: 'file_contains_regex',  group: 'Files',     name: 'File matches pattern',  desc: 'A file matches a regular expression.',           weight: 1.0 },
    { id: 'files_equal',          group: 'Files',     name: 'Files are equal',       desc: 'Two files have identical content.',              weight: 1.0 },
    { id: 'command_succeeds',     group: 'Commands',  name: 'Command succeeds',      desc: 'A shell command exits with code 0.',             weight: 1.0 },
    { id: 'command_output',       group: 'Commands',  name: 'Command output matches',desc: 'A command\u2019s stdout matches expected text.', weight: 1.0 },
    { id: 'json_key_equals',      group: 'Data',      name: 'JSON key equals',       desc: 'A key in a JSON file equals a value.',           weight: 1.0 },
    { id: 'csv_cell_equals',      group: 'Data',      name: 'CSV cell equals',       desc: 'A cell in a CSV file equals a value.',           weight: 1.0 },
    { id: 'llm_judge',            group: 'AI judges', name: 'LLM judge',             desc: 'An LLM rates the work on a rubric.',             weight: 2.0 },
    { id: 'agent_judge',          group: 'AI judges', name: 'Agent judge',           desc: 'An agent explores the filesystem and judges.',   weight: 2.0 },
  ];

  /* Shared, org-wide skill library. The prompter can attach any of these
     to a task, or author a new skill. Each entry is the markdown the agent
     will be shown. Skills are deployed to environment/skills/<id>/SKILL.md
     inside the Harbor task. */
  const skillsLibrary = [
    {
      id: 'parse-csv-safely',
      name: 'Parse CSV safely',
      author: 'platform',
      desc: 'Robustly parse a CSV file with pandas, handling encoding errors and ragged rows.',
      tags: ['python', 'pandas', 'io'],
      md: `# Parse CSV safely

When a task asks you to read a CSV file, prefer:

\`\`\`python
import pandas as pd
df = pd.read_csv(path, encoding='utf-8', engine='python', on_bad_lines='skip')
\`\`\`

Then validate column names with \`df.columns.tolist()\` before using them.`,
    },
    {
      id: 'format-json-output',
      name: 'Format JSON output',
      author: 'platform',
      desc: 'Always emit JSON with a deterministic key order and 2-space indent.',
      tags: ['python', 'json', 'output'],
      md: `# Format JSON output

When writing JSON, sort keys and use 2-space indent:

\`\`\`python
import json
json.dump(data, f, indent=2, sort_keys=True)
\`\`\`

This makes tests deterministic across runs.`,
    },
    {
      id: 'design-fastapi-routes',
      name: 'Design FastAPI routes',
      author: 'platform',
      desc: 'Convention for naming, response models, and error handling in FastAPI.',
      tags: ['python', 'fastapi', 'web'],
      md: `# Design FastAPI routes

- Use plural nouns: \`/books\`, \`/users\`.
- Return Pydantic models, not dicts.
- Raise \`HTTPException(status_code=...)\` for errors.`,
    },
    {
      id: 'write-pytest-tests',
      name: 'Write pytest tests',
      author: 'platform',
      desc: 'Where to put tests and how to name them so they get discovered.',
      tags: ['python', 'pytest'],
      md: `# Write pytest tests

- Place tests under \`tests/\` named \`test_*.py\`.
- Each test function must start with \`test_\`.
- Use fixtures for shared setup.`,
    },
    {
      id: 'commit-message-style',
      name: 'Commit message style',
      author: 'platform',
      desc: 'Use Conventional Commits with a clear scope.',
      tags: ['git', 'process'],
      md: `# Commit message style

Use Conventional Commits: \`feat(scope): summary\`, \`fix(scope): summary\`, etc.`,
    },
    {
      id: 'safe-shell-scripting',
      name: 'Safe shell scripting',
      author: 'platform',
      desc: 'Set strict mode and quote variables.',
      tags: ['bash', 'shell'],
      md: `# Safe shell scripting

Always start scripts with:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
\`\`\`

Quote all variable expansions: \`"$var"\`.`,
    },
  ];

  const agents = [
    { id: 'claude-code', name: 'claude-code', models: ['anthropic/claude-sonnet-4-5', 'anthropic/claude-opus-4-1'] },
    { id: 'cursor-cli',  name: 'cursor-cli',  models: ['cursor/claude-opus-4-7-high', 'cursor/gpt-5'] },
    { id: 'codex',       name: 'codex',       models: ['openai/gpt-5', 'openai/gpt-4o'] },
    { id: 'gemini-cli',  name: 'gemini-cli',  models: ['google/gemini-2.5-pro'] },
    { id: 'aider',       name: 'aider',       models: ['anthropic/claude-sonnet-4-5'] },
  ];

  /* The relay lifecycle for a task:
       prompter-draft -> ready-for-test -> tester-in-progress -> in-review
       -> changes-requested (loops back to prompter or tester) -> approved
       -> published -> archived. */
  const tasks = [
    {
      id: 't1',
      name: 'my-org/text-stats-pipeline',
      description: 'Build a Python pipeline that analyzes text and emits JSON.',
      status: 'published',
      difficulty: 'medium',
      category: 'programming',
      keywords: ['python', 'pandas', 'json'],
      prompter: users.prompter,
      tester:   users.tester,
      updatedAt: '2 days ago',
      template: 'python-script',
      hasSkills: true,
      skillsCount: 2,
      oraclePassed: true,
      oracleReward: 1.0,
    },
    {
      id: 't2',
      name: 'my-org/csv-validator',
      description: 'Validate the schema of a CSV file using pandera.',
      status: 'changes-requested',
      difficulty: 'medium',
      category: 'programming',
      keywords: ['python', 'pandas', 'validation'],
      prompter: users.prompter,
      tester:   users.tester,
      updatedAt: '1 hour ago',
      template: 'data-analysis',
      hasSkills: true,
      skillsCount: 1,
      oraclePassed: true,
      oracleReward: 1.0,
      comments: 2,
    },
    {
      id: 't3',
      name: 'my-org/regex-builder',
      description: 'Write a regex that matches a set of given inputs.',
      status: 'in-review',
      difficulty: 'easy',
      category: 'programming',
      keywords: ['regex', 'python'],
      prompter: users.prompter,
      tester:   users.tester,
      updatedAt: '3 hours ago',
      template: 'python-script',
      hasSkills: false,
      skillsCount: 0,
      oraclePassed: true,
      oracleReward: 1.0,
    },
    {
      id: 't4',
      name: 'my-org/json-formatter',
      description: 'Build a CLI that pretty-prints JSON.',
      status: 'prompter-draft',
      difficulty: 'easy',
      category: 'programming',
      keywords: ['cli', 'json'],
      prompter: users.prompter,
      tester:   null,
      updatedAt: 'just now',
      template: 'cli-tool',
      hasSkills: true,
      skillsCount: 1,
      oraclePassed: false,
    },
    {
      id: 't5',
      name: 'my-org/fastapi-book-library',
      description: 'A small FastAPI service for a book library.',
      status: 'ready-for-test',
      difficulty: 'hard',
      category: 'programming',
      keywords: ['fastapi', 'python', 'rest'],
      prompter: users.prompter,
      tester: null,
      updatedAt: 'yesterday',
      template: 'web-app',
      hasSkills: true,
      skillsCount: 1,
      oraclePassed: false,
    },
    {
      id: 't6',
      name: 'my-org/markdown-toc-builder',
      description: 'Build a CLI that generates a TOC for a Markdown file.',
      status: 'tester-in-progress',
      difficulty: 'easy',
      category: 'programming',
      keywords: ['cli', 'markdown'],
      prompter: users.prompter,
      tester:   users.tester,
      updatedAt: '4 hours ago',
      template: 'cli-tool',
      hasSkills: false,
      skillsCount: 0,
      oraclePassed: false,
    },
    {
      id: 't7',
      name: 'my-org/sort-implementations',
      description: 'Implement quicksort and mergesort with unit tests.',
      status: 'approved',
      difficulty: 'medium',
      category: 'programming',
      keywords: ['python', 'algorithms'],
      prompter: users.prompter,
      tester:   users.tester,
      updatedAt: 'yesterday',
      template: 'python-script',
      hasSkills: false,
      skillsCount: 0,
      oraclePassed: true,
      oracleReward: 1.0,
    },
  ];

  /* Status display metadata - mapping the relay lifecycle to UI pills. */
  const STATUS = {
    'prompter-draft':     { label: 'Prompter draft',     cls: 'pill-draft',      owner: 'prompter' },
    'ready-for-test':     { label: 'Ready for tester',   cls: 'pill-running',    owner: 'tester' },
    'tester-in-progress': { label: 'Tester in progress', cls: 'pill-running',    owner: 'tester' },
    'in-review':          { label: 'In review',          cls: 'pill-review',     owner: 'reviewer' },
    'changes-requested':  { label: 'Changes requested',  cls: 'pill-changes',    owner: 'prompter' },
    'approved':           { label: 'Approved',           cls: 'pill-approved',   owner: 'admin' },
    'published':          { label: 'Published',          cls: 'pill-published',  owner: null },
    'archived':           { label: 'Archived',           cls: 'pill-archived',   owner: null },
  };

  /* The task being authored in the wizard. Captures everything the
     prompter and tester contribute - some sections start empty for the
     tester to fill in. */
  const wizardTask = {
    name: 'my-org/text-stats-pipeline',
    description: 'Build a Python pipeline that analyzes text and emits JSON.',
    difficulty: 'medium',
    category: 'programming',
    keywords: ['python', 'pandas', 'json'],
    template: 'python-script',
    instructionMd: `# Text Statistics Pipeline

Create two files in \`/app\`:

1. \`textstats.py\` with two functions:
   - \`word_count(text: str) -> int\`
   - \`most_common(text: str) -> str\`
2. \`analyze.py\` that reads \`sample.txt\` and writes \`results.json\` with the form:

\`\`\`json
{
  "word_count": 42,
  "most_common": "the"
}
\`\`\`

The file \`sample.txt\` is already in \`/app\` for you to analyze.`,
    skills: [
      {
        id: 'parse-csv-safely',
        name: 'Parse CSV safely',
        origin: 'library',
        md: skillsLibrary[0].md,
      },
      {
        id: 'format-json-output',
        name: 'Format JSON output',
        origin: 'library',
        md: skillsLibrary[1].md,
      },
    ],
    environment: {
      os: 'Ubuntu 24.04',
      languages: [{ name: 'Python', version: '3.12' }],
      packages: [
        { name: 'pandas', version: '2.2' },
        { name: 'numpy', version: '1.26' },
        { name: 'pytest', version: '8.4' },
      ],
      files: [{ name: 'sample.txt', size: '12 KB' }],
      cpus: 1,
      memoryGB: 2,
      storageGB: 10,
      internet: true,
    },
    criteria: [
      {
        name: 'Structure', weight: 1.0,
        items: [
          { kind: 'file_exists',   label: 'File exists',         config: 'Path: /app/textstats.py',       weight: 1.0 },
          { kind: 'file_exists',   label: 'File exists',         config: 'Path: /app/analyze.py',         weight: 1.0 },
          { kind: 'file_contains', label: 'File contains text',  config: 'In /app/textstats.py, must contain "def word_count"', weight: 1.0 },
        ],
      },
      {
        name: 'Correctness', weight: 2.0,
        items: [
          { kind: 'command_succeeds',  label: 'Command succeeds',   config: 'python /app/analyze.py',                                weight: 1.0 },
          { kind: 'json_key_equals',   label: 'JSON key equals',    config: 'In /app/results.json: word_count = 42',                 weight: 1.0 },
          { kind: 'json_key_equals',   label: 'JSON key equals',    config: 'In /app/results.json: most_common = "the"',             weight: 1.0 },
        ],
      },
      {
        name: 'Quality', weight: 1.0,
        items: [
          { kind: 'llm_judge', label: 'LLM judge',
            config: 'Judge: anthropic/claude-sonnet-4-5\nRubric: "Is the code readable, well-named, and idiomatic Python?"\nScore: Likert 1-5',
            weight: 1.0 },
        ],
      },
    ],
    solution: {
      files: [
        { name: 'solve.sh', size: '0.2 KB',
          content: `#!/usr/bin/env bash
set -euo pipefail
cd /app
cat > textstats.py <<'PY'
from collections import Counter

def word_count(text: str) -> int:
    return len(text.split())

def most_common(text: str) -> str:
    words = text.lower().split()
    if not words:
        return ""
    return Counter(words).most_common(1)[0][0]
PY

cat > analyze.py <<'PY'
import json
from pathlib import Path
from textstats import word_count, most_common

text = Path("/app/sample.txt").read_text()
out = {"word_count": word_count(text), "most_common": most_common(text)}
Path("/app/results.json").write_text(json.dumps(out, indent=2, sort_keys=True))
PY

python /app/analyze.py
` },
        { name: 'textstats.py', size: '0.4 KB',
          content: `from collections import Counter

def word_count(text: str) -> int:
    return len(text.split())

def most_common(text: str) -> str:
    words = text.lower().split()
    if not words:
        return ""
    return Counter(words).most_common(1)[0][0]
` },
        { name: 'analyze.py', size: '0.3 KB',
          content: `import json
from pathlib import Path
from textstats import word_count, most_common

text = Path("/app/sample.txt").read_text()
out = {"word_count": word_count(text), "most_common": most_common(text)}
Path("/app/results.json").write_text(json.dumps(out, indent=2, sort_keys=True))
` },
      ],
    },
  };

  const evalJobs = [
    {
      id: 'j2025',
      name: 'skill-bench-v1 x 2 agents x A-B',
      dataset: 'my-org/skill-bench-v1',
      taskCount: 47,
      agents: ['claude-code', 'cursor-cli'],
      attempts: 3,
      skillMode: 'both',
      status: 'running',
      progress: 0.66,
      passRates: { 'claude-code': 0.78, 'cursor-cli': 0.61 },
      startedAt: '15 min ago',
      cost: '$28.40',
    },
    {
      id: 'j2024',
      name: 'skill-bench-v1 x claude-code (with-skills)',
      dataset: 'my-org/skill-bench-v1',
      taskCount: 47,
      agents: ['claude-code'],
      attempts: 3,
      skillMode: 'with',
      status: 'completed',
      progress: 1.0,
      passRates: { 'claude-code': 0.82 },
      startedAt: 'yesterday',
      cost: '$21.10',
    },
    {
      id: 'j2023',
      name: 'codex baseline (without-skills)',
      dataset: 'my-org/skill-bench-v1',
      taskCount: 47,
      agents: ['codex'],
      attempts: 1,
      skillMode: 'without',
      status: 'completed',
      progress: 1.0,
      passRates: { codex: 0.45 },
      startedAt: '3 days ago',
      cost: '$8.90',
    },
  ];

  /* Per-trial results for the comparison + drilldown views.
     We track per-skill-mode results so the evaluator can see the lift. */
  const compareRows = [
    { task: 'text-stats-pipeline',  hasSkills: true,  agents: { 'claude-code': { with: 1.00, without: 0.67 }, 'cursor-cli': { with: 0.67, without: 0.33 } } },
    { task: 'csv-validator',        hasSkills: true,  agents: { 'claude-code': { with: 0.50, without: 0.50 }, 'cursor-cli': { with: 0.50, without: 0.50 } } },
    { task: 'regex-builder',        hasSkills: false, agents: { 'claude-code': { with: 1.00, without: 1.00 }, 'cursor-cli': { with: 1.00, without: 1.00 } } },
    { task: 'json-formatter',       hasSkills: true,  agents: { 'claude-code': { with: 0.66, without: 0.33 }, 'cursor-cli': { with: 0.83, without: 0.50 } } },
    { task: 'fastapi-book-library', hasSkills: true,  agents: { 'claude-code': { with: 0.80, without: 0.50 }, 'cursor-cli': { with: 0.60, without: 0.40 } } },
    { task: 'markdown-toc-builder', hasSkills: false, agents: { 'claude-code': { with: 1.00, without: 1.00 }, 'cursor-cli': { with: 0.66, without: 0.66 } } },
    { task: 'sort-implementations', hasSkills: false, agents: { 'claude-code': { with: 0.75, without: 0.75 }, 'cursor-cli': { with: 0.50, without: 0.50 } } },
    { task: 'http-status-router',   hasSkills: true,  agents: { 'claude-code': { with: 0.66, without: 0.50 }, 'cursor-cli': { with: 0.83, without: 0.66 } } },
  ];

  /* Trajectory for the trial drilldown view. */
  const trajectory = {
    agent: 'claude-code',
    model: 'anthropic/claude-sonnet-4-5',
    task: 'csv-validator',
    skillMode: 'with',
    skillsLoaded: ['parse-csv-safely'],
    reward: 0.5,
    runtime: '1m 30s',
    status: 'partial-credit',
    rewardBreakdown: [
      { name: 'Structure',   value: 1.0, max: 1.0 },
      { name: 'Correctness', value: 0.0, max: 1.0, note: 'Missing column check' },
      { name: 'Quality',     value: 0.5, max: 1.0 },
    ],
    turns: [
      { role: 'user', content: 'Build a CSV validator that checks the schema of /app/sample.csv (columns: id, name, age, email). Write your validator as /app/validate.py.' },
      { role: 'assistant', content: 'I will start by reading the parse-csv-safely skill and then inspecting the input.', toolCalls: [{ name: 'read_file', args: { path: '/skills/parse-csv-safely/SKILL.md' }, output: '# Parse CSV safely\n\nUse pandas with on_bad_lines=skip ...' }] },
      { role: 'assistant', content: 'Now reading the data file.', toolCalls: [{ name: 'read_file', args: { path: '/app/sample.csv' }, output: 'id,name,age,email\n1,Alice,30,alice@x.com\n2,Bob,28,bob@y.com\n' }] },
      { role: 'assistant', content: 'Creating the validator using pandas.', toolCalls: [{ name: 'write_file', args: { path: '/app/validate.py' }, output: 'wrote 612 bytes' }] },
      { role: 'assistant', content: 'Let me run it to confirm it works.', toolCalls: [{ name: 'run_command', args: { cmd: 'python /app/validate.py' }, output: 'OK\n' }] },
      { role: 'assistant', content: 'The validator works on the sample. I will stop here.' },
    ],
  };

  /* Comments thread for the reviewer workspace. */
  const reviewComments = [
    { author: users.reviewer, when: '5 min ago', body: 'Nice task overall. Could you add the expected JSON schema to the instruction?' },
    { author: users.prompter, when: '3 min ago', body: 'Done - updated the instruction with a sample JSON block.' },
    { author: users.tester,   when: '2 min ago', body: 'Re-ran Oracle after the prompt update: still passes 1.0.' },
  ];

  /* ----------------------------------------------------------------------
     Harbor file generation. Turns a task (or partial task) into the file
     contents that would land in the Harbor task folder. Used everywhere a
     "Harbor preview" is rendered. */

  function tomlEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function makeTaskToml(t) {
    const oracleStatus = t.oraclePassed ? 'passed' : 'pending';
    const oracleReward = t.oracleReward != null ? t.oracleReward.toFixed(2) : '0.00';
    const tags = (t.keywords || []).map(k => `"${tomlEscape(k)}"`).join(', ');
    return `[package]
name = "${t.name}"
version = "1.0"
description = "${tomlEscape(t.description || '')}"
category = "${t.category || 'programming'}"
difficulty = "${t.difficulty || 'medium'}"
authors = ["${t.prompter ? t.prompter.email : ''}", "${t.tester ? t.tester.email : ''}"]
tags = [${tags}]

[verifier]
test_script = "tests/test.sh"
timeout_sec = 600

[agent]
timeout_sec = 1200

[environment]
dockerfile = "environment/Dockerfile"
${(t.skills && t.skills.length) ? 'skills_dir = "/skills"' : '# skills_dir = (none)'}
internet = ${t.environment ? t.environment.internet : true}

[resources]
cpus = ${t.environment ? t.environment.cpus : 1}
memory_gb = ${t.environment ? t.environment.memoryGB : 2}
storage_gb = ${t.environment ? t.environment.storageGB : 10}

[oracle]
status = "${oracleStatus}"
last_reward = ${oracleReward}
`;
  }

  function makeDockerfile(t) {
    const env = t.environment || { os: 'Ubuntu 24.04', languages: [{ name: 'Python', version: '3.12' }], packages: [] };
    const pyVersion = (env.languages && env.languages[0] && env.languages[0].version) || '3.12';
    const pkgsLine = (env.packages || []).map(p => `${p.name}==${p.version}`).join(' ');
    return `FROM ubuntu:${env.os.split(' ')[1] || '24.04'}
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \\
    python${pyVersion} python3-pip && rm -rf /var/lib/apt/lists/*
${pkgsLine ? `RUN pip install --no-cache-dir ${pkgsLine}\n` : ''}${(env.files || []).map(f => `COPY ${f.name} /app/`).join('\n')}
`;
  }

  function makeTestSh(t) {
    const cats = (t.criteria || []).map(c => {
      const items = c.items.map(it => `    # ${it.label}: ${it.config.replace(/\n/g, ' / ')}`).join('\n');
      return `  # category: ${c.name} (weight ${c.weight})\n${items}`;
    }).join('\n\n');
    return `#!/usr/bin/env bash
set -euo pipefail

# Skill Bench generated verifier - runs Reward Kit criteria.
# The reward is written to /logs/verifier/reward.json by reward-kit.

pip install --quiet reward-kit pytest pandas

python -m reward_kit run \\
  --config /tests/rewardkit.yaml \\
  --workdir /app \\
  --output /logs/verifier/reward.json

${cats}
`;
  }

  function makeRewardkitYaml(t) {
    const cats = (t.criteria || []).map(c => {
      const items = c.items.map(it => `      - kind: ${it.kind}\n        weight: ${it.weight}\n        config: |\n          ${it.config.replace(/\n/g, '\n          ')}`).join('\n');
      return `  - name: ${c.name}\n    weight: ${c.weight}\n    items:\n${items}`;
    }).join('\n');
    return `version: 1
categories:
${cats}
`;
  }

  function makeInstruction(t) {
    return t.instructionMd || '';
  }

  /* Returns an object describing the Harbor folder for a task.
     Each node has { type: 'dir'|'file', path, label, content, language }. */
  function harborFiles(t) {
    const out = [
      { type: 'file', path: 'task.toml',        label: 'task.toml',                content: makeTaskToml(t),     language: 'toml',     owner: 'shared' },
      { type: 'file', path: 'instruction.md',   label: 'instruction.md',           content: makeInstruction(t),  language: 'markdown', owner: 'prompter' },
      { type: 'dir',  path: 'environment',      label: 'environment/' },
      { type: 'file', path: 'environment/Dockerfile', label: 'Dockerfile',         content: makeDockerfile(t),   language: 'docker',   owner: 'tester' },
    ];
    if (t.skills && t.skills.length) {
      out.push({ type: 'dir', path: 'environment/skills', label: 'skills/' });
      for (const s of t.skills) {
        out.push({ type: 'dir',  path: 'environment/skills/' + s.id, label: s.id + '/' });
        out.push({
          type: 'file',
          path: 'environment/skills/' + s.id + '/SKILL.md',
          label: 'SKILL.md',
          content: '---\nname: ' + s.id + '\ndescription: ' + (s.name || s.id) + '\n---\n\n' + s.md,
          language: 'markdown',
          owner: 'prompter',
        });
      }
    }
    out.push({ type: 'dir',  path: 'tests',            label: 'tests/' });
    out.push({ type: 'file', path: 'tests/test.sh',    label: 'test.sh',       content: makeTestSh(t),       language: 'bash', owner: 'tester' });
    out.push({ type: 'file', path: 'tests/rewardkit.yaml', label: 'rewardkit.yaml', content: makeRewardkitYaml(t), language: 'yaml', owner: 'tester' });
    out.push({ type: 'dir',  path: 'solution',         label: 'solution/' });
    if (t.solution && t.solution.files) {
      for (const f of t.solution.files) {
        out.push({
          type: 'file',
          path: 'solution/' + f.name,
          label: f.name,
          content: f.content || '',
          language: f.name.endsWith('.sh') ? 'bash' : f.name.endsWith('.py') ? 'python' : 'text',
          owner: 'prompter',
        });
      }
    } else {
      out.push({ type: 'file', path: 'solution/solve.sh', label: 'solve.sh', content: '#!/usr/bin/env bash\n# Solution not yet provided\nexit 1\n', language: 'bash', owner: 'prompter' });
    }
    return out;
  }

  return {
    users,
    templates,
    criteriaLibrary,
    skillsLibrary,
    agents,
    tasks,
    wizardTask,
    evalJobs,
    compareRows,
    trajectory,
    reviewComments,
    STATUS,
    harborFiles,
    /* V3 additions */
    projects,
    batches,
    deliveryBatches,
    workspaces,
    skillLifecycle,
  };
})();
