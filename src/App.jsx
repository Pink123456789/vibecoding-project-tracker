import { useState, useEffect, useRef } from 'react';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// Replace these placeholders with the three names from PRD §8 before M4.
// They become the only valid values for `Task.assignee`.
export const TEAM = ['Taygun', 'Claude', 'Gemini'];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

// --- M4 data-model -------------------------------------------------------

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Seed tasks so the board is never empty on first load. */
export const SEED_TASKS = [
  {
    id: 't1',
    title: 'Hero copy for landing page',
    description: 'Write the headline + subline for the tracker landing hero.',
    type: 'feature',
    status: 'todo',
    assignee: 'Claude',
    dueDate: addDays(5),
    createdDate: todayISO(),
    context: "## Background\nLanding hero for the tracker's public page. Needs to explain the tool in one glance.\n\n## Constraints\n- Tone from DESIGN.md \u00a75: calm, encouraging, short\n- Max 8 words headline, 20 words subline\n\n## Tried so far\n- Asked for 5 options, all too salesy (\"Supercharge your workflow\u2026\")\n\n## Pick up\nAsk for 5 more options in a plain, developer voice; pick one with Taygun.",
    contextTool: 'Claude',
    contextUpdatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
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
    context: "## Background\nSticky header (h-16) overlaps the first card when the board scrolls.\n\n## Constraints\n- Tailwind only, no custom CSS file\n- Must not break the modal's fixed overlay\n\n## Tried so far\n- `scroll-margin-top` on cards: fixed anchor links, not the overlap\n- Adding `pt-16` to <main>: works but leaves a gap on load\n\n## Pick up\nTry `sticky top-0` + `z-30` on header and remove the fixed positioning.",
    contextTool: 'Cursor',
    contextUpdatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
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
    context: "## Background\nAbout page: who built the tracker and why.\n\n## Constraints\nTwo columns on desktop, one on mobile.\n\n## Tried so far\nGemini generated the layout; review spacing against DESIGN.md.\n\n## Pick up\nCheck heading sizes and contrast, then move to Done.",
    contextTool: 'Other',
    contextUpdatedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
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
    context: "## Background\nOn mobile, tapping a nav link scrolls but the drawer stays open.\n\n## Constraints\nKeep focus management accessible (return focus to menu button).\n\n## Tried so far\nNothing yet.\n\n## Pick up\nClose the drawer in the link onClick and test with keyboard.",
    contextTool: null,
    contextUpdatedAt: null,
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
  },
];

// --- M6 tag-style ---------------------------------------------------------

/** One source of truth for how each task type looks, everywhere it renders. */
export const TYPE_STYLE = {
  feature: {
    label: 'Feature',
    stripe: 'border-l-feature',
    text: 'text-feature',
    chip: 'bg-feature/15 text-feature ring-1 ring-feature/30',
  },
  bug: {
    label: 'Bug',
    stripe: 'border-l-bug',
    text: 'text-bug',
    chip: 'bg-bug/15 text-bug ring-1 ring-bug/30',
  },
};

export function TypeIcon({ type, className = 'h-3.5 w-3.5' }) {
  return type === 'bug' ? (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2l1.9 1.9M16 2l-1.9 1.9M9 7.1V6a3 3 0 1 1 6 0v1.1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
      <path d="M12 20v-9M6.5 13H3M21 13h-3.5M6 9 3.5 7M18 9l2.5-2M6 17l-2.5 2M18 17l2.5 2" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.8L20 10l-5 3.6L16.5 20 12 16.4 7.5 20 9 13.6 4 10l6.1-1.2z" />
    </svg>
  );
}

