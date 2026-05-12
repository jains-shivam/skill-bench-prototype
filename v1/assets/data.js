/* Skill Bench prototype - mock data.
   All hardcoded; no fetches anywhere in the prototype. */

window.SBData = (function () {
  const users = {
    trainer:   { id: 'u1', name: 'Jane Doe',     email: 'jane@my-org.com',  role: 'Trainer',   initials: 'JD' },
    reviewer:  { id: 'u2', name: 'Bob Smith',    email: 'bob@my-org.com',   role: 'Reviewer',  initials: 'BS' },
    evaluator: { id: 'u3', name: 'Carol Lee',    email: 'carol@my-org.com', role: 'Evaluator', initials: 'CL' },
    admin:     { id: 'u4', name: 'Dave Patel',   email: 'dave@my-org.com',  role: 'Admin',     initials: 'DP' },
  };

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

  const agents = [
    { id: 'claude-code', name: 'claude-code', models: ['anthropic/claude-sonnet-4-5', 'anthropic/claude-opus-4-1'] },
    { id: 'cursor-cli',  name: 'cursor-cli',  models: ['cursor/claude-opus-4-7-high', 'cursor/gpt-5'] },
    { id: 'codex',       name: 'codex',       models: ['openai/gpt-5', 'openai/gpt-4o'] },
    { id: 'gemini-cli',  name: 'gemini-cli',  models: ['google/gemini-2.5-pro'] },
    { id: 'aider',       name: 'aider',       models: ['anthropic/claude-sonnet-4-5'] },
  ];

  const tasks = [
    {
      id: 't1',
      name: 'my-org/text-stats-pipeline',
      description: 'Build a Python pipeline that analyzes text and emits JSON.',
      status: 'published',
      difficulty: 'medium',
      category: 'programming',
      keywords: ['python', 'pandas', 'json'],
      owner: users.trainer,
      updatedAt: '2 days ago',
      template: 'python-script',
      oraclePassed: true,
    },
    {
      id: 't2',
      name: 'my-org/csv-validator',
      description: 'Validate the schema of a CSV file using pandera.',
      status: 'changes',
      difficulty: 'medium',
      category: 'programming',
      keywords: ['python', 'pandas', 'validation'],
      owner: users.trainer,
      updatedAt: '1 hour ago',
      template: 'data-analysis',
      oraclePassed: true,
      comments: 2,
    },
    {
      id: 't3',
      name: 'my-org/regex-builder',
      description: 'Write a regex that matches a set of given inputs.',
      status: 'review',
      difficulty: 'easy',
      category: 'programming',
      keywords: ['regex', 'python'],
      owner: users.trainer,
      updatedAt: '3 hours ago',
      template: 'python-script',
      oraclePassed: true,
    },
    {
      id: 't4',
      name: 'my-org/json-formatter',
      description: 'Build a CLI that pretty-prints JSON.',
      status: 'draft',
      difficulty: 'easy',
      category: 'programming',
      keywords: ['cli', 'json'],
      owner: users.trainer,
      updatedAt: 'just now',
      template: 'cli-tool',
      oraclePassed: false,
    },
    {
      id: 't5',
      name: 'my-org/fastapi-book-library',
      description: 'A small FastAPI service for a book library.',
      status: 'approved',
      difficulty: 'hard',
      category: 'programming',
      keywords: ['fastapi', 'python', 'rest'],
      owner: users.trainer,
      updatedAt: 'yesterday',
      template: 'web-app',
      oraclePassed: true,
    },
  ];

  /* The "task being created in the wizard" is a partially-filled task that
     gets referenced across all 7 wizard screens. */
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
        { name: 'textstats.py', size: '0.4 KB' },
        { name: 'analyze.py',   size: '0.3 KB' },
      ],
    },
  };

  const evalJobs = [
    {
      id: 'j2025',
      name: 'skill-bench-v1 x 2 agents',
      dataset: 'my-org/skill-bench-v1',
      taskCount: 47,
      agents: ['claude-code', 'cursor-cli'],
      attempts: 3,
      status: 'running',
      progress: 0.66,
      passRates: { 'claude-code': 0.78, 'cursor-cli': 0.61 },
      startedAt: '15 min ago',
      cost: '$28.40',
    },
    {
      id: 'j2024',
      name: 'skill-bench-v1 x claude-code',
      dataset: 'my-org/skill-bench-v1',
      taskCount: 47,
      agents: ['claude-code'],
      attempts: 3,
      status: 'completed',
      progress: 1.0,
      passRates: { 'claude-code': 0.82 },
      startedAt: 'yesterday',
      cost: '$21.10',
    },
    {
      id: 'j2023',
      name: 'codex baseline',
      dataset: 'my-org/skill-bench-v1',
      taskCount: 47,
      agents: ['codex'],
      attempts: 1,
      status: 'completed',
      progress: 1.0,
      passRates: { codex: 0.45 },
      startedAt: '3 days ago',
      cost: '$8.90',
    },
  ];

  /* Per-trial results for the comparison + drilldown views. */
  const compareRows = [
    { task: 'text-stats-pipeline',  agents: { 'claude-code': 1.00, 'cursor-cli': 0.67 } },
    { task: 'csv-validator',        agents: { 'claude-code': 0.50, 'cursor-cli': 0.50 } },
    { task: 'regex-builder',        agents: { 'claude-code': 1.00, 'cursor-cli': 1.00 } },
    { task: 'json-formatter',       agents: { 'claude-code': 0.33, 'cursor-cli': 0.67 } },
    { task: 'fastapi-book-library', agents: { 'claude-code': 0.80, 'cursor-cli': 0.40 } },
    { task: 'ssh-key-pair',         agents: { 'claude-code': 1.00, 'cursor-cli': 1.00 } },
    { task: 'sort-implementations', agents: { 'claude-code': 0.75, 'cursor-cli': 0.50 } },
    { task: 'http-status-router',   agents: { 'claude-code': 0.66, 'cursor-cli': 0.83 } },
  ];

  /* Trajectory for the trial drilldown view. */
  const trajectory = {
    agent: 'claude-code',
    model: 'anthropic/claude-sonnet-4-5',
    task: 'csv-validator',
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
      { role: 'assistant', content: 'I will start by inspecting the input file to understand its structure.', toolCalls: [{ name: 'read_file', args: { path: '/app/sample.csv' }, output: 'id,name,age,email\n1,Alice,30,alice@x.com\n2,Bob,28,bob@y.com\n' }] },
      { role: 'assistant', content: 'Now I will create the validator using pandas.', toolCalls: [{ name: 'write_file', args: { path: '/app/validate.py' }, output: 'wrote 612 bytes' }] },
      { role: 'assistant', content: 'Let me run it to confirm it works.', toolCalls: [{ name: 'run_command', args: { cmd: 'python /app/validate.py' }, output: 'OK\n' }] },
      { role: 'assistant', content: 'The validator works on the sample. I will stop here.' },
    ],
  };

  /* Comments thread for the reviewer workspace. */
  const reviewComments = [
    { author: users.reviewer, when: '5 min ago', body: 'Nice task overall. Could you add the expected JSON schema to the instruction?' },
    { author: users.trainer,  when: '2 min ago', body: 'Done - updated the instruction with a sample JSON block.' },
  ];

  return {
    users,
    templates,
    criteriaLibrary,
    agents,
    tasks,
    wizardTask,
    evalJobs,
    compareRows,
    trajectory,
    reviewComments,
  };
})();
