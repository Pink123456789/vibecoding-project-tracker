import { useRef, useState } from 'react';
import { AI_TOOLS, STAGES, formatDateTime, normalizeName, renderMarkdown, taskToSpeech, timeAgo } from '../lib/model.js';
import { CopyContextButton } from './Board.jsx';
import { Dialog, DialogHeader, Icon, SpeakButton, TYPE_STYLE, TypeChip, TypeIcon, btnGhost, btnPrimary, fieldCls, labelCls } from './ui.jsx';

// --- M9 Context field + prompt history -------------------------------------------------

function ContextHistory({ history, onRestore }) {
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  if (!history?.length) return null;
  return (
    <div className="mt-3 rounded-lg border border-surface-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="context-history"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:min-h-0"
      >
        <span className="flex items-center gap-2">
          <Icon.history className="h-4 w-4" />
          Prompt history ({history.length} earlier version{history.length === 1 ? '' : 's'})
        </span>
        <Icon.chevron className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ol id="context-history" className="divide-y divide-surface-line border-t border-surface-line">
          {history.map((h, i) => (
            <li key={`${h.at}-${i}`} className="px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-ink-muted">
                  <time dateTime={h.at}>{formatDateTime(h.at)}</time>
                  {h.tool ? ` · for ${h.tool}` : ''}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewing(viewing === i ? null : i)}
                    aria-expanded={viewing === i}
                    className="min-h-[44px] rounded-md px-2 text-xs text-brand-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-0"
                  >
                    {viewing === i ? 'Hide' : 'View'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRestore(h)}
                    className="min-h-[44px] rounded-md px-2 text-xs text-brand-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-0"
                  >
                    Restore
                  </button>
                </span>
              </div>
              {viewing === i ? (
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-surface-page p-2 font-mono text-[0.75rem] text-ink-primary">{h.text}</pre>
              ) : (
                <p className="mt-1 truncate font-mono text-[0.75rem] text-ink-muted">{h.text.split('\n').find((l) => l.trim() && !l.startsWith('#')) ?? h.text}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ContextField({ draft, setDraft, now, onRestored }) {
  const [tab, setTab] = useState('write');
  return (
    <div className="rounded-lg border border-brand-primary/40 bg-brand-primary/[0.05] p-3 sm:col-span-2 sm:p-4">
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
              className={`min-h-[44px] px-3 py-1 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:min-h-0 ${
                tab === t ? 'bg-surface-raised text-ink-primary' : 'text-ink-muted'
              }`}
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
          onChange={(e) => setDraft((d) => ({ ...d, context: e.target.value, contextUpdatedAt: new Date().toISOString() }))}
          className={`${fieldCls} font-mono text-[0.8125rem] leading-relaxed`}
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
          <label htmlFor="f-tool" className="whitespace-nowrap text-xs text-ink-muted">
            AI tool
          </label>
          <select
            id="f-tool"
            value={draft.contextTool ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, contextTool: e.target.value || null }))}
            className={`${fieldCls} w-auto py-1 text-xs`}
          >
            <option value="">— none —</option>
            {AI_TOOLS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <p id="context-meta" className="text-xs text-ink-muted">
          Last updated <span className="font-mono">{timeAgo(draft.contextUpdatedAt, now)}</span>
        </p>
      </div>
      <ContextHistory
        history={draft.contextHistory}
        onRestore={(h) => {
          setDraft((d) => ({ ...d, context: h.text, contextTool: h.tool ?? d.contextTool, contextUpdatedAt: new Date().toISOString() }));
          setTab('write');
          onRestored();
        }}
      />
    </div>
  );
}

// --- M5 add / edit / delete modal ---------------------------------------------------------

export function TaskModal({ task, onSave, onDelete, onClose, onNotify, now, speech, prefs, people }) {
  const isNew = !task.id;
  const [draft, setDraft] = useState({
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
    contextHistory: [],
    ...task,
    dueDate: task.dueDate ?? '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [assigneeError, setAssigneeError] = useState(false);
  const titleRef = useRef(null);
  const assigneeRef = useRef(null);

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));
  const close = () => {
    speech.stop();
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }
    const assignee = normalizeName(draft.assignee);
    if (!assignee) {
      setAssigneeError(true);
      assigneeRef.current?.focus();
      return;
    }
    // Match an existing person regardless of case, so "claude" doesn't create a second Claude.
    const known = people.find((p) => p.toLowerCase() === assignee.toLowerCase());
    speech.stop();
    onSave({ ...draft, title: draft.title.trim(), assignee: known ?? assignee, dueDate: draft.dueDate || null });
  };

  const asTask = { ...draft, title: draft.title || 'Untitled task', dueDate: draft.dueDate || null };

  return (
    <Dialog titleId="task-modal-title" onClose={close} initialFocusRef={titleRef}>
      <DialogHeader id="task-modal-title" title={isNew ? 'New task' : 'Edit task'} onClose={close}>
        <TypeChip type={draft.type} />
      </DialogHeader>

      <form onSubmit={submit} noValidate className="grid flex-1 grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <label htmlFor="f-title" className={labelCls}>
            Title <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="f-title"
            ref={titleRef}
            required
            aria-required="true"
            aria-invalid={titleError}
            aria-describedby={titleError ? 'f-title-err' : undefined}
            value={draft.title}
            onChange={(e) => {
              set('title')(e);
              if (e.target.value.trim()) setTitleError(false);
            }}
            className={`${fieldCls} ${titleError ? '!border-due-overdue' : ''}`}
            placeholder="e.g. Fix nav overlap on scroll"
          />
          {titleError && (
            <p id="f-title-err" role="alert" className="mt-1 text-xs text-due-overdue">
              Give the task a title so you can find it on the board.
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="f-desc" className={labelCls}>
            Description
          </label>
          <textarea id="f-desc" rows={3} value={draft.description} onChange={set('description')} className={fieldCls} placeholder="What does done look like?" />
        </div>

        <fieldset>
          <legend className={labelCls}>Type</legend>
          <div className="flex gap-2">
            {Object.keys(TYPE_STYLE).map((t) => (
              <label
                key={t}
                className={`flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-brand-primary md:min-h-0 ${
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
          <label htmlFor="f-status" className={labelCls}>
            Status
          </label>
          <select id="f-status" value={draft.status} onChange={set('status')} className={fieldCls}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-assignee" className={labelCls}>
            Assignee
          </label>
          {/* Free text with suggestions: pick a teammate or type anyone's name. */}
          <input
            id="f-assignee"
            ref={assigneeRef}
            list="people-list"
            autoComplete="off"
            value={draft.assignee}
            onChange={(e) => {
              set('assignee')(e);
              if (e.target.value.trim()) setAssigneeError(false);
            }}
            aria-invalid={assigneeError}
            aria-describedby={assigneeError ? 'f-assignee-err f-assignee-hint' : 'f-assignee-hint'}
            className={`${fieldCls} ${assigneeError ? '!border-due-overdue' : ''}`}
            placeholder="Type a name…"
          />
          <datalist id="people-list">
            {people.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <p id="f-assignee-hint" className="mt-1 text-xs text-ink-muted">
            Pick someone or type a new name.
          </p>
          {assigneeError && (
            <p id="f-assignee-err" role="alert" className="mt-1 text-xs text-due-overdue">
              Say who owns this task.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="f-due" className={labelCls}>
            Due date
          </label>
          <input id="f-due" type="date" value={draft.dueDate} onChange={set('dueDate')} className={fieldCls} />
        </div>

        <ContextField draft={draft} setDraft={setDraft} now={now} onRestored={() => onNotify('Earlier version restored. Save to keep it.')} />

        <p className="text-xs text-ink-muted sm:col-span-2">
          Created <span className="font-mono">{draft.createdDate}</span>
        </p>

        {/* Sticky action bar: always reachable on small screens. */}
        <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col-reverse gap-3 border-t border-surface-line bg-surface-card px-4 py-3 sm:col-span-2 sm:-mx-6 sm:-mb-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          {!isNew ? (
            confirmDelete ? (
              <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-due-overdue">Delete this task? You can undo right after.</span>
                <button
                  type="button"
                  onClick={() => {
                    speech.stop();
                    onDelete(task.id);
                  }}
                  className="min-h-[44px] rounded-lg bg-due-overdue px-3 py-1.5 font-medium text-surface-page hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary md:min-h-0"
                >
                  Delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className={btnGhost}>
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-h-[44px] rounded-lg border border-due-overdue/60 px-3 py-2 text-sm text-due-overdue hover:bg-due-overdue/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-due-overdue md:min-h-0"
              >
                Delete task
              </button>
            )
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <SpeakButton
              speech={speech}
              id="modal"
              label="this task"
              showLabel
              text={() => taskToSpeech(asTask, { includeContext: prefs.readContext, now })}
            />
            <CopyContextButton task={asTask} onCopied={onNotify} now={now} size="md" />
            <button type="button" onClick={close} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              {isNew ? 'Create task' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