export function TypeChip({ type }) {
  const st = TYPE_STYLE[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] ${st.chip}`}>
      <TypeIcon type={type} />
      {st.label}
    </span>
  );
}

const initials = (name) => name.slice(0, 2).toUpperCase();

// --- M8 due-tint ----------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Derive the due state purely from the existing dueDate + status. */
export function dueState(task, now = new Date()) {
  if (task.status === 'done') return { key: 'neutral', label: 'Done' };
  if (!task.dueDate) return { key: 'none', label: 'No due date' };
  const [y, m, d] = task.dueDate.split('-').map(Number);
  const days = Math.round((new Date(y, m - 1, d) - startOfDay(now)) / DAY);
  if (days < 0) return { key: 'overdue', label: `Overdue ${-days}d` };
  if (days === 0) return { key: 'warning', label: 'Due today' };
  if (days <= 2) return { key: 'soon', label: days === 1 ? 'Due tomorrow' : 'Due in 2d' };
  return { key: 'safe', label: `Due in ${days}d` };
}

export const DUE_STYLE = {
  safe: { card: '', pill: 'text-due-safe', dot: 'bg-due-safe' },
  soon: { card: '!bg-due-soon/[0.07]', pill: 'text-due-soon', dot: 'bg-due-soon' },
  warning: { card: '!bg-due-warning/[0.12] ring-1 ring-due-warning/50', pill: 'text-due-warning', dot: 'bg-due-warning' },
  overdue: { card: '!bg-due-overdue/[0.14] ring-1 ring-due-overdue/70', pill: 'text-due-overdue font-semibold', dot: 'bg-due-overdue animate-pulse' },
  neutral: { card: 'opacity-70', pill: 'text-due-neutral', dot: 'bg-due-neutral' },
  none: { card: '', pill: 'text-ink-muted', dot: 'bg-surface-line' },
};

export function DuePill({ task, now }) {
  const ds = dueState(task, now);
  const st = DUE_STYLE[ds.key];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-mono ${st.pill}`} title={task.dueDate ?? ''}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${st.dot}`} />
      {ds.label}
    </span>
  );
}

// --- M7 task-owner --------------------------------------------------------

/** Each teammate gets a fixed avatar colour so ownership reads at a glance. */
export const PERSON_STYLE = {
  Taygun: 'bg-brand-primary text-surface-page',
  Claude: 'bg-[#F0A97A] text-surface-page',
  Gemini: 'bg-brand-accent text-surface-page',
};

export function Avatar({ name, size = 'h-7 w-7 text-[11px]' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-mono font-semibold ${size} ${PERSON_STYLE[name] ?? 'bg-surface-raised text-ink-primary'}`}
    >
      {initials(name)}
    </span>
  );
}

