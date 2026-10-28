import { useEffect, useRef } from 'react';
import { TYPES, dueState } from '../lib/model.js';

// --- Shared class strings --------------------------------------------------------

export const fieldCls =
  'w-full rounded-lg border border-surface-line bg-surface-page px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 min-h-[44px] md:min-h-0';
export const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-muted';
export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-line px-3 py-2 text-sm text-ink-primary hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-h-[44px] md:min-h-0';
export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-surface-page hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page min-h-[44px] md:min-h-0';
export const iconBtn =
  'inline-grid place-items-center rounded-lg border border-surface-line text-ink-muted hover:border-brand-accent hover:text-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent h-11 w-11 md:h-9 md:w-9';

// --- Icons (inline SVG, decorative: aria-hidden) ------------------------------------

const Svg = ({ className = 'h-4 w-4', children }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export const Icon = {
  copy: (p) => (
    <Svg {...p}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  ),
  speaker: (p) => (
    <Svg {...p}>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
    </Svg>
  ),
  stop: (p) => (
    <Svg {...p}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </Svg>
  ),
  close: (p) => (
    <Svg {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  ),
  access: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="4.5" r="1.5" />
      <path d="M5 8.5 12 10l7-1.5M12 10v4.5M9 21l3-6.5 3 6.5" />
    </Svg>
  ),
  help: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </Svg>
  ),
  search: (p) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  ),
  filter: (p) => (
    <Svg {...p}>
      <path d="M3 5h18l-7 8v6l-4 2v-8z" />
    </Svg>
  ),
  plus: (p) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  external: (p) => (
    <Svg {...p}>
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  ),
  chevron: (p) => (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  history: (p) => (
    <Svg {...p}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </Svg>
  ),
  download: (p) => (
    <Svg {...p}>
      <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3" />
    </Svg>
  ),
  upload: (p) => (
    <Svg {...p}>
      <path d="M12 15V3m0 0L8 7m4-4 4 4M4 17v3h16v-3" />
    </Svg>
  ),
};

// --- M6 type styling ------------------------------------------------------------

/** One source of truth for how each task type looks, everywhere it renders. */
export const TYPE_STYLE = {
  feature: {
    label: TYPES.feature,
    stripe: 'border-l-feature',
    text: 'text-feature',
    chip: 'bg-feature/15 text-feature ring-1 ring-feature/40',
  },
  bug: {
    label: TYPES.bug,
    stripe: 'border-l-bug',
    text: 'text-bug',
    chip: 'bg-bug/15 text-bug ring-1 ring-bug/40',
  },
};

export function TypeIcon({ type, className = 'h-3.5 w-3.5' }) {
  return type === 'bug' ? (
    <Svg className={className}>
      <path d="M8 2l1.9 1.9M16 2l-1.9 1.9M9 7.1V6a3 3 0 1 1 6 0v1.1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
      <path d="M12 20v-9M6.5 13H3M21 13h-3.5M6 9 3.5 7M18 9l2.5-2M6 17l-2.5 2M18 17l2.5 2" />
    </Svg>
  ) : (
    <Svg className={className}>
      <path d="M12 3l1.9 5.8L20 10l-5 3.6L16.5 20 12 16.4 7.5 20 9 13.6 4 10l6.1-1.2z" />
    </Svg>
  );
}

