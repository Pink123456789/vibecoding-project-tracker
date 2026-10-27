import { useEffect, useRef, useState } from 'react';
import { DUE_FILTERS, TEAM, filtersActive, EMPTY_FILTERS } from '../lib/model.js';
import { Avatar, DUE_STYLE, Icon, TYPE_STYLE, TypeIcon, btnGhost, fieldCls } from './ui.jsx';

// --- M11 Deliverable anchors (collapsible so it doesn't push the board off a phone screen) ---

const isUrl = (v) => /^https?:\/\/\S+\.\S+/.test(v);

function AnchorCard({ anchor, onChange }) {
  const [value, setValue] = useState(anchor.url ?? '');
  useEffect(() => setValue(anchor.url ?? ''), [anchor.url]);
  const filled = Boolean(anchor.url);
  const invalid = value.trim() !== '' && !isUrl(value.trim());
  const inputId = `anchor-${anchor.id}`;

  const commit = () => {
    const v = value.trim();
    if (v === '') onChange(anchor.id, null);
    else if (isUrl(v)) onChange(anchor.id, v);
  };

  return (
    <li className={`rounded-xl border p-3 transition ${filled ? 'border-feature/50 bg-feature/[0.07]' : 'border-dashed border-surface-line bg-surface-card'}`}>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${filled ? 'bg-feature' : 'border border-ink-muted'}`} />
          {anchor.label}
        </label>
        <span className={`font-mono text-[0.75rem] ${filled ? 'text-feature' : 'text-ink-muted'}`}>{filled ? '✓ Linked' : 'Empty'}</span>
      </div>
      <div className="flex gap-1.5">
        <input
          id={inputId}
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${inputId}-err` : undefined}
          className={`${fieldCls} py-1.5 text-xs ${invalid ? '!border-due-overdue' : ''}`}
        />
        {filled && (
          <a
            href={anchor.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${anchor.label} link in a new tab`}
            className="grid min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-lg border border-surface-line px-2 text-ink-muted hover:border-brand-accent hover:text-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-0 md:min-w-0"
          >
            <Icon.external />
          </a>
        )}
      </div>
      {invalid && (
        <p id={`${inputId}-err`} className="mt-1 text-[0.75rem] text-due-overdue">
          Enter a full link starting with http:// or https://
        </p>
      )}
    </li>
  );
}

export function AnchorBoard({ anchors, onChange, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const done = anchors.filter((a) => a.url).length;
  return (
    <section aria-labelledby="anchors-title" className="mb-5 rounded-xl border border-surface-line bg-surface-page">
      <h2 id="anchors-title" className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="anchors-body"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <span className="text-[0.8125rem] font-semibold uppercase tracking-wider text-ink-muted">Final deliverables</span>
          <span className="flex items-center gap-2 font-mono text-xs text-ink-muted">
            {done}/{anchors.length} linked
            <Icon.chevron className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </h2>
      {open && (
        <ul id="anchors-body" className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
          {anchors.map((a) => (
            <AnchorCard key={a.id} anchor={a} onChange={onChange} />
          ))}
        </ul>
      )}
    </section>
  );
}

// --- M7 Driver strip — now doubles as an owner filter -----------------------------------

export function DriverStrip({ tasks, owner, onToggleOwner }) {
  return (
    <section aria-label="Who is driving what (select to filter)" className="flex flex-wrap gap-2">
      {TEAM.map((name) => {
        const open = tasks.filter((t) => t.assignee === name && t.status !== 'done').length;
        const pressed = owner === name;
        return (
          <button
            key={name}
            type="button"
            aria-pressed={pressed}
            onClick={() => onToggleOwner(name)}
            className={`flex min-h-[44px] items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:min-h-0 ${
              pressed ? 'border-brand-primary bg-brand-primary/15' : 'border-surface-line bg-surface-card hover:border-brand-primary/60'
            }`}
          >
            <Avatar name={name} />
            <span className="font-medium">{name}</span>
            <span className="text-ink-muted">
              driving <span className="font-mono text-ink-primary">{open}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}

// --- Search & filters ---------------------------------------------------------------------

export function FilterBar({ filters, setFilters, shown, total, searchRef }) {
  const [openMobile, setOpenMobile] = useState(false);
  const active = filtersActive(filters);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const selCls = `${fieldCls} md:w-auto md:py-1.5 text-sm`;
  return (
    <section aria-label="Search and filter tasks" className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="search" className="sr-only">
            Search tasks
          </label>
          <Icon.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="search"
            ref={searchRef}
            type="search"
            value={filters.q}
            onChange={set('q')}
            placeholder="Search tasks…"
            aria-keyshortcuts="/"
            className={`${fieldCls} pl-9 md:py-1.5`}
          />
        </div>
        <button
          type="button"
          onClick={() => setOpenMobile((o) => !o)}
          aria-expanded={openMobile}
          aria-controls="filter-controls"
          className={`${btnGhost} md:hidden`}
        >
          <Icon.filter />
          Filters{active ? ' •' : ''}
        </button>
      </div>

      <div id="filter-controls" className={`${openMobile ? 'grid' : 'hidden'} grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center`}>
        <label className="sr-only" htmlFor="filter-owner">
          Owner
        </label>
        <select id="filter-owner" value={filters.owner} onChange={set('owner')} className={selCls}>
          <option value="all">Anyone</option>
          {TEAM.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="filter-type">
          Type
        </label>
        <select id="filter-type" value={filters.type} onChange={set('type')} className={selCls}>
          <option value="all">Features &amp; bugs</option>
          <option value="feature">Features only</option>
          <option value="bug">Bugs only</option>
        </select>
        <label className="sr-only" htmlFor="filter-due">
          Due date
        </label>
        <select id="filter-due" value={filters.due} onChange={set('due')} className={selCls}>
          {DUE_FILTERS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <p aria-live="polite" className="text-xs text-ink-muted md:ml-auto">
          {active ? `Showing ${shown} of ${total} tasks` : `${total} tasks`}
        </p>
        {active && (
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className={`${btnGhost} md:py-1 md:text-xs`}>
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}

// --- Legend: colour + shape + text for every state --------------------------------------

export function Legend() {
  const due = [
    ['safe', 'More than 2 days'],
    ['soon', '1–2 days'],
    ['warning', 'Due today'],
    ['overdue', 'Overdue'],
    ['neutral', 'Done'],
  ];
  return (
    <ul aria-label="Colour legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
      {Object.entries(TYPE_STYLE).map(([k, st]) => (
        <li key={k} className={`flex items-center gap-1 ${st.text}`}>
          <TypeIcon type={k} />
          {st.label}
        </li>
      ))}
      {due.map(([k, label]) => (
        <li key={k} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`h-2 w-2 ${DUE_STYLE[k].shape} ${DUE_STYLE[k].dot.replace(' animate-pulse', '')}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

// --- Toast with optional Undo (Nielsen #3: user control & freedom) ---------------------------

export function Toast({ toast, onAction, onDismiss, overDialog }) {
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!toast || paused) return undefined;
    // Toasts with an action stay longer, and pause while hovered or focused (WCAG 2.2.1).
    timer.current = setTimeout(onDismiss, toast.action ? 8000 : 3000);
    return () => clearTimeout(timer.current);
  }, [toast, paused, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 ${overDialog ? 'top-16 sm:bottom-6 sm:top-auto' : 'bottom-24 md:bottom-6'}`}
    >
      {toast && (
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="pointer-events-auto flex max-w-md animate-[fadein_200ms_ease-out] items-center gap-3 rounded-lg border border-brand-accent/50 bg-surface-raised px-4 py-2 text-sm text-ink-primary shadow-xl"
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={onAction}
              className="min-h-[44px] shrink-0 rounded-md px-2 font-semibold text-brand-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-0"
            >
              {toast.action.label}
            </button>
          )}
          <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="grid h-11 w-11 md:h-8 md:w-8 shrink-0 place-items-center rounded-md text-ink-muted hover:text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent">
            <Icon.close className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- First-visit onboarding (Nielsen #10: help & documentation) -------------------------------

export function Welcome({ onDismiss, onHelp }) {
  return (
    <section aria-labelledby="welcome-title" className="mb-5 rounded-xl border border-brand-primary/50 bg-brand-primary/[0.07] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="welcome-title" className="font-display text-base font-semibold">
            New here? Three steps:
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-primary">
            <li>
              <b>+ New task</b> — give it a title, owner and due date.
            </li>
            <li>
              Fill in its <b>Context</b>: what you tried and where to pick up.
            </li>
            <li>
              Press <b>Copy Context</b> and paste it into your AI to continue.
            </li>
          </ol>
          <p className="mt-2 text-xs text-ink-muted">Need bigger text, other colours or read-aloud? Open Accessibility in the header.</p>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss welcome message" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-ink-muted hover:text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:h-8 md:w-8">
          <Icon.close />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onDismiss} className={btnGhost}>
          Got it
        </button>
        <button type="button" onClick={onHelp} className={btnGhost}>
          <Icon.help /> Show all help
        </button>
      </div>
    </section>
  );
}