function TaskCard({ task, onOpen, onHandOff, onCopied, onMove, flash, now }) {
  const st = TYPE_STYLE[task.type];
  const due = DUE_STYLE[dueState(task, now).key];
  return (
    <li
      data-type={task.type}
      data-task-id={task.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('opacity-40');
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('opacity-40')}
      className={`group relative cursor-grab active:cursor-grabbing rounded-lg border border-l-[3px] border-surface-line ${st.stripe} bg-surface-card ${due.card} p-3 transition hover:-translate-y-0.5 hover:border-brand-primary/60 focus-within:ring-2 focus-within:ring-brand-primary ${
        flash ? 'ring-2 ring-brand-accent' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-ink-primary">
          {/* Stretched button: the whole card opens the editor. */}
          <button
            type="button"
            onClick={() => onOpen(task)}
            onKeyDown={(e) => {
              // Keyboard alternative to drag-and-drop: Alt + ← / → moves the card.
              if (!e.altKey) return;
              const i = STAGES.findIndex((x) => x.id === task.status);
              const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
              if (e.key.startsWith('Arrow') && STAGES[next]) {
                e.preventDefault();
                onMove(task.id, STAGES[next].id, true);
              }
            }}
            aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
            className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            <span className="sr-only">Edit task: </span>
            {task.title}
          </button>
        </h3>
        <span className={`mt-0.5 shrink-0 ${st.text}`} title={st.label}>
          <TypeIcon type={task.type} className="h-4 w-4" />
          <span className="sr-only">{st.label}</span>
        </span>
      </div>

      {task.context?.trim() && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-muted">
          <span aria-hidden="true" className="text-brand-primary">◆</span>
          Context{task.contextTool ? ` for ${task.contextTool}` : ''}{task.contextUpdatedAt ? ` · ${timeAgo(task.contextUpdatedAt, now)}` : ''}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink-muted">
        <DuePill task={task} now={now} />
        <div className="relative z-10 flex items-center gap-1.5">
          <Avatar name={task.assignee} />
          <label className="sr-only" htmlFor={`handoff-${task.id}`}>
            Hand off {task.title} to
          </label>
          <select
            id={`handoff-${task.id}`}
            value={task.assignee}
            onChange={(e) => onHandOff(task, e.target.value)}
            title="Hand off to…"
            className="w-24 cursor-pointer truncate rounded-md border border-transparent bg-transparent py-0.5 pl-1 pr-6 text-xs text-ink-primary hover:border-surface-line focus:border-brand-primary focus:outline-none"
          >
            {TEAM.map((n) => (
              <option key={n} value={n}>
                {n === task.assignee ? n : `Hand off to ${n}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2 flex justify-end border-t border-surface-line/60 pt-2">
        <CopyContextButton task={task} onCopied={onCopied} now={now} />
      </div>
    </li>
  );
}

function Column({ stage, tasks, onOpen, onHandOff, onCopied, onMove, flashId, now }) {
  const headingId = `col-${stage.id}`;
  const [over, setOver] = useState(false);
  return (
    <section
      aria-labelledby={headingId}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!over) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onMove(id, stage.id);
      }}
      className={`flex min-h-[18rem] flex-col rounded-xl border p-3 transition ${
        over ? 'border-brand-accent bg-brand-accent/[0.06]' : 'border-surface-line bg-surface-page/60'
      }`}
    >
      <h2
        id={headingId}
        className="mb-3 flex items-center justify-between px-1 text-[13px] font-semibold uppercase tracking-wider text-ink-muted"
      >
        {stage.label}
        <span className="rounded-full bg-surface-raised px-2 py-0.5 font-mono text-xs text-ink-primary">
          {tasks.length}
        </span>
      </h2>
      {tasks.length === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-surface-line p-4 text-center text-sm text-ink-muted">
          Nothing here yet — drop a task in.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={onOpen} onHandOff={onHandOff} onCopied={onCopied} onMove={onMove} flash={flashId === t.id} now={now} />
          ))}
        </ul>
      )}
    </section>
  );
}

// --- M9 task-context -----------------------------------------------------

export const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

export const CONTEXT_TEMPLATE = `## Background
What is this task and why does it matter?

## Constraints
Stack, files, design rules the AI must respect.

## Tried so far
Prompts / approaches already used and what happened.

## Pick up
The exact next step for whoever (or whatever) continues.`;

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

/** Tiny Markdown preview: headings, lists, bold, inline code. Escapes HTML first. */
function renderMarkdown(md) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code class="rounded bg-surface-raised px-1 font-mono text-[12px]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  let html = '';
  let inList = false;
  for (const line of md.split('\n')) {
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (li) {
      if (!inList) { html += '<ul class="ml-4 list-disc">'; inList = true; }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) html += `<p class="mt-3 font-display font-semibold text-brand-accent">${inline(h[2])}</p>`;
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

function ContextField({ draft, setDraft, now }) {
  const [tab, setTab] = useState('write');
  return (
    <div className="rounded-lg border border-brand-primary/30 bg-brand-primary/[0.04] p-4 sm:col-span-2">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="f-context" className={labelCls + ' mb-0 text-brand-primary'}>
          Context — paste-ready briefing for the next AI or teammate
        </label>
        <div role="tablist" aria-label="Context view" className="flex rounded-md border border-surface-line text-xs">
          {['write', 'preview'].map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${tab === t ? 'bg-surface-raised text-ink-primary' : 'text-ink-muted'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === 'write' ? (
        <textarea
          id="f-context"
          rows={9}
          value={draft.context}
          onChange={(e) =>
            setDraft((d) => ({ ...d, context: e.target.value, contextUpdatedAt: new Date().toISOString() }))
          }
          className={`${fieldCls} font-mono text-[13px] leading-relaxed`}
          aria-describedby="context-meta"
        />
      ) : (
        <div
          className="min-h-[13rem] space-y-1 rounded-lg border border-surface-line bg-surface-page px-3 py-2 text-sm"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.context || 'Nothing yet.') }}
        />
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="f-tool" className="whitespace-nowrap text-xs text-ink-muted">AI tool</label>
          <select
            id="f-tool"
            value={draft.contextTool ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, contextTool: e.target.value || null }))}
            className={`${fieldCls} w-auto py-1 text-xs`}
          >
            <option value="">— none —</option>
            {AI_TOOLS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <p id="context-meta" className="text-xs text-ink-muted">
          Last updated <span className="font-mono">{timeAgo(draft.contextUpdatedAt, now)}</span>
        </p>
      </div>
    </div>
  );
}