export function TypeChip({ type }) {
  const st = TYPE_STYLE[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] ${st.chip}`}>
      <TypeIcon type={type} />
      {st.label}
    </span>
  );
}

// --- M8 due styling ----------------------------------------------------------------

export const DUE_STYLE = {
  safe: { card: '', pill: 'text-due-safe', dot: 'bg-due-safe', shape: 'rounded-full' },
  soon: { card: '!bg-due-soon/[0.08]', pill: 'text-due-soon', dot: 'bg-due-soon', shape: 'rounded-full' },
  warning: { card: '!bg-due-warning/[0.12] ring-1 ring-due-warning/60', pill: 'text-due-warning', dot: 'bg-due-warning', shape: 'rotate-45 rounded-[1px]' },
  overdue: { card: '!bg-due-overdue/[0.14] ring-1 ring-due-overdue/70', pill: 'text-due-overdue font-semibold', dot: 'bg-due-overdue animate-pulse', shape: 'rounded-[1px]' },
  neutral: { card: '!bg-surface-card/60', pill: 'text-due-neutral', dot: 'bg-due-neutral', shape: 'rounded-full' },
  none: { card: '', pill: 'text-ink-muted', dot: 'border border-ink-muted', shape: 'rounded-full' },
};

/** Due state is shown with text + a shaped dot, never colour alone (WCAG 1.4.1). */
export function DuePill({ task, now }) {
  const ds = dueState(task, now);
  const st = DUE_STYLE[ds.key];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-mono ${st.pill}`} title={task.dueDate ?? ''}>
      <span aria-hidden="true" className={`h-2 w-2 ${st.shape} ${st.dot}`} />
      {ds.label}
    </span>
  );
}

// --- M7 avatars ---------------------------------------------------------------------

export const PERSON_STYLE = {
  Taygun: 'bg-person-taygun text-surface-page',
  Claude: 'bg-person-claude text-surface-page',
  Gemini: 'bg-person-gemini text-surface-page',
};
// Anyone else gets a stable colour from their name (all pass contrast with text-surface-page).
const EXTRA_STYLES = [
  'bg-feature text-surface-page',
  'bg-due-soon text-surface-page',
  'bg-bug text-surface-page',
  'bg-brand-primary text-surface-page',
  'bg-brand-accent text-surface-page',
  'bg-due-warning text-surface-page',
];
export const personStyle = (name = '') => {
  if (PERSON_STYLE[name]) return PERSON_STYLE[name];
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return EXTRA_STYLES[h % EXTRA_STYLES.length];
};
export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || '?').slice(0, 2).toUpperCase();
};

export function Avatar({ name, size = 'h-7 w-7 text-[0.6875rem]' }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full font-mono font-semibold ${size} ${personStyle(name)}`}>
      {initials(name)}
    </span>
  );
}

// --- Dialog: focus trap, Esc to close, focus returns, full-screen on phones ---------

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function Dialog({ titleId, onClose, initialFocusRef, children, maxWidth = 'sm:max-w-2xl' }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    (initialFocusRef?.current || ref.current?.querySelector(FOCUSABLE))?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab' && ref.current) {
        const els = [...ref.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!els.length) return;
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // Backdrop click is a mouse shortcut for closing; Esc and the Close button are the keyboard equivalents.
    <div
      role="presentation"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex h-[100dvh] w-full flex-col overflow-y-auto border-surface-line bg-surface-card shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-xl sm:border ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ id, title, onClose, children }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-surface-line bg-surface-card px-4 py-3 sm:px-6 sm:py-4">
      <h2 id={id} className="flex min-w-0 flex-wrap items-center gap-3 font-display text-lg font-semibold">
        {title}
        {children}
      </h2>
      <button type="button" onClick={onClose} aria-label="Close dialog" className={iconBtn}>
        <Icon.close className="h-5 w-5" />
      </button>
    </div>
  );
}

// --- Read-aloud button -------------------------------------------------------------

export function SpeakButton({ speech, id, text, label, showLabel = false, className = '' }) {
  if (!speech.supported) return null;
  const active = speech.speakingId === id;
  return (
    <button
      type="button"
      onClick={() => speech.speak(typeof text === 'function' ? text() : text, id)}
      aria-label={active ? `Stop reading ${label}` : `Read aloud: ${label}`}
      aria-pressed={active}
      title={active ? 'Stop reading' : 'Read aloud'}
      className={`${showLabel ? btnGhost : iconBtn} ${active ? '!border-brand-accent !text-brand-accent' : ''} ${className}`}
    >
      {active ? <Icon.stop className="h-4 w-4" /> : <Icon.speaker className="h-4 w-4" />}
      {showLabel && <span>{active ? 'Stop' : 'Read aloud'}</span>}
    </button>
  );
}
