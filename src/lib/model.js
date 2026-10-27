/**
 * Data model, seed data and pure helpers (no React).
 * PRD §5 is the source of truth for the Task / Anchor shapes.
 */

// The four columns of the board, in render order (PRD §7).
export const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

// PRD §8 — the only valid values for Task.assignee.
export const TEAM = ['Taygun', 'Claude', 'Gemini'];

export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

export const TYPES = { feature: 'Feature', bug: 'Bug' };

export const CONTEXT_TEMPLATE = `## Background
What is this task and why does it matter?

## Constraints
Stack, files, design rules the AI must respect.

## Tried so far
Prompts / approaches already used and what happened.

## Pick up
The exact next step for whoever (or whatever) continues.`;

/** Keep at most this many earlier versions of a task's Context. */
export const HISTORY_LIMIT = 20;

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

/** Seed tasks so the board is never empty on first load (M4) — built fresh on every reset. */
export function seedTasks() {
  return [
    {
      id: 't1',
      title: 'Hero copy for landing page',
      description: 'Write the headline + subline for the tracker landing hero.',
      type: 'feature',
      status: 'todo',
      assignee: 'Claude',
      dueDate: addDays(5),
      createdDate: todayISO(),
      context:
        "## Background\nLanding hero for the tracker's public page. Needs to explain the tool in one glance.\n\n## Constraints\n- Tone from DESIGN.md §5: calm, encouraging, short\n- Max 8 words headline, 20 words subline\n\n## Tried so far\n- Asked for 5 options, all too salesy (\"Supercharge your workflow…\")\n\n## Pick up\nAsk for 5 more options in a plain, developer voice; pick one with Taygun.",
      contextTool: 'Claude',
      contextUpdatedAt: hoursAgo(3),
      contextHistory: [
        {
          at: hoursAgo(20),
          tool: 'ChatGPT',
          text: '## Background\nLanding hero for the tracker.\n\n## Pick up\nGenerate 5 headline options.',
        },
      ],
    },
    {
      id: 't2',
      title: 'Fix nav overlapping on scroll',
      description: 'Sticky header covers the first card when the page scrolls.',
      type: 'bug',
      status: 'in-progress',
      assignee: 'Taygun',
      dueDate: addDays(0),
      createdDate: todayISO(),
      context:
        "## Background\nSticky header (h-16) overlaps the first card when the board scrolls.\n\n## Constraints\n- Tailwind only, no custom CSS file\n- Must not break the modal's fixed overlay\n\n## Tried so far\n- `scroll-margin-top` on cards: fixed anchor links, not the overlap\n- Adding `pt-16` to <main>: works but leaves a gap on load\n\n## Pick up\nTry `sticky top-0` + `z-30` on header and remove the fixed positioning.",
      contextTool: 'Cursor',
      contextUpdatedAt: hoursAgo(1),
      contextHistory: [],
    },
    {
      id: 't3',
      title: 'About page layout',
      description: 'Two-column layout with team photo and short bio.',
      type: 'feature',
      status: 'review',
      assignee: 'Gemini',
      dueDate: addDays(1),
      createdDate: todayISO(),
      context:
        '## Background\nAbout page: who built the tracker and why.\n\n## Constraints\nTwo columns on desktop, one on mobile.\n\n## Tried so far\nGemini generated the layout; review spacing against DESIGN.md.\n\n## Pick up\nCheck heading sizes and contrast, then move to Done.',
      contextTool: 'Other',
      contextUpdatedAt: hoursAgo(26),
      contextHistory: [],
    },
    {
      id: 't5',
      title: 'Mobile menu does not close',
      description: 'Tapping a link in the mobile menu leaves the drawer open.',
      type: 'bug',
      status: 'todo',
      assignee: 'Gemini',
      dueDate: addDays(-2),
      createdDate: todayISO(),
      context:
        '## Background\nOn mobile, tapping a nav link scrolls but the drawer stays open.\n\n## Constraints\nKeep focus management accessible (return focus to menu button).\n\n## Tried so far\nNothing yet.\n\n## Pick up\nClose the drawer in the link onClick and test with keyboard.',
      contextTool: null,
      contextUpdatedAt: null,
      contextHistory: [],
    },
    {
      id: 't4',
      title: 'PRD reviewed',
      description: 'Fill in team, ownership and identity sections of PRD.md.',
      type: 'feature',
      status: 'done',
      assignee: 'Taygun',
      dueDate: addDays(-1),
      createdDate: todayISO(),
      context: '',
      contextTool: null,
      contextUpdatedAt: null,
      contextHistory: [],
    },
  ];
}

