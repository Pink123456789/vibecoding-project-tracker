import { useState, useEffect } from 'react';

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

const initials = (name) => name.slice(0, 2).toUpperCase();

function TaskCard({ task }) {
  return (
    <li className="rounded-lg border border-surface-line bg-surface-card p-3">
      <h3 className="text-sm font-medium text-ink-primary">{task.title}</h3>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
        <span className="font-mono">{task.dueDate ?? 'no due date'}</span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded-full bg-surface-raised font-mono text-[10px] text-ink-primary"
          >
            {initials(task.assignee)}
          </span>
          <span className="sr-only">Assigned to </span>
          {task.assignee}
        </span>
      </div>
    </li>
  );
}

function Column({ stage, tasks }) {
  const headingId = `col-${stage.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[18rem] flex-col rounded-xl border border-surface-line bg-surface-page/60 p-3"
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
            <TaskCard key={t.id} task={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const [tasks] = useLocalStorage('vibetracker.tasks', SEED_TASKS);

  return (
    <div className="min-h-screen bg-surface-page p-6 text-ink-primary">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-primary">
            <span className="mr-1 text-brand-accent" aria-hidden="true">▍</span>Vibe Ledger
          </h1>
          <p className="text-sm text-ink-muted">Every task, every prompt, one board.</p>
        </div>
      </header>

      {/* TODO M11 anchors: render the Anchor Board above the board. */}

      <main className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={tasks.filter((t) => t.status === stage.id)}
          />
        ))}
      </main>
    </div>
  );
}
