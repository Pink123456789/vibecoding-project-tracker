import { useState } from 'react';
import { STAGES, buildContextBlock, copyText, dueState, taskToSpeech, timeAgo } from '../lib/model.js';
import { Avatar, DUE_STYLE, DuePill, Icon, SpeakButton, TYPE_STYLE, TypeIcon } from './ui.jsx';

// --- M10 Copy Context -----------------------------------------------------------

export function CopyContextButton({ task, onCopied, now, size = 'sm' }) {
  const copy = async () => {
    const ok = await copyText(buildContextBlock(task, now));
    onCopied(ok ? 'Context copied. Paste it into your AI and keep vibing.' : 'Copy failed — select the text manually.', { id: task.id });
  };
  const cls =
    size === 'sm'
      ? 'gap-1 rounded-md border border-surface-line px-2.5 py-1 text-[0.75rem] text-ink-muted hover:border-brand-accent hover:text-brand-accent min-h-[44px] md:min-h-[32px]'
      : 'gap-1.5 rounded-lg border border-brand-accent/60 px-3 py-2 text-sm text-brand-accent hover:bg-brand-accent/10 min-h-[44px] md:min-h-0';
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy context for ${task.title}`}
      className={`relative z-10 inline-flex items-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${cls}`}
    >
      <Icon.copy className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      Copy Context
    </button>
  );
}

// --- Task card ----------------------------------------------------------------------

function TaskCard({ task, onOpen, onHandOff, onCopied, onMove, flash, now, speech, prefs, people }) {
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
      className={`group relative cursor-grab rounded-lg border border-l-4 border-surface-line ${st.stripe} bg-surface-card ${due.card} p-3 transition hover:-translate-y-0.5 hover:border-brand-primary/60 focus-within:ring-2 focus-within:ring-brand-primary active:cursor-grabbing ${
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
        <span className={`mt-0.5 flex shrink-0 items-center gap-1 text-[0.6875rem] font-mono ${st.text}`}>
          <TypeIcon type={task.type} className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">{st.label}</span>
        </span>
      </div>

      {task.context?.trim() && (
        <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-muted">
          <span aria-hidden="true" className="text-brand-primary">
            ◆
          </span>
          Context{task.contextTool ? ` for ${task.contextTool}` : ''}
          {task.contextUpdatedAt ? ` · ${timeAgo(task.contextUpdatedAt, now)}` : ''}
          {task.contextHistory?.length ? ` · ${task.contextHistory.length} earlier` : ''}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
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
            className="min-h-[44px] w-28 cursor-pointer truncate rounded-md border border-surface-line/0 bg-transparent py-0.5 pl-1 pr-6 text-xs text-ink-primary hover:border-surface-line focus:border-brand-primary focus:outline-none md:min-h-0 md:w-24"
          >
            {people.map((n) => (
              <option key={n} value={n}>
                {n === task.assignee ? n : `Hand off to ${n}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative z-10 mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-surface-line/60 pt-2">
        {/* Touch screens can't drag: a move menu is the phone equivalent (hidden on desktop). */}
        <label className="sr-only" htmlFor={`move-${task.id}`}>
          Move {task.title} to column
        </label>
        <select
          id={`move-${task.id}`}
          value={task.status}
          onChange={(e) => onMove(task.id, e.target.value)}
          className="mr-auto min-h-[44px] rounded-md border border-surface-line bg-surface-page px-2 text-xs text-ink-primary focus:border-brand-primary focus:outline-none md:hidden"
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id === task.status ? `In ${s.label}` : `Move to ${s.label}`}
            </option>
          ))}
        </select>
        {/* Visible Edit button (added after user testing: clicking the card itself was not discoverable). */}
        <button
          type="button"
          onClick={() => onOpen(task)}
          aria-label={`Edit task: ${task.title}`}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-surface-line px-2.5 py-1 text-[0.75rem] font-medium text-ink-primary transition hover:border-brand-primary hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:min-h-[32px]"
        >
          <Icon.pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <SpeakButton
          speech={speech}
          id={`card-${task.id}`}
          label={task.title}
          text={() => taskToSpeech(task, { includeContext: prefs.readContext, now })}
          className="md:!h-8 md:!w-8"
        />
        <CopyContextButton task={task} onCopied={onCopied} now={now} />
      </div>
    </li>
  );
}

// --- Column (drop target) ------------------------------------------------------------

function Column({ stage, tasks, total, filtered, onOpen, onHandOff, onCopied, onMove, flashId, now, speech, prefs, people, hiddenOnMobile }) {
  const headingId = `col-${stage.id}`;
  const [over, setOver] = useState(false);
  return (
    <section
      id={`panel-${stage.id}`}
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
      className={`${hiddenOnMobile ? 'hidden md:flex' : 'flex'} min-h-[12rem] flex-col rounded-xl border p-3 transition md:min-h-[18rem] ${
        over ? 'border-brand-accent bg-brand-accent/[0.08]' : 'border-surface-line bg-surface-page/60'
      }`}
    >
      <h2
        id={headingId}
        className="mb-3 flex items-center justify-between px-1 text-[0.8125rem] font-semibold uppercase tracking-wider text-ink-muted"
      >
        {stage.label}
        <span className="rounded-full bg-surface-raised px-2 py-0.5 font-mono text-xs text-ink-primary">
          {filtered ? `${tasks.length}/${total}` : tasks.length}
          <span className="sr-only"> tasks</span>
        </span>
      </h2>
      {tasks.length === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-surface-line p-4 text-center text-sm text-ink-muted">
          {filtered && total > 0 ? 'No tasks match your filters here.' : 'Nothing here yet — drop a task in.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onOpen={onOpen}
              onHandOff={onHandOff}
              onCopied={onCopied}
              onMove={onMove}
              flash={flashId === t.id}
              now={now}
              speech={speech}
              prefs={prefs}
              people={people}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// --- Board: tabs on phones, four columns on wider screens -------------------------------

export function Board({ allTasks, visibleTasks, filtered, activeStage, setActiveStage, ...rest }) {
  const onTabKey = (e) => {
    const i = STAGES.findIndex((s) => s.id === activeStage);
    let next = null;
    if (e.key === 'ArrowRight') next = STAGES[(i + 1) % STAGES.length];
    if (e.key === 'ArrowLeft') next = STAGES[(i - 1 + STAGES.length) % STAGES.length];
    if (e.key === 'Home') next = STAGES[0];
    if (e.key === 'End') next = STAGES[STAGES.length - 1];
    if (next) {
      e.preventDefault();
      setActiveStage(next.id);
      document.getElementById(`tab-${next.id}`)?.focus();
    }
  };

  return (
    <>
      {/* Small Screen Usability: one column at a time with a segmented tab bar (phones only). */}
      <div role="tablist" aria-label="Board columns" className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 md:hidden">
        {STAGES.map((s) => {
          const count = visibleTasks.filter((t) => t.status === s.id).length;
          const selected = s.id === activeStage;
          return (
            <button
              key={s.id}
              id={`tab-${s.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${s.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveStage(s.id)}
              onKeyDown={onTabKey}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                selected ? 'border-brand-primary bg-brand-primary text-surface-page' : 'border-surface-line text-ink-primary'
              }`}
            >
              {s.label}
              <span className={`rounded-full px-1.5 font-mono text-xs ${selected ? 'bg-surface-page/25' : 'bg-surface-raised'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            tasks={visibleTasks.filter((t) => t.status === stage.id)}
            total={allTasks.filter((t) => t.status === stage.id).length}
            filtered={filtered}
            hiddenOnMobile={stage.id !== activeStage}
            {...rest}
          />
        ))}
      </div>
    </>
  );
}