export const DEFAULT_ANCHORS = [
  { id: 'presentation', label: 'Presentation', url: null },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

export const emptyTask = () => ({
  id: '',
  title: '',
  description: '',
  type: 'feature',
  status: 'todo',
  assignee: TEAM[0],
  dueDate: '',
  createdDate: todayISO(),
  context: CONTEXT_TEMPLATE,
  contextTool: null,
  contextUpdatedAt: null,
  contextHistory: [],
});

export const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label ?? id;

// --- M8 due state ---------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Derive the due state purely from the existing dueDate + status. */
export function dueState(task, now = new Date()) {
  if (task.status === 'done') return { key: 'neutral', label: 'Done', spoken: 'done' };
  if (!task.dueDate) return { key: 'none', label: 'No due date', spoken: 'no due date' };
  const [y, m, d] = task.dueDate.split('-').map(Number);
  const days = Math.round((new Date(y, m - 1, d) - startOfDay(now)) / DAY);
  if (days < 0)
    return { key: 'overdue', label: `Overdue ${-days}d`, spoken: `overdue by ${-days} day${days === -1 ? '' : 's'}` };
  if (days === 0) return { key: 'warning', label: 'Due today', spoken: 'due today' };
  if (days <= 2)
    return { key: 'soon', label: days === 1 ? 'Due tomorrow' : 'Due in 2d', spoken: days === 1 ? 'due tomorrow' : 'due in 2 days' };
  return { key: 'safe', label: `Due in ${days}d`, spoken: `due in ${days} days` };
}

export const DUE_FILTERS = [
  { id: 'all', label: 'Any due date' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'warning', label: 'Due today' },
  { id: 'soon', label: 'Next 2 days' },
  { id: 'safe', label: 'Later' },
  { id: 'none', label: 'No due date' },
];

export function timeAgo(iso, now = new Date()) {
  if (!iso) return 'never';
  const sec = Math.max(0, Math.round((now - new Date(iso)) / 1000));
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// --- Search & filters -----------------------------------------------------

export const EMPTY_FILTERS = { q: '', owner: 'all', type: 'all', due: 'all' };

export function matchesFilters(task, f, now) {
  if (f.owner !== 'all' && task.assignee !== f.owner) return false;
  if (f.type !== 'all' && task.type !== f.type) return false;
  if (f.due !== 'all' && dueState(task, now).key !== f.due) return false;
  const q = f.q.trim().toLowerCase();
  if (q) {
    const hay = `${task.title} ${task.description} ${task.context ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export const filtersActive = (f) =>
  f.q.trim() !== '' || f.owner !== 'all' || f.type !== 'all' || f.due !== 'all';

// --- M9 Markdown preview ----------------------------------------------------

/** Tiny Markdown preview: headings, lists, bold, inline code. Escapes HTML first. */
export function renderMarkdown(md) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code class="rounded bg-surface-raised px-1 font-mono text-[0.75rem]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  let html = '';
  let inList = false;
  for (const line of md.split('\n')) {
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (li) {
      if (!inList) {
        html += '<ul class="ml-4 list-disc">';
        inList = true;
      }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }
    if (inList) {
      html += '</ul>';
      inList = false;
    }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) html += `<p class="mt-3 font-display font-semibold text-brand-accent">${inline(h[2])}</p>`;
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

/** Strip Markdown symbols so text reads naturally when spoken aloud. */
export const markdownToSpeech = (md = '') =>
  md
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s*(.*)$/gm, '$1.')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();

// --- M10 copy context -------------------------------------------------------

/** Serialise a task into a briefing that reads naturally when pasted into an AI chat. */
export function buildContextBlock(task, now = new Date()) {
  const due = dueState(task, now).label;
  const lines = [
    `# Task: ${task.title}`,
    '',
    `- **Type:** ${TYPES[task.type]}`,
    `- **Status:** ${stageLabel(task.status)}`,
    `- **Owner:** ${task.assignee}`,
    `- **Due:** ${task.dueDate ?? 'not set'} (${due})`,
    task.contextTool ? `- **Context written for:** ${task.contextTool}` : null,
    '',
    '## Description',
    task.description?.trim() || '_No description._',
    '',
    task.context?.trim() ? task.context.trim() : '## Context\n_No context yet._',
    '',
    '---',
    'You are picking up this task from the Vibe Ledger board. Read the context above, ask me if anything is unclear, then continue from "Pick up".',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts without the async clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

// --- Read aloud text ----------------------------------------------------------

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export function taskToSpeech(task, { includeContext = true, now = new Date() } = {}) {
  const parts = [
    `${TYPES[task.type]}: ${task.title}.`,
    `Status: ${stageLabel(task.status)}.`,
    `Assigned to ${task.assignee}.`,
    `${cap(dueState(task, now).spoken)}.`,
  ];
  if (task.description?.trim()) parts.push(`Description: ${task.description.trim().replace(/[.!?]+$/, '')}.`);
  if (includeContext && task.context?.trim()) parts.push(`Context: ${markdownToSpeech(task.context)}`);
  return parts.join(' ');
}

export function boardToSpeech(tasks, now = new Date()) {
  if (tasks.length === 0) return 'The board is empty.';
  const parts = [`The board has ${tasks.length} task${tasks.length === 1 ? '' : 's'}.`];
  for (const s of STAGES) {
    const inCol = tasks.filter((t) => t.status === s.id);
    if (inCol.length === 0) {
      parts.push(`${s.label}: empty.`);
      continue;
    }
    parts.push(
      `${s.label}: ${inCol.length}. ` +
        inCol.map((t) => `${t.title}, ${TYPES[t.type].toLowerCase()}, ${t.assignee}, ${dueState(t, now).spoken}`).join('; ') +
        '.'
    );
  }
  const overdue = tasks.filter((t) => dueState(t, now).key === 'overdue');
  if (overdue.length) parts.push(`Attention: ${overdue.length} overdue.`);
  return parts.join(' ');
}

// --- Data export / import -------------------------------------------------------

export const BACKUP_VERSION = 1;

export function makeBackup(tasks, anchors) {
  return {
    app: 'vibe-ledger',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    anchors,
  };
}

/**
 * Validate and normalise an imported backup. Unknown or malformed fields are
 * repaired where safe (e.g. an unknown assignee becomes TEAM[0]); anything that
 * can't be repaired throws an Error with a human-readable message.
 */
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!data || !Array.isArray(data.tasks)) throw new Error('No task list found in that file.');
  const stageIds = STAGES.map((s) => s.id);
  const tasks = data.tasks.map((t, i) => {
    if (!t || typeof t.title !== 'string' || !t.title.trim()) throw new Error(`Task ${i + 1} has no title.`);
    return {
      id: typeof t.id === 'string' && t.id ? t.id : `t${Date.now()}-${i}`,
      title: t.title.trim(),
      description: typeof t.description === 'string' ? t.description : '',
      type: t.type === 'bug' ? 'bug' : 'feature',
      status: stageIds.includes(t.status) ? t.status : 'todo',
      assignee: TEAM.includes(t.assignee) ? t.assignee : TEAM[0],
      dueDate: typeof t.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : null,
      createdDate: typeof t.createdDate === 'string' ? t.createdDate : todayISO(),
      context: typeof t.context === 'string' ? t.context : '',
      contextTool: AI_TOOLS.includes(t.contextTool) ? t.contextTool : null,
      contextUpdatedAt: typeof t.contextUpdatedAt === 'string' ? t.contextUpdatedAt : null,
      contextHistory: Array.isArray(t.contextHistory)
        ? t.contextHistory.filter((h) => h && typeof h.text === 'string').slice(0, HISTORY_LIMIT)
        : [],
    };
  });
  const anchors = DEFAULT_ANCHORS.map((a) => {
    const found = Array.isArray(data.anchors) ? data.anchors.find((x) => x && x.id === a.id) : null;
    return { ...a, url: found && typeof found.url === 'string' ? found.url : null };
  });
  return { tasks, anchors };
}

/** When a task's Context changes, keep the previous version in contextHistory. */
export function withHistory(prev, next) {
  const history = Array.isArray(prev?.contextHistory) ? prev.contextHistory : [];
  if (!prev || (prev.context ?? '') === (next.context ?? '') || !prev.context?.trim()) {
    return { ...next, contextHistory: history };
  }
  const entry = { at: prev.contextUpdatedAt ?? new Date().toISOString(), tool: prev.contextTool ?? null, text: prev.context };
  return { ...next, contextHistory: [entry, ...history].slice(0, HISTORY_LIMIT) };
}
