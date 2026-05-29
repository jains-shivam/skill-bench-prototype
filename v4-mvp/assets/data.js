/* Skill Bench MVP - mock data (relay model).
   Trainer = domain expert (plain language only).
   Tester  = software developer (env + solution + tests + Oracle).
   Reviewer = quality gate. Admin = observability + template catalog. */

window.SBData = (function () {

  const users = {
    trainer:  { id: 'u1', name: 'Jane Doe',     email: 'jane@my-org.com',  role: 'Trainer',  initials: 'JD' },
    tester:   { id: 'u2', name: 'Tara Wu',      email: 'tara@my-org.com',  role: 'Tester',   initials: 'TW' },
    reviewer: { id: 'u3', name: 'Bob Smith',    email: 'bob@my-org.com',   role: 'Reviewer', initials: 'BS' },
    admin:    { id: 'u4', name: 'Dave Patel',   email: 'dave@my-org.com',  role: 'Admin',    initials: 'DP' },
  };

  const allUsers = [
    { ...users.admin,    lastSeen: 'just now',  tasksCount: 0, role: 'Admin' },
    { ...users.reviewer, lastSeen: '5 min ago', tasksCount: 0, role: 'Reviewer' },
    { ...users.tester,   lastSeen: '2 min ago', tasksCount: 8, role: 'Tester' },
    { ...users.trainer,  lastSeen: '1 min ago', tasksCount: 6, role: 'Trainer' },
    { id: 'u5', name: 'Aisha Khan',  email: 'aisha@my-org.com', role: 'Trainer', initials: 'AK', lastSeen: 'yesterday', tasksCount: 3 },
    { id: 'u6', name: 'Marco Silva', email: 'marco@my-org.com', role: 'Tester',  initials: 'MS', lastSeen: '3 hours ago', tasksCount: 5 },
  ];

  /* Environment templates - curated by Admin; Tester picks one (default path). */
  const templates = [
    {
      id: 'python-3.12-pytest',
      name: 'Python 3.12 + pytest',
      desc: 'Standard Python sandbox with pytest. Good for single-file scripts and small projects.',
      tags: ['python', 'pytest'],
      resources: { cpus: 1, memoryGB: 2, storageGB: 10, internet: true, gpu: false },
      dockerfile: `FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir pytest==8.4
ENV PYTHONUNBUFFERED=1
`,
    },
    {
      id: 'python-3.12-pandas',
      name: 'Python 3.12 + pandas',
      desc: 'Data analysis stack: pandas, numpy, pytest. For CSV/JSON transform tasks.',
      tags: ['python', 'pandas', 'data'],
      resources: { cpus: 2, memoryGB: 4, storageGB: 10, internet: true, gpu: false },
      dockerfile: `FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir pandas==2.2 numpy==1.26 pytest==8.4
ENV PYTHONUNBUFFERED=1
`,
    },
    {
      id: 'node-20-jest',
      name: 'Node 20 + Jest',
      desc: 'Node.js LTS with Jest. For JavaScript/TypeScript CLI or small services.',
      tags: ['node', 'javascript', 'jest'],
      resources: { cpus: 1, memoryGB: 2, storageGB: 10, internet: true, gpu: false },
      dockerfile: `FROM node:20-bookworm-slim
WORKDIR /app
RUN npm install -g jest@29
ENV NODE_ENV=development
`,
    },
    {
      id: 'bash-cli',
      name: 'Bash / CLI',
      desc: 'Minimal Ubuntu with bash and coreutils. For shell scripting tasks.',
      tags: ['bash', 'shell', 'cli'],
      resources: { cpus: 1, memoryGB: 1, storageGB: 5, internet: false, gpu: false },
      dockerfile: `FROM debian:12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends bash coreutils grep sed awk && rm -rf /var/lib/apt/lists/*
`,
    },
    {
      id: 'playwright-browser',
      name: 'Playwright (browser)',
      desc: 'Headless Chromium via Playwright + Python. For web automation tasks.',
      tags: ['python', 'playwright', 'browser'],
      resources: { cpus: 2, memoryGB: 4, storageGB: 15, internet: true, gpu: false },
      dockerfile: `FROM mcr.microsoft.com/playwright/python:v1.45.0-jammy
WORKDIR /app
RUN pip install --no-cache-dir pytest==8.4
ENV PYTHONUNBUFFERED=1
`,
    },
    {
      id: 'ml-gpu',
      name: 'Python ML (GPU)',
      desc: 'CUDA runtime with PyTorch. For heavier ML tasks (use sparingly).',
      tags: ['python', 'ml', 'gpu', 'pytorch'],
      resources: { cpus: 4, memoryGB: 16, storageGB: 50, internet: true, gpu: true },
      dockerfile: `FROM nvidia/cuda:12.4.0-runtime-ubuntu22.04
RUN apt-get update && apt-get install -y --no-install-recommends python3.11 python3-pip && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN pip install --no-cache-dir torch==2.4.0 pytest==8.4 --index-url https://download.pytorch.org/whl/cu124
`,
    },
  ];

  const STATUS = {
    'trainer-draft':     { label: 'Draft',             cls: 'pill-draft',     owner: 'trainer' },
    'with-tester':       { label: 'With tester',       cls: 'pill-running',   owner: 'tester' },
    'in-review':         { label: 'In review',         cls: 'pill-review',    owner: 'reviewer' },
    'changes-requested': { label: 'Changes requested', cls: 'pill-changes',   owner: null },
    'approved':          { label: 'Approved',          cls: 'pill-approved',  owner: 'admin' },
    'published':         { label: 'Published',         cls: 'pill-published', owner: null },
  };

  const SAMPLE_INSTRUCTION = `# Text Statistics Pipeline

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

The file \`sample.txt\` is already in \`/app\` for you to analyze.
`;

  const SAMPLE_CRITERIA = `# Acceptance criteria (plain language)

_Authored by the Trainer. The Tester compiles these into tests/test.sh._

1. **Output file exists** - After the agent runs, \`/app/results.json\` must exist.
2. **word_count** - The JSON field \`word_count\` must be an integer equal to 42 for the bundled sample.txt.
3. **most_common** - The JSON field \`most_common\` must be the string \`"the"\` for the bundled sample.txt.
4. **Code structure** - \`/app/textstats.py\` must define both \`word_count\` and \`most_common\` functions.
5. **Exit code** - Running the analysis must exit with code 0.
`;

  const SAMPLE_GOLDEN_SOLUTION = `# Golden Solution (by Trainer)

## Approach
Read \`sample.txt\`, split into words, count total words, then find the most frequent word using a dictionary/counter.

## Reference implementation (Python)

\`\`\`python
from collections import Counter
from pathlib import Path
import json

text = Path("/app/sample.txt").read_text()
words = text.lower().split()

result = {
    "word_count": len(words),
    "most_common": Counter(words).most_common(1)[0][0]
}

Path("/app/results.json").write_text(json.dumps(result, indent=2))
\`\`\`

## Expected output
\`\`\`json
{"word_count": 42, "most_common": "the"}
\`\`\`
`;

  const SAMPLE_SOLVE_SH = `#!/usr/bin/env bash
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
`;

  const SAMPLE_TEST_SH = `#!/usr/bin/env bash
set -euo pipefail

bash /app/solve.sh

test -f /app/textstats.py
test -f /app/analyze.py
grep -q "def word_count" /app/textstats.py
grep -q "def most_common" /app/textstats.py

python - <<'PY'
import json
data = json.load(open("/app/results.json"))
assert data["word_count"] == 42
assert data["most_common"] == "the"
print("OK")
PY
`;

  const tasks = [
    {
      id: 't1',
      name: 'my-org/text-stats-pipeline',
      description: 'Build a Python pipeline that analyzes text and emits JSON.',
      domain: 'data-analysis',
      difficulty: 'medium',
      status: 'published',
      trainer: users.trainer,
      tester: users.tester,
      templateId: 'python-3.12-pandas',
      updatedAt: '2 days ago',
      instructionMd: SAMPLE_INSTRUCTION,
      criteriaMd: SAMPLE_CRITERIA,
      goldenSolution: SAMPLE_GOLDEN_SOLUTION,
      attachments: [
        { name: 'sample.txt', kind: 'data', size: '12 KB', content: 'The quick brown fox jumps over the lazy dog. The dog slept.\n' },
        { name: 'expected-output.json', kind: 'example', size: '0.1 KB', content: '{"word_count": 42, "most_common": "the"}\n' },
      ],
      dockerfile: templates[1].dockerfile + 'COPY sample.txt /app/\n',
      solveSh: SAMPLE_SOLVE_SH,
      testSh: SAMPLE_TEST_SH,
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '5 days ago', who: 'Jane Doe', event: 'Created draft' },
        { when: '4 days ago', who: 'Jane Doe', event: 'Submitted to tester pool' },
        { when: '4 days ago', who: 'Tara Wu', event: 'Picked up from queue' },
        { when: '3 days ago', who: 'Tara Wu', event: 'Submitted for review (Oracle PASS)' },
        { when: '2 days ago', who: 'Bob Smith', event: 'Approved + published' },
      ],
      comments: [],
    },
    {
      id: 't2',
      name: 'my-org/finance-ebitda-extract',
      description: 'Extract EBITDA from a 10-K filing snippet and return structured JSON.',
      domain: 'finance',
      difficulty: 'hard',
      status: 'with-tester',
      trainer: { id: 'u5', name: 'Aisha Khan', email: 'aisha@my-org.com', role: 'Trainer', initials: 'AK' },
      tester: null,
      templateId: null,
      updatedAt: '1 hour ago',
      instructionMd: '# EBITDA extraction\n\nRead `/app/filing_snippet.txt` (an excerpt from a 10-K). Write `/app/output.json` with a single key `ebitda_millions` (number) representing EBITDA in millions USD for FY2024.',
      criteriaMd: '# Acceptance criteria\n\n1. `output.json` exists and is valid JSON.\n2. `ebitda_millions` equals 145.2 (within 0.1 tolerance).\n3. Solution must not hard-code the answer without reading the filing file.',
      goldenSolution: '# Golden Solution\n\n## Approach\nParse the filing text, find the line containing "EBITDA" near "FY2024", extract the numeric value.\n\n## Expected output\n```json\n{"ebitda_millions": 145.2}\n```\n\n## Hints\n- Use regex to find dollar amounts near EBITDA mentions\n- Convert "$145.2 million" format to numeric 145.2\n',
      attachments: [
        { name: 'filing_snippet.txt', kind: 'data', size: '4 KB', content: '... FY2024 EBITDA was $145.2 million ...\n' },
        { name: 'rough-approach.txt', kind: 'hint', size: '0.5 KB', content: 'Look for "EBITDA" near FY2024 in the snippet. Convert millions.' },
      ],
      dockerfile: '',
      solveSh: '',
      testSh: '',
      oraclePassed: false,
      history: [
        { when: '3 hours ago', who: 'Aisha Khan', event: 'Created draft' },
        { when: '1 hour ago',  who: 'Aisha Khan', event: 'Submitted to tester pool' },
      ],
      comments: [],
    },
    {
      id: 't3',
      name: 'my-org/csv-validator',
      description: 'Validate the schema of a CSV file.',
      domain: 'data-analysis',
      difficulty: 'medium',
      status: 'in-review',
      trainer: users.trainer,
      tester: users.tester,
      templateId: 'python-3.12-pandas',
      updatedAt: '1 hour ago',
      instructionMd: '# CSV Validator\n\nWrite `/app/validate.py` that reads `/app/sample.csv` and verifies columns are: id, name, age, email. Exit 0 on valid, 1 otherwise.',
      criteriaMd: '# Acceptance criteria\n\n1. validate.py exists.\n2. Exits 0 on the bundled sample.csv.\n3. Exits non-zero if a required column is missing.',
      goldenSolution: '# Golden Solution\n\n```python\nimport pandas as pd, sys\ndf = pd.read_csv("/app/sample.csv")\nrequired = ["id", "name", "age", "email"]\nif list(df.columns) == required:\n    print("Valid")\n    sys.exit(0)\nelse:\n    print("Invalid columns")\n    sys.exit(1)\n```\n',
      attachments: [{ name: 'sample.csv', kind: 'data', size: '2 KB', content: 'id,name,age,email\n1,Alice,30,a@x.com\n' }],
      dockerfile: templates[1].dockerfile + 'COPY sample.csv /app/\n',
      solveSh: '#!/usr/bin/env bash\nset -euo pipefail\ncat > /app/validate.py <<\'PY\'\nimport pandas as pd, sys\ndf = pd.read_csv("/app/sample.csv")\nassert list(df.columns) == ["id","name","age","email"]\nprint("OK")\nPY\npython /app/validate.py\n',
      testSh: '#!/usr/bin/env bash\nset -euo pipefail\nbash /app/solve.sh\ntest -f /app/validate.py\n',
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '1 day ago', who: 'Jane Doe', event: 'Submitted to tester pool' },
        { when: '5 hours ago', who: 'Tara Wu', event: 'Picked up' },
        { when: '1 hour ago', who: 'Tara Wu', event: 'Submitted for review' },
      ],
      comments: [
        { author: users.reviewer, when: '20 min ago', body: 'Could you add a row-count check in test.sh?' },
      ],
    },
    {
      id: 't4',
      name: 'my-org/regex-builder',
      description: 'Write a regex that matches a set of given inputs.',
      domain: 'programming',
      difficulty: 'easy',
      status: 'changes-requested',
      changesTarget: 'tester',
      trainer: users.trainer,
      tester: users.tester,
      templateId: 'python-3.12-pytest',
      updatedAt: '3 hours ago',
      instructionMd: '# Regex Builder\n\nWrite `/app/match.py` with `match(s: str) -> bool` that returns True only for emails ending in `@my-org.com`.',
      criteriaMd: '# Acceptance criteria\n\n1. match.py defines match(s).\n2. Returns True for valid emails, False otherwise.\n3. Rejects strings with consecutive dots before @.',
      goldenSolution: '# Golden Solution\n\n```python\nimport re\npattern = r"^[\\w]+(\\.[\\w]+)*@my-org\\.com$"\ndef match(s: str) -> bool:\n    return bool(re.match(pattern, s))\n```\n\nKey: no consecutive dots allowed, only @my-org.com domain.\n',
      attachments: [],
      dockerfile: templates[0].dockerfile,
      solveSh: '#!/usr/bin/env bash\nset -euo pipefail\ncat > /app/match.py <<\'PY\'\nimport re\n_pat = re.compile(r"^[\\w.+-]+@my-org\\.com$")\ndef match(s: str) -> bool:\n    return bool(_pat.match(s))\nPY\n',
      testSh: '#!/usr/bin/env bash\nset -euo pipefail\nbash /app/solve.sh\npython -c "from match import match; assert match(\'a@my-org.com\'); assert not match(\'a@other.com\')"\n',
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '2 days ago', who: 'Tara Wu', event: 'Submitted for review' },
        { when: '3 hours ago', who: 'Bob Smith', event: 'Requested changes (tester)' },
      ],
      comments: [
        { author: users.reviewer, when: '3 hours ago', body: 'Regex is too lax - add tests for edge cases like a..b@my-org.com.' },
      ],
    },
    {
      id: 't5',
      name: 'my-org/marketing-copy-tone',
      description: 'Rewrite product copy to match brand tone guidelines.',
      domain: 'marketing',
      difficulty: 'easy',
      status: 'trainer-draft',
      trainer: users.trainer,
      tester: null,
      templateId: null,
      updatedAt: 'just now',
      instructionMd: '# Brand tone rewrite\n\nRead `/app/draft.txt` and write `/app/rewritten.txt` following the tone guide in `/app/brand-guide.md`.',
      criteriaMd: '# Acceptance criteria\n\n1. rewritten.txt exists.\n2. No exclamation marks.\n3. Uses "you" not "the user".\n4. Under 120 words.',
      goldenSolution: '# Golden Solution\n\nExpected rewritten.txt:\n```\nOur product helps you get more done in less time. You will find it intuitive and reliable.\n```\n\nKey rules applied:\n- Removed all exclamation marks\n- Changed "Users" to "you"\n- Kept under 120 words\n- Friendly, concise tone\n',
      attachments: [
        { name: 'draft.txt', kind: 'data', size: '1 KB', content: 'Our product is great!!! Users will love it.\n' },
        { name: 'brand-guide.md', kind: 'data', size: '2 KB', content: '# Tone\n- Friendly, concise\n- No exclamation marks\n' },
      ],
      dockerfile: '',
      solveSh: '',
      testSh: '',
      oraclePassed: false,
      history: [{ when: 'just now', who: 'Jane Doe', event: 'Created draft' }],
      comments: [],
    },
    {
      id: 't6',
      name: 'my-org/sort-implementations',
      description: 'Implement quicksort and mergesort with unit tests.',
      domain: 'programming',
      difficulty: 'medium',
      status: 'approved',
      trainer: users.trainer,
      tester: users.tester,
      templateId: 'python-3.12-pytest',
      updatedAt: 'yesterday',
      instructionMd: '# Sorting algorithms\n\nImplement quicksort and mergesort in `/app/sorts.py`. Provide pytest tests in `/app/test_sorts.py`.',
      criteriaMd: '# Acceptance criteria\n\n1. Both algorithms implemented.\n2. pytest passes.\n3. Handles empty list.',
      goldenSolution: '# Golden Solution\n\n```python\ndef quicksort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr)//2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)\n\ndef mergesort(arr):\n    if len(arr) <= 1: return arr\n    m = len(arr)//2\n    l, r = mergesort(arr[:m]), mergesort(arr[m:])\n    res = []\n    i = j = 0\n    while i < len(l) and j < len(r):\n        if l[i] <= r[j]: res.append(l[i]); i += 1\n        else: res.append(r[j]); j += 1\n    return res + l[i:] + r[j:]\n```\n',
      attachments: [],
      dockerfile: templates[0].dockerfile,
      solveSh: '#!/usr/bin/env bash\nset -euo pipefail\necho "ok"\n',
      testSh: '#!/usr/bin/env bash\nset -euo pipefail\nbash /app/solve.sh\n',
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '3 days ago', who: 'Bob Smith', event: 'Approved' },
      ],
      comments: [],
    },
  ];

  /* In-progress authoring session (trainer or tester wizards read/write this). */
  const wizardTask = {
    name: 'my-org/text-stats-pipeline',
    description: 'Build a Python pipeline that analyzes text and emits JSON.',
    domain: 'data-analysis',
    difficulty: 'medium',
    instructionMd: SAMPLE_INSTRUCTION,
    criteriaMd: SAMPLE_CRITERIA,
    goldenSolution: SAMPLE_GOLDEN_SOLUTION,
    attachments: [
      { name: 'sample.txt', kind: 'data', size: '12 KB', content: 'The quick brown fox jumps over the lazy dog.\n' },
    ],
    templateId: 'python-3.12-pandas',
    dockerfile: templates[1].dockerfile + 'COPY sample.txt /app/\n',
    solveSh: SAMPLE_SOLVE_SH,
    testSh: SAMPLE_TEST_SH,
    oraclePassed: false,
  };

  function getTemplate(id) {
    return templates.find(t => t.id === id) || null;
  }

  function resolveDockerfile(t) {
    if (t.dockerfile) return t.dockerfile;
    const tpl = getTemplate(t.templateId);
    return tpl ? tpl.dockerfile : '# (no environment yet)\n';
  }

  function tomlEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function makeTaskToml(t) {
    const oracleStatus = t.oraclePassed ? 'passed' : 'pending';
    const oracleReward = t.oracleReward != null ? t.oracleReward.toFixed(2) : '0.00';
    const tpl = getTemplate(t.templateId);
    const res = tpl ? tpl.resources : { cpus: 1, memoryGB: 2, storageGB: 10, internet: true };
    return `[package]
name        = "${tomlEscape(t.name || '')}"
version     = "1.0"
description = "${tomlEscape(t.description || '')}"
domain      = "${tomlEscape(t.domain || '')}"
difficulty  = "${t.difficulty || 'medium'}"
author      = "${t.trainer ? t.trainer.email : ''}"
tester      = "${t.tester ? t.tester.email : ''}"

[verifier]
test_script = "tests/test.sh"
timeout_sec = 600

[environment]
dockerfile = "environment/Dockerfile"
internet   = ${res.internet}

[resources]
cpus       = ${res.cpus}
memory_gb  = ${res.memoryGB}
storage_gb = ${res.storageGB}
gpu        = ${tpl && tpl.resources.gpu ? 'true' : 'false'}

[oracle]
status      = "${oracleStatus}"
last_reward = ${oracleReward}
`;
  }

  function harborFiles(t) {
    const out = [
      { type: 'file', path: 'task.toml', label: 'task.toml', content: makeTaskToml(t), language: 'toml', owner: 'shared' },
      { type: 'file', path: 'instruction.md', label: 'instruction.md', content: t.instructionMd || '', language: 'markdown', owner: 'trainer' },
      { type: 'dir', path: 'environment', label: 'environment/' },
      { type: 'file', path: 'environment/Dockerfile', label: 'Dockerfile', content: resolveDockerfile(t), language: 'docker', owner: 'tester' },
    ];
    if (t.attachments && t.attachments.length) {
      out.push({ type: 'dir', path: 'inputs', label: 'inputs/' });
      for (const a of t.attachments) {
        out.push({
          type: 'file',
          path: 'inputs/' + a.name,
          label: a.name,
          content: a.content || '',
          language: a.name.endsWith('.md') ? 'markdown' : a.name.endsWith('.json') ? 'json' : 'text',
          owner: 'trainer',
        });
      }
    }
    out.push({ type: 'dir', path: 'tests', label: 'tests/' });
    out.push({
      type: 'file',
      path: 'tests/criteria.md',
      label: 'criteria.md',
      content: t.criteriaMd || '# Acceptance criteria\n\n_No criteria yet._\n',
      language: 'markdown',
      owner: 'trainer',
    });
    out.push({
      type: 'file',
      path: 'tests/test.sh',
      label: 'test.sh',
      content: t.testSh || '#!/usr/bin/env bash\n# (tester will compile criteria into this file)\nexit 1\n',
      language: 'bash',
      owner: 'tester',
    });
    out.push({ type: 'dir', path: 'solution', label: 'solution/' });
    out.push({
      type: 'file',
      path: 'solution/golden.md',
      label: 'golden.md',
      content: t.goldenSolution || '# Golden Solution\n\n_Trainer will provide the reference answer here._\n',
      language: 'markdown',
      owner: 'trainer',
    });
    out.push({
      type: 'file',
      path: 'solution/solve.sh',
      label: 'solve.sh',
      content: t.solveSh || '#!/usr/bin/env bash\n# (tester converts golden solution into executable script)\nexit 1\n',
      language: 'bash',
      owner: 'tester',
    });
    return out;
  }

  function getTaskById(id) {
    return tasks.find(t => t.id === id) || null;
  }

  return {
    users,
    allUsers,
    templates,
    STATUS,
    tasks,
    wizardTask,
    harborFiles,
    getTemplate,
    resolveDockerfile,
    getTaskById,
  };
})();
