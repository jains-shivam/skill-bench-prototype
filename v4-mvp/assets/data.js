/* Skill Bench MVP - Data layer (client-side mock).
   7 roles: Super Admin, Admin, Project Manager, Prompter, Domain Expert Reviewer, Tester, Task Reviewer
   7-state lifecycle: prompter-draft → domain-review → with-tester → in-review → changes-requested → approved → published */
const SBData = (function () {
  'use strict';

  /* ───── Roles definition ───── */
  const ROLES = {
    superAdmin:      { key: 'superAdmin',      label: 'Super Admin',      color: 'bg-rose-100 text-rose-700',    desc: 'Full platform control, system settings, user management across all orgs' },
    admin:           { key: 'admin',           label: 'Admin',            color: 'bg-slate-100 text-slate-700',   desc: 'Organization admin, manages team, views analytics' },
    projectManager:  { key: 'projectManager',  label: 'Project Manager',  color: 'bg-cyan-100 text-cyan-700',    desc: 'Assigns tasks, manages batches, monitors progress' },
    prompter:        { key: 'prompter',        label: 'Prompter',         color: 'bg-indigo-100 text-indigo-700', desc: 'Domain expert who creates prompts, verifiers, golden solutions' },
    domainReviewer:  { key: 'domainReviewer',  label: 'Domain Reviewer',  color: 'bg-violet-100 text-violet-700', desc: 'Reviews prompt quality, verifier logic, golden solution correctness' },
    tester:          { key: 'tester',          label: 'Tester',           color: 'bg-emerald-100 text-emerald-700', desc: 'Sets up environment, implements solution scripts, runs Oracle' },
    taskReviewer:    { key: 'taskReviewer',    label: 'Task Reviewer',    color: 'bg-amber-100 text-amber-700',  desc: 'Final technical review of complete task package before publish' },
  };

  const users = {
    superAdmin:     { id: 'u0', name: 'Sarah Chen',  email: 'sarah@my-org.com',  role: 'Super Admin',      initials: 'SC' },
    admin:          { id: 'u5', name: 'Dave Patel',  email: 'dave@my-org.com',   role: 'Admin',            initials: 'DP' },
    projectManager: { id: 'u8', name: 'Nina Roy',    email: 'nina@my-org.com',   role: 'Project Manager',  initials: 'NR' },
    prompter:       { id: 'u1', name: 'Jane Doe',    email: 'jane@my-org.com',   role: 'Prompter',         initials: 'JD' },
    domainReviewer: { id: 'u2', name: 'Raj Mehta',   email: 'raj@my-org.com',    role: 'Domain Reviewer',  initials: 'RM' },
    tester:         { id: 'u3', name: 'Tara Wu',     email: 'tara@my-org.com',   role: 'Tester',           initials: 'TW' },
    taskReviewer:   { id: 'u4', name: 'Bob Smith',   email: 'bob@my-org.com',    role: 'Task Reviewer',    initials: 'BS' },
  };

  const allUsers = [
    { ...users.superAdmin,      lastSeen: 'just now',    tasksCount: 0,  status: 'active', joinedAt: '2024-01-15' },
    { ...users.admin,           lastSeen: '5 min ago',   tasksCount: 0,  status: 'active', joinedAt: '2024-02-01' },
    { ...users.projectManager,  lastSeen: '2 min ago',   tasksCount: 12, status: 'active', joinedAt: '2024-03-10' },
    { ...users.prompter,        lastSeen: '1 min ago',   tasksCount: 6,  status: 'active', joinedAt: '2024-03-15' },
    { ...users.domainReviewer,  lastSeen: '10 min ago',  tasksCount: 0,  status: 'active', joinedAt: '2024-04-01' },
    { ...users.tester,          lastSeen: '2 min ago',   tasksCount: 8,  status: 'active', joinedAt: '2024-04-10' },
    { ...users.taskReviewer,    lastSeen: '15 min ago',  tasksCount: 0,  status: 'active', joinedAt: '2024-05-01' },
    { id: 'u6', name: 'Aisha Khan',   email: 'aisha@my-org.com',  role: 'Prompter',        initials: 'AK', lastSeen: 'yesterday',   tasksCount: 3, status: 'active', joinedAt: '2024-06-01' },
    { id: 'u7', name: 'Marco Silva',  email: 'marco@my-org.com',  role: 'Tester',          initials: 'MS', lastSeen: '3 hours ago', tasksCount: 5, status: 'active', joinedAt: '2024-06-15' },
    { id: 'u9', name: 'Priya Sharma', email: 'priya@my-org.com',  role: 'Domain Reviewer', initials: 'PS', lastSeen: '1 day ago',   tasksCount: 2, status: 'active', joinedAt: '2024-07-01' },
    { id: 'u10', name: 'James Liu',   email: 'james@my-org.com',  role: 'Prompter',        initials: 'JL', lastSeen: '2 days ago',  tasksCount: 1, status: 'inactive', joinedAt: '2024-07-15' },
    { id: 'u11', name: 'Fatima Al-Rashid', email: 'fatima@my-org.com', role: 'Project Manager', initials: 'FA', lastSeen: '4 hours ago', tasksCount: 7, status: 'active', joinedAt: '2024-08-01' },
  ];

  /* ───── Skill domains + library ───── */
  const skillDomains = [
    { id: 'python',  name: 'Python',       color: 'bg-indigo-100 text-indigo-700',   desc: 'Python language patterns, idioms, standard library.' },
    { id: 'data',    name: 'Data & ML',    color: 'bg-emerald-100 text-emerald-700', desc: 'pandas, numpy, spark, ML pipelines.' },
    { id: 'web',     name: 'Web',          color: 'bg-amber-100 text-amber-700',     desc: 'FastAPI, Flask, REST, frontend frameworks.' },
    { id: 'devops',  name: 'DevOps',       color: 'bg-purple-100 text-purple-700',   desc: 'Docker, CI/CD, deploy, cloud CLIs.' },
    { id: 'shell',   name: 'Shell / CLI',  color: 'bg-orange-100 text-orange-700',   desc: 'Bash scripting, CLI tooling.' },
    { id: 'finance', name: 'Finance',      color: 'bg-blue-100 text-blue-700',       desc: 'Financial analysis, EBITDA, statements.' },
    { id: 'legal',   name: 'Legal',        color: 'bg-rose-100 text-rose-700',       desc: 'Contract review, compliance, NDA analysis.' },
    { id: 'general', name: 'General',      color: 'bg-slate-100 text-slate-700',     desc: 'Cross-domain conventions, formatting.' },
  ];

  const skillsLibrary = [
    { id: 'parse-csv-safely',      domain: 'data',    name: 'Parse CSV safely',             desc: 'Robustly parse a CSV file with pandas, handling encoding errors.', tags: ['python','pandas','io'] },
    { id: 'format-json-output',    domain: 'python',  name: 'Format JSON output',           desc: 'Always emit JSON with deterministic key order and 2-space indent.', tags: ['python','json','output'] },
    { id: 'sort-keys-determinism', domain: 'python',  name: 'Deterministic output',         desc: 'Sort dict keys so test assertions are stable across runs.', tags: ['python','testing'] },
    { id: 'pandas-merge-safe',     domain: 'data',    name: 'Safe DataFrame merge',         desc: 'Validate column overlap before merge, handle NaN explicitly.', tags: ['python','pandas'] },
    { id: 'rest-api-error-codes',  domain: 'web',     name: 'REST error handling',          desc: 'Return correct HTTP status codes and structured error body.', tags: ['api','http'] },
    { id: 'docker-minimal-image',  domain: 'devops',  name: 'Minimal Docker image',         desc: 'Use multi-stage builds, pin versions, no unnecessary layers.', tags: ['docker','optimization'] },
    { id: 'bash-strict-mode',      domain: 'shell',   name: 'Bash strict mode',             desc: 'Always start with set -euo pipefail for reliable scripts.', tags: ['bash','safety'] },
    { id: 'ebitda-calculation',    domain: 'finance', name: 'EBITDA extraction',            desc: 'Parse EBITDA from financial filings with tolerance handling.', tags: ['finance','parsing'] },
    { id: 'nda-clause-check',      domain: 'legal',   name: 'NDA clause validation',        desc: 'Check for non-compete, confidentiality, and term clauses.', tags: ['legal','nlp'] },
    { id: 'output-file-check',     domain: 'general', name: 'Output file verification',     desc: 'Ensure output file exists, is valid format, non-empty.', tags: ['testing','io'] },
    { id: 'numpy-vectorize',       domain: 'data',    name: 'Vectorized numpy ops',         desc: 'Prefer vectorized operations over Python loops for performance.', tags: ['python','numpy'] },
    { id: 'flask-blueprints',      domain: 'web',     name: 'Flask blueprint structure',    desc: 'Organize Flask apps with blueprints for modularity.', tags: ['python','flask'] },
  ];

  /* ───── Environment templates (tester picks one) ───── */
  const templates = [
    { id: 'python-3.12-pytest',  name: 'Python 3.12 + pytest', desc: 'Lean Python with pytest and standard lib.', tags: ['python','pytest'], resources: { cpus: 1, memoryGB: 2, storageGB: 10, gpu: false, internet: true },
      dockerfile: 'FROM python:3.12-slim\nWORKDIR /app\nRUN pip install pytest\n' },
    { id: 'python-3.12-pandas',  name: 'Python 3.12 + pandas', desc: 'Data-science stack: pandas, numpy, scipy.', tags: ['python','pandas','numpy'], resources: { cpus: 2, memoryGB: 4, storageGB: 10, gpu: false, internet: true },
      dockerfile: 'FROM python:3.12-slim\nWORKDIR /app\nRUN pip install pandas numpy scipy\n' },
    { id: 'node-20-jest',        name: 'Node 20 + Jest',       desc: 'JavaScript / TypeScript with Jest.', tags: ['node','jest','typescript'], resources: { cpus: 1, memoryGB: 2, storageGB: 10, gpu: false, internet: true },
      dockerfile: 'FROM node:20-slim\nWORKDIR /app\nRUN npm i -g jest ts-node typescript\n' },
    { id: 'rust-1.78',           name: 'Rust 1.78',            desc: 'Systems programming with cargo test.', tags: ['rust','cargo'], resources: { cpus: 2, memoryGB: 4, storageGB: 15, gpu: false, internet: true },
      dockerfile: 'FROM rust:1.78-slim\nWORKDIR /app\n' },
    { id: 'ubuntu-ml-gpu',       name: 'Ubuntu + ML (GPU)',    desc: 'PyTorch 2.x on CUDA for ML tasks.', tags: ['python','pytorch','gpu'], resources: { cpus: 4, memoryGB: 16, storageGB: 40, gpu: true, internet: true },
      dockerfile: 'FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime\nWORKDIR /app\nRUN pip install transformers datasets\n' },
    { id: 'go-1.22',             name: 'Go 1.22',              desc: 'Go with standard testing package.', tags: ['go','testing'], resources: { cpus: 1, memoryGB: 2, storageGB: 10, gpu: false, internet: true },
      dockerfile: 'FROM golang:1.22-alpine\nWORKDIR /app\n' },
  ];

  /* ───── Lifecycle states ───── */
  const STATUS = {
    'prompter-draft':    { label: 'Draft',             cls: 'pill-draft',     owner: 'prompter' },
    'domain-review':     { label: 'Domain review',     cls: 'pill-review',    owner: 'domainReviewer' },
    'with-tester':       { label: 'With tester',       cls: 'pill-running',   owner: 'tester' },
    'in-review':         { label: 'Task review',       cls: 'pill-techreview', owner: 'taskReviewer' },
    'changes-requested': { label: 'Changes requested', cls: 'pill-changes',   owner: null },
    'approved':          { label: 'Approved',          cls: 'pill-approved',  owner: 'admin' },
    'published':         { label: 'Published',         cls: 'pill-published', owner: null },
  };

  /* ───── Verifier types ───── */
  const VERIFIER_TYPES = [
    { id: 'file_exists',      label: 'File must exist',         placeholder: 'e.g. /app/results.json' },
    { id: 'file_contains',    label: 'File contains text',      placeholder: 'e.g. /app/output.txt contains "SUCCESS"' },
    { id: 'json_key_equals',  label: 'JSON key equals',         placeholder: 'e.g. /app/results.json → word_count == 42' },
    { id: 'command_output',   label: 'Command output matches',  placeholder: 'e.g. python validate.py exits with code 0' },
    { id: 'csv_cell_equals',  label: 'CSV cell equals',         placeholder: 'e.g. output.csv row 1, col "total" == 100' },
    { id: 'llm_judge',        label: 'LLM / agent judge',       placeholder: 'e.g. Code follows PEP8 style guidelines' },
    { id: 'freeform',         label: 'Free-form note',          placeholder: 'Any other verification requirement' },
  ];

  /* ───── Sample data ───── */
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

  const SAMPLE_VERIFIERS = [
    { type: 'file_exists',     description: '/app/results.json must exist after running the solution' },
    { type: 'json_key_equals', description: '/app/results.json → "word_count" must equal 42' },
    { type: 'json_key_equals', description: '/app/results.json → "most_common" must equal "the"' },
    { type: 'file_exists',     description: '/app/textstats.py must exist with word_count and most_common functions' },
    { type: 'command_output',  description: 'python /app/analyze.py must exit with code 0' },
  ];

  const SAMPLE_GOLDEN_SOLUTION = `# Golden Solution

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

  /* ───── Tasks ───── */
  const tasks = [
    {
      id: 't1',
      name: 'my-org/text-stats-pipeline',
      description: 'Build a Python pipeline that analyzes text and emits JSON.',
      domain: 'data',
      difficulty: 'medium',
      status: 'published',
      prompter: users.prompter,
      domainReviewer: users.domainReviewer,
      tester: users.tester,
      templateId: 'python-3.12-pandas',
      updatedAt: '2 days ago',
      instructionMd: SAMPLE_INSTRUCTION,
      verifiers: SAMPLE_VERIFIERS,
      goldenSolution: SAMPLE_GOLDEN_SOLUTION,
      selectedSkills: ['parse-csv-safely', 'format-json-output'],
      attachments: [
        { name: 'sample.txt', kind: 'data', size: '12 KB', content: 'The quick brown fox jumps over the lazy dog. The dog slept.\n' },
      ],
      dockerfile: templates[1].dockerfile + 'COPY sample.txt /app/\n',
      solveSh: SAMPLE_SOLVE_SH,
      testSh: SAMPLE_TEST_SH,
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '7 days ago', who: 'Jane Doe', event: 'Created draft' },
        { when: '6 days ago', who: 'Jane Doe', event: 'Submitted for domain review' },
        { when: '5 days ago', who: 'Raj Mehta', event: 'Domain review approved' },
        { when: '4 days ago', who: 'Tara Wu', event: 'Picked up from tester queue' },
        { when: '3 days ago', who: 'Tara Wu', event: 'Submitted for tech review (Oracle PASS)' },
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
      prompter: { id: 'u6', name: 'Aisha Khan', email: 'aisha@my-org.com', role: 'Prompter', initials: 'AK' },
      domainReviewer: users.domainReviewer,
      tester: null,
      templateId: null,
      updatedAt: '1 hour ago',
      instructionMd: '# EBITDA extraction\n\nRead `/app/filing_snippet.txt` (an excerpt from a 10-K). Write `/app/output.json` with a single key `ebitda_millions` (number) representing EBITDA in millions USD for FY2024.',
      verifiers: [
        { type: 'file_exists', description: '/app/output.json must exist and be valid JSON' },
        { type: 'json_key_equals', description: '/app/output.json → ebitda_millions equals 145.2 (within 0.1 tolerance)' },
        { type: 'freeform', description: 'Solution must not hard-code the answer without reading the filing file' },
      ],
      goldenSolution: '# Golden Solution\n\n## Approach\nParse the filing text, find the line containing "EBITDA" near "FY2024", extract the numeric value.\n\n## Expected output\n```json\n{"ebitda_millions": 145.2}\n```\n',
      selectedSkills: ['ebitda-calculation'],
      attachments: [
        { name: 'filing_snippet.txt', kind: 'data', size: '4 KB', content: '... FY2024 EBITDA was $145.2 million ...\n' },
      ],
      dockerfile: '',
      solveSh: '',
      testSh: '',
      oraclePassed: false,
      history: [
        { when: '5 hours ago', who: 'Aisha Khan', event: 'Created draft' },
        { when: '3 hours ago', who: 'Aisha Khan', event: 'Submitted for domain review' },
        { when: '2 hours ago', who: 'Raj Mehta', event: 'Domain review approved' },
      ],
      comments: [],
    },
    {
      id: 't3',
      name: 'my-org/csv-validator',
      description: 'Validate the schema of a CSV file.',
      domain: 'data',
      difficulty: 'medium',
      status: 'in-review',
      prompter: users.prompter,
      domainReviewer: users.domainReviewer,
      tester: users.tester,
      templateId: 'python-3.12-pandas',
      updatedAt: '1 hour ago',
      instructionMd: '# CSV Validator\n\nWrite `/app/validate.py` that reads `/app/sample.csv` and verifies columns are: id, name, age, email. Exit 0 on valid, 1 otherwise.',
      verifiers: [
        { type: 'file_exists', description: '/app/validate.py must exist' },
        { type: 'command_output', description: 'python /app/validate.py exits with code 0 on bundled sample.csv' },
        { type: 'command_output', description: 'Exits non-zero if a required column is missing' },
      ],
      goldenSolution: '# Golden Solution\n\n```python\nimport pandas as pd, sys\ndf = pd.read_csv("/app/sample.csv")\nrequired = ["id", "name", "age", "email"]\nif list(df.columns) == required:\n    sys.exit(0)\nelse:\n    sys.exit(1)\n```\n',
      selectedSkills: ['parse-csv-safely', 'output-file-check'],
      attachments: [{ name: 'sample.csv', kind: 'data', size: '2 KB', content: 'id,name,age,email\n1,Alice,30,a@x.com\n' }],
      dockerfile: templates[1].dockerfile + 'COPY sample.csv /app/\n',
      solveSh: '#!/usr/bin/env bash\nset -euo pipefail\ncat > /app/validate.py <<\'PY\'\nimport pandas as pd, sys\ndf = pd.read_csv("/app/sample.csv")\nassert list(df.columns) == ["id","name","age","email"]\nprint("OK")\nPY\npython /app/validate.py\n',
      testSh: '#!/usr/bin/env bash\nset -euo pipefail\nbash /app/solve.sh\ntest -f /app/validate.py\n',
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '2 days ago', who: 'Jane Doe', event: 'Submitted for domain review' },
        { when: '1 day ago', who: 'Raj Mehta', event: 'Domain review approved' },
        { when: '5 hours ago', who: 'Tara Wu', event: 'Picked up' },
        { when: '1 hour ago', who: 'Tara Wu', event: 'Submitted for tech review' },
      ],
      comments: [
        { author: users.taskReviewer, when: '20 min ago', body: 'Could you add a row-count check in test.sh?' },
      ],
    },
    {
      id: 't4',
      name: 'my-org/regex-builder',
      description: 'Write a regex that matches a set of given inputs.',
      domain: 'python',
      difficulty: 'easy',
      status: 'changes-requested',
      changesTarget: 'tester',
      prompter: users.prompter,
      domainReviewer: users.domainReviewer,
      tester: users.tester,
      templateId: 'python-3.12-pytest',
      updatedAt: '3 hours ago',
      instructionMd: '# Regex Builder\n\nWrite `/app/match.py` with `match(s: str) -> bool` that returns True only for emails ending in `@my-org.com`.',
      verifiers: [
        { type: 'file_exists', description: '/app/match.py must define match(s) function' },
        { type: 'command_output', description: 'Returns True for valid @my-org.com emails' },
        { type: 'command_output', description: 'Returns False for other domains' },
        { type: 'freeform', description: 'Rejects strings with consecutive dots before @' },
      ],
      goldenSolution: '# Golden Solution\n\n```python\nimport re\npattern = r"^[\\w]+(\\.[\\w]+)*@my-org\\.com$"\ndef match(s: str) -> bool:\n    return bool(re.match(pattern, s))\n```\n',
      selectedSkills: [],
      attachments: [],
      dockerfile: templates[0].dockerfile,
      solveSh: '#!/usr/bin/env bash\nset -euo pipefail\ncat > /app/match.py <<\'PY\'\nimport re\n_pat = re.compile(r"^[\\w.+-]+@my-org\\.com$")\ndef match(s: str) -> bool:\n    return bool(_pat.match(s))\nPY\n',
      testSh: '#!/usr/bin/env bash\nset -euo pipefail\nbash /app/solve.sh\npython -c "from match import match; assert match(\'a@my-org.com\'); assert not match(\'a@other.com\')"\n',
      oraclePassed: true,
      oracleReward: 1.0,
      history: [
        { when: '2 days ago', who: 'Tara Wu', event: 'Submitted for tech review' },
        { when: '3 hours ago', who: 'Bob Smith', event: 'Requested changes (tester)' },
      ],
      comments: [
        { author: users.taskReviewer, when: '3 hours ago', body: 'Regex is too lax - add tests for edge cases like a..b@my-org.com.' },
      ],
    },
    {
      id: 't5',
      name: 'my-org/marketing-copy-tone',
      description: 'Rewrite product copy to match brand tone guidelines.',
      domain: 'general',
      difficulty: 'easy',
      status: 'domain-review',
      prompter: users.prompter,
      domainReviewer: null,
      tester: null,
      templateId: null,
      updatedAt: '30 min ago',
      instructionMd: '# Brand tone rewrite\n\nRead `/app/draft.txt` and write `/app/rewritten.txt` following the tone guide in `/app/brand-guide.md`.',
      verifiers: [
        { type: 'file_exists', description: '/app/rewritten.txt must exist' },
        { type: 'llm_judge', description: 'No exclamation marks in the output' },
        { type: 'llm_judge', description: 'Uses "you" not "the user"' },
        { type: 'freeform', description: 'Under 120 words' },
      ],
      goldenSolution: '# Golden Solution\n\nExpected rewritten.txt:\n```\nOur product helps you get more done in less time. You will find it intuitive and reliable.\n```\n\nKey rules: no exclamation marks, "you" not "the user", under 120 words.\n',
      selectedSkills: ['output-file-check'],
      attachments: [
        { name: 'draft.txt', kind: 'data', size: '1 KB', content: 'Our product is great!!! Users will love it.\n' },
        { name: 'brand-guide.md', kind: 'data', size: '2 KB', content: '# Tone\n- Friendly, concise\n- No exclamation marks\n' },
      ],
      dockerfile: '',
      solveSh: '',
      testSh: '',
      oraclePassed: false,
      history: [
        { when: '1 hour ago', who: 'Jane Doe', event: 'Created draft' },
        { when: '30 min ago', who: 'Jane Doe', event: 'Submitted for domain review' },
      ],
      comments: [],
    },
    {
      id: 't6',
      name: 'my-org/sort-implementations',
      description: 'Implement quicksort and mergesort with unit tests.',
      domain: 'python',
      difficulty: 'medium',
      status: 'prompter-draft',
      prompter: users.prompter,
      domainReviewer: null,
      tester: null,
      templateId: null,
      updatedAt: 'just now',
      instructionMd: '# Sorting algorithms\n\nImplement quicksort and mergesort in `/app/sorts.py`. Provide pytest tests in `/app/test_sorts.py`.',
      verifiers: [
        { type: 'file_exists', description: '/app/sorts.py must exist' },
        { type: 'command_output', description: 'pytest /app/test_sorts.py passes' },
        { type: 'freeform', description: 'Handles empty list edge case' },
      ],
      goldenSolution: '# Golden Solution\n\n```python\ndef quicksort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr)//2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)\n```\n',
      selectedSkills: ['sort-keys-determinism'],
      attachments: [],
      dockerfile: '',
      solveSh: '',
      testSh: '',
      oraclePassed: false,
      history: [{ when: 'just now', who: 'Jane Doe', event: 'Created draft' }],
      comments: [],
    },
  ];

  /* ───── Wizard task (in-progress authoring session) ───── */
  const wizardTask = {
    name: 'my-org/text-stats-pipeline',
    description: 'Build a Python pipeline that analyzes text and emits JSON.',
    domain: 'data',
    difficulty: 'medium',
    instructionMd: SAMPLE_INSTRUCTION,
    verifiers: SAMPLE_VERIFIERS,
    goldenSolution: SAMPLE_GOLDEN_SOLUTION,
    selectedSkills: ['parse-csv-safely', 'format-json-output'],
    attachments: [
      { name: 'sample.txt', kind: 'data', size: '12 KB', content: 'The quick brown fox jumps over the lazy dog.\n' },
    ],
    templateId: 'python-3.12-pandas',
    dockerfile: templates[1].dockerfile + 'COPY sample.txt /app/\n',
    solveSh: SAMPLE_SOLVE_SH,
    testSh: SAMPLE_TEST_SH,
    oraclePassed: false,
  };

  /* ───── Helpers ───── */
  function getTemplate(id) { return templates.find(t => t.id === id) || null; }
  function getTaskById(id) { return tasks.find(t => t.id === id) || null; }
  function getSkillsByDomain(domainId) { return skillsLibrary.filter(s => s.domain === domainId); }

  function resolveDockerfile(t) {
    if (t.dockerfile) return t.dockerfile;
    const tpl = getTemplate(t.templateId);
    return tpl ? tpl.dockerfile : '# (no environment yet)\n';
  }

  function harborFiles(t) {
    const out = [
      { type: 'file', path: 'task.toml', label: 'task.toml', content: makeTaskToml(t), language: 'toml', owner: 'shared' },
      { type: 'file', path: 'instruction.md', label: 'instruction.md', content: t.instructionMd || '', language: 'markdown', owner: 'prompter' },
      { type: 'dir', path: 'environment', label: 'environment/' },
      { type: 'file', path: 'environment/Dockerfile', label: 'Dockerfile', content: resolveDockerfile(t), language: 'docker', owner: 'tester' },
    ];
    if (t.attachments && t.attachments.length) {
      out.push({ type: 'dir', path: 'inputs', label: 'inputs/' });
      for (const a of t.attachments) {
        out.push({ type: 'file', path: 'inputs/' + a.name, label: a.name, content: a.content || '', language: 'text', owner: 'prompter' });
      }
    }
    out.push({ type: 'dir', path: 'tests', label: 'tests/' });
    out.push({ type: 'file', path: 'tests/verifiers.md', label: 'verifiers.md', content: renderVerifiersMd(t), language: 'markdown', owner: 'prompter' });
    out.push({ type: 'file', path: 'tests/test.sh', label: 'test.sh', content: t.testSh || '#!/usr/bin/env bash\n# (tester compiles verifiers into this)\nexit 1\n', language: 'bash', owner: 'tester' });
    out.push({ type: 'dir', path: 'solution', label: 'solution/' });
    out.push({ type: 'file', path: 'solution/golden.md', label: 'golden.md', content: t.goldenSolution || '', language: 'markdown', owner: 'prompter' });
    out.push({ type: 'file', path: 'solution/solve.sh', label: 'solve.sh', content: t.solveSh || '#!/usr/bin/env bash\n# (tester converts golden solution)\nexit 1\n', language: 'bash', owner: 'tester' });
    return out;
  }

  function renderVerifiersMd(t) {
    if (!t.verifiers || !t.verifiers.length) return '# Verifiers\n\n_No verifiers defined._\n';
    let md = '# Verifiers\n\n';
    t.verifiers.forEach((v, i) => {
      const typeLabel = (VERIFIER_TYPES.find(vt => vt.id === v.type) || {}).label || v.type;
      md += `${i + 1}. **[${typeLabel}]** ${v.description}\n`;
    });
    return md;
  }

  function makeTaskToml(t) {
    const tpl = getTemplate(t.templateId);
    const res = tpl ? tpl.resources : { cpus: 1, memoryGB: 2, storageGB: 10, internet: true };
    return `[package]
name        = "${(t.name || '').replace(/"/g, '\\"')}"
version     = "1.0"
description = "${(t.description || '').replace(/"/g, '\\"')}"
domain      = "${t.domain || ''}"
difficulty  = "${t.difficulty || 'medium'}"
author      = "${t.prompter ? t.prompter.email : ''}"
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
status      = "${t.oraclePassed ? 'passed' : 'pending'}"
last_reward = ${t.oracleReward != null ? t.oracleReward.toFixed(2) : '0.00'}
`;
  }

  return {
    ROLES, users, allUsers, skillDomains, skillsLibrary, templates, STATUS, VERIFIER_TYPES,
    tasks, wizardTask, harborFiles, renderVerifiersMd, makeTaskToml,
    getTemplate, resolveDockerfile, getTaskById, getSkillsByDomain,
  };
})();