// --- M10 copy-context ----------------------------------------------------

/** Serialise a task into a briefing that reads naturally when pasted into an AI chat. */
export function buildContextBlock(task, now = new Date()) {
  const stage = STAGES.find((x) => x.id === task.status)?.label ?? task.status;
  const due = dueState(task, now).label;
  const lines = [
    `# Task: ${task.title}`,
    '',
    `- **Type:** ${TYPE_STYLE[task.type].label}`,
    `- **Status:** ${stage}`,
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

function CopyIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CopyContextButton({ task, onCopied, now, size = 'sm' }) {
  const copy = async () => {
    const ok = await copyText(buildContextBlock(task, now));
    onCopied(ok ? 'Context copied. Paste it into your AI and keep vibing.' : 'Copy failed — select the text manually.', task.id);
  };
  const cls =
    size === 'sm'
      ? 'gap-1 rounded-md border border-surface-line px-2 py-1 text-[11px] text-ink-muted hover:border-brand-accent hover:text-brand-accent'
      : 'gap-1.5 rounded-lg border border-brand-accent/50 px-3 py-2 text-sm text-brand-accent hover:bg-brand-accent/10';
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy context for ${task.title}`}
      className={`relative z-10 inline-flex items-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${cls}`}
    >
      <CopyIcon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      Copy Context
    </button>
  );
}

// --- M5 crud-modal -------------------------------------------------------

const emptyTask = () => ({
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
});

const fieldCls =
  'w-full rounded-lg border border-surface-line bg-surface-page px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted';

function TaskModal({ task, onSave, onDelete, onClose, onCopied, now }) {
  const isNew = !task.id;
  const [draft, setDraft] = useState({
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
    ...task,
    dueDate: task.dueDate ?? '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  // Focus the title on open, close on Esc, keep Tab inside the dialog.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    titleRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const els = dialogRef.current.querySelectorAll(
          'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'
        );
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, title: draft.title.trim(), dueDate: draft.dueDate || null });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-surface-line bg-surface-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="task-modal-title" className="flex items-center gap-3 font-display text-lg font-semibold">
            {isNew ? 'New task' : 'Edit task'}
            <TypeChip type={draft.type} />
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-ink-muted hover:text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="f-title" className={labelCls}>Title *</label>
            <input id="f-title" ref={titleRef} required value={draft.title} onChange={set('title')} className={fieldCls} placeholder="e.g. Fix nav overlap on scroll" />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="f-desc" className={labelCls}>Description</label>
            <textarea id="f-desc" rows={3} value={draft.description} onChange={set('description')} className={fieldCls} placeholder="What does done look like?" />
          </div>

          <fieldset>
            <legend className={labelCls}>Type</legend>
            <div className="flex gap-2">
              {Object.keys(TYPE_STYLE).map((t) => (
                <label
                  key={t}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-brand-primary ${
                    draft.type === t ? `${TYPE_STYLE[t].chip} border-transparent` : 'border-surface-line text-ink-muted hover:bg-surface-raised'
                  }`}
                >
                  <input type="radio" name="type" value={t} checked={draft.type === t} onChange={set('type')} className="sr-only" />
                  <TypeIcon type={t} className="h-4 w-4" />
                  {TYPE_STYLE[t].label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="f-status" className={labelCls}>Status</label>
            <select id="f-status" value={draft.status} onChange={set('status')} className={fieldCls}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="f-assignee" className={labelCls}>Assignee</label>
            <select id="f-assignee" value={draft.assignee} onChange={set('assignee')} className={fieldCls}>
              {TEAM.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="f-due" className={labelCls}>Due date</label>
            <input id="f-due" type="date" value={draft.dueDate} onChange={set('dueDate')} className={`${fieldCls} [color-scheme:dark]`} />
          </div>

          <ContextField draft={draft} setDraft={setDraft} now={now} />

          <p className="text-xs text-ink-muted sm:col-span-2">
            Created <span className="font-mono">{draft.createdDate}</span>
          </p>

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-surface-line pt-4 sm:col-span-2">
            {!isNew ? (
              confirmDelete ? (
                <div role="alert" className="flex items-center gap-2 text-sm">
                  <span className="text-due-overdue">Delete this task? This can't be undone.</span>
                  <button type="button" onClick={() => onDelete(task.id)} className="rounded-lg bg-due-overdue px-3 py-1.5 font-medium text-white hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-surface-line px-3 py-1.5 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">Keep</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-lg border border-due-overdue/50 px-3 py-2 text-sm text-due-overdue hover:bg-due-overdue/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-due-overdue">
                  Delete task
                </button>
              )
            ) : (
              <span />
            )}
            <div className="flex flex-wrap gap-2">
              <CopyContextButton
                task={{ ...draft, title: draft.title || 'Untitled task', dueDate: draft.dueDate || null }}
                onCopied={onCopied}
                now={now}
                size="md"
              />
              <button type="button" onClick={onClose} className="rounded-lg border border-surface-line px-4 py-2 text-sm hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">Cancel</button>
              <button type="submit" className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-surface-page hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {isNew ? 'Create task' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- M11 project-deliverables ---------------------------------------------

export const DEFAULT_ANCHORS = [
  { id: 'presentation', label: 'Presentation', url: null },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

const isUrl = (v) => /^https?:\/\/\S+\.\S+/.test(v);

function AnchorCard({ anchor, onChange }) {
  const [value, setValue] = useState(anchor.url ?? '');
  const filled = Boolean(anchor.url);
  const invalid = value.trim() !== '' && !isUrl(value.trim());
  const inputId = `anchor-${anchor.id}`;

  const commit = () => {
    const v = value.trim();
    if (v === '' ) onChange(anchor.id, null);
    else if (isUrl(v)) onChange(anchor.id, v);
  };

  return (
    <li className={`rounded-xl border p-3 transition ${filled ? 'border-feature/40 bg-feature/[0.06]' : 'border-dashed border-surface-line bg-surface-card'}`}>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm font-semibold">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${filled ? 'bg-feature' : 'border border-ink-muted'}`}
          />
          {anchor.label}
        </label>
        <span className={`font-mono text-[11px] ${filled ? 'text-feature' : 'text-ink-muted'}`}>
          {filled ? 'Linked' : 'Empty'}
        </span>
      </div>
      <div className="flex gap-1.5">
        <input
          id={inputId}
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${inputId}-err` : undefined}
          className={`${fieldCls} py-1.5 text-xs ${invalid ? 'border-due-overdue' : ''}`}
        />
        {filled && (
          <a
            href={anchor.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${anchor.label} link in a new tab`}
            className="grid shrink-0 place-items-center rounded-lg border border-surface-line px-2 text-ink-muted hover:border-brand-accent hover:text-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
          </a>
        )}
      </div>
      {invalid && (
        <p id={`${inputId}-err`} className="mt-1 text-[11px] text-due-overdue">
          Enter a full link starting with http:// or https://
        </p>
      )}
    </li>
  );
}

function AnchorBoard({ anchors, onChange }) {
  const done = anchors.filter((a) => a.url).length;
  return (
    <section aria-labelledby="anchors-title" className="mb-6 rounded-xl border border-surface-line bg-surface-page p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="anchors-title" className="text-[13px] font-semibold uppercase tracking-wider text-ink-muted">
          Final deliverables
        </h2>
        <span className="font-mono text-xs text-ink-muted">
          {done}/{anchors.length} linked
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {anchors.map((a) => (
          <AnchorCard key={a.id} anchor={a} onChange={onChange} />
        ))}
      </ul>
    </section>
  );
}

/** Who is driving what — open (not done) tasks per teammate. */
function DriverStrip({ tasks }) {
  return (
    <section aria-label="Who is driving what" className="mb-5 flex flex-wrap gap-3">
      {TEAM.map((name) => {
        const open = tasks.filter((t) => t.assignee === name && t.status !== 'done');
        return (
          <div key={name} className="flex items-center gap-2 rounded-full border border-surface-line bg-surface-card py-1 pl-1 pr-3 text-sm">
            <Avatar name={name} />
            <span className="font-medium">{name}</span>
            <span className="text-ink-muted">
              driving <span className="font-mono text-ink-primary">{open.length}</span>
            </span>
          </div>
        );
      })}
    </section>
  );
}

function DueLegend() {
  const items = [
    ['safe', 'More than 2 days'],
    ['soon', '1–2 days'],
    ['warning', 'Due today'],
    ['overdue', 'Overdue'],
    ['neutral', 'Done'],
  ];
  return (
    <ul aria-label="Due date colour legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
      {items.map(([k, label]) => (
        <li key={k} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DUE_STYLE[k].dot.replace(' animate-pulse', '')}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Announces short status messages visually and to screen readers. */
function Toast({ message }) {
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      {message && (
        <div className="animate-[fadein_200ms_ease-out] rounded-lg border border-brand-accent/40 bg-surface-raised px-4 py-2 text-sm text-ink-primary shadow-xl">
          {message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', DEFAULT_ANCHORS);
  const setAnchorUrl = (id, url) =>
    setAnchors((all) => all.map((a) => (a.id === id ? { ...a, url } : a)));
  const [editing, setEditing] = useState(null); // a Task (id '' = new) or null
  const [toast, setToast] = useState('');
  // Re-evaluate due tints every minute so colours change with no user action.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const [flashId, setFlashId] = useState(null);
  const toastTimer = useRef(null);

  const notify = (msg, id = null) => {
    setToast(msg);
    setFlashId(id);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast('');
      setFlashId(null);
    }, 2400);
  };

  // --- M12 secret-sauce: drag-and-drop between columns (+ keyboard alternative)
  const moveTask = (id, status, keepFocus = false) => {
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status === status) return;
    setTasks((all) => all.map((x) => (x.id === id ? { ...x, status } : x)));
    const label = STAGES.find((x) => x.id === status).label;
    notify(status === 'done' ? `“${t.title}” shipped. Nice.` : `Moved “${t.title}” to ${label}.`, id);
    if (keepFocus) {
      requestAnimationFrame(() =>
        document.querySelector(`[data-task-id="${id}"] h3 button`)?.focus()
      );
    }
  };

  const handOff = (task, name) => {
    if (name === task.assignee) return;
    setTasks((all) => all.map((x) => (x.id === task.id ? { ...x, assignee: name } : x)));
    notify(`Handed off to ${name}. They've got it.`, task.id);
  };

  const saveTask = (t) => {
    setTasks((all) =>
      t.id
        ? all.map((x) => (x.id === t.id ? t : x))
        : [...all, { ...t, id: `t${Date.now()}` }]
    );
    setEditing(null);
  };

  const deleteTask = (id) => {
    setTasks((all) => all.filter((x) => x.id !== id));
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-surface-page p-6 text-ink-primary">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-primary">
            <span className="mr-1 text-brand-accent" aria-hidden="true">▍</span>Vibe Ledger
          </h1>
          <p className="text-sm text-ink-muted">Every task, every prompt, one board.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyTask())}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-surface-page hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          + New task
        </button>
      </header>

      <AnchorBoard anchors={anchors} onChange={setAnchorUrl} />

      <DriverStrip tasks={tasks} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <DueLegend />
        <p className="text-xs text-ink-muted">
          Drag cards between columns — or focus a card and press{' '}
          <kbd className="rounded border border-surface-line px-1 font-mono">Alt</kbd> +{' '}
          <kbd className="rounded border border-surface-line px-1 font-mono">←</kbd>/<kbd className="rounded border border-surface-line px-1 font-mono">→</kbd>
        </p>
      </div>

      <main className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
            onOpen={setEditing}
            onHandOff={handOff}
            onCopied={notify}
            onMove={moveTask}
            flashId={flashId}
            now={now}
          />
        ))}
      </main>

      {editing && (
        <TaskModal
          task={editing}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setEditing(null)}
          onCopied={(msg) => notify(msg)}
          now={now}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
