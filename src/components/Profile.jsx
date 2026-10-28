import { useState } from 'react';
import { AI_TOOLS, dueState, formatDateTime, normalizeName, stageLabel } from '../lib/model.js';
import { Avatar, DuePill, Icon, TYPE_STYLE, TypeIcon, btnGhost, btnPrimary, fieldCls, labelCls } from './ui.jsx';

function Stat({ label, value, tone = 'text-ink-primary' }) {
  return (
    <div className="rounded-xl border border-surface-line bg-surface-card p-4">
      <p className={`font-display text-3xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">{label}</p>
    </div>
  );
}

export function ProfilePage({ session, tasks, now, onSave, onRenameTasks, onOpenTask, onSignOut, onOpenSettings, onExport }) {
  const [draft, setDraft] = useState({
    name: session.name,
    email: session.email,
    role: session.role,
    bio: session.bio,
    preferredTool: session.preferredTool ?? '',
  });
  const [renameTasks, setRenameTasks] = useState(true);
  const [nameError, setNameError] = useState(false);
  const [saved, setSaved] = useState(false);

  const mine = tasks.filter((t) => t.assignee.toLowerCase() === session.name.toLowerCase());
  const open = mine.filter((t) => t.status !== 'done');
  const attention = open.filter((t) => ['overdue', 'warning'].includes(dueState(t, now).key));
  const contexts = mine.reduce((n, t) => n + (t.context?.trim() ? 1 : 0) + (t.contextHistory?.length ?? 0), 0);
  const nameChanged = normalizeName(draft.name) !== session.name;

  const set = (k) => (e) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [k]: e.target.value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const name = normalizeName(draft.name);
    if (!name) {
      setNameError(true);
      document.getElementById('p-name')?.focus();
      return;
    }
    if (nameChanged && renameTasks) onRenameTasks(session.name, name);
    onSave({ ...session, ...draft, name, preferredTool: draft.preferredTool || null });
    setSaved(true);
  };

  return (
    <main id="board" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-28 pt-4 focus:outline-none md:px-6 md:pb-10">
      <a
        href="#/"
        className="mb-4 inline-flex min-h-[44px] items-center gap-1 rounded-md text-sm text-brand-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-0"
      >
        <span aria-hidden="true">←</span> Back to board
      </a>

      <section aria-labelledby="profile-title" className="flex flex-col gap-4 rounded-xl border border-surface-line bg-surface-card p-5 sm:flex-row sm:items-center">
        <Avatar name={session.name} size="h-20 w-20 text-2xl" />
        <div className="min-w-0 flex-1">
          <h2 id="profile-title" className="font-display text-2xl font-semibold">
            {session.name}
          </h2>
          {session.role && <p className="text-sm text-ink-primary">{session.role}</p>}
          <p className="text-sm text-ink-muted">
            {session.guest ? 'Guest session · nothing is linked to an email' : session.email}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Member since <time dateTime={session.memberSince}>{formatDateTime(session.memberSince)}</time>
            {session.preferredTool ? ` · prefers ${session.preferredTool}` : ''}
          </p>
        </div>
        <button type="button" onClick={onSignOut} className={btnGhost}>
          Sign out
        </button>
      </section>

      <section aria-label="Your numbers" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Open tasks" value={open.length} />
        <Stat label="Due today or overdue" value={attention.length} tone={attention.length ? 'text-due-overdue' : 'text-ink-primary'} />
        <Stat label="Done" value={mine.length - open.length} tone="text-feature" />
        <Stat label="Context versions written" value={contexts} tone="text-brand-primary" />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <section aria-labelledby="my-tasks-title" className="rounded-xl border border-surface-line bg-surface-card p-4 lg:col-span-3">
          <h3 id="my-tasks-title" className="mb-3 text-[0.8125rem] font-semibold uppercase tracking-wider text-ink-muted">
            My tasks ({mine.length})
          </h3>
          {mine.length === 0 ? (
            <p className="rounded-lg border border-dashed border-surface-line p-4 text-sm text-ink-muted">
              Nothing is assigned to “{session.name}” yet. Hand a task to yourself from the board.
            </p>
          ) : (
            <ul className="divide-y divide-surface-line">
              {mine.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onOpenTask(t)}
                    className="flex min-h-[44px] w-full flex-wrap items-center justify-between gap-2 rounded-md px-2 py-3 text-left hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={TYPE_STYLE[t.type].text}>
                        <TypeIcon type={t.type} className="h-4 w-4" />
                        <span className="sr-only">{TYPE_STYLE[t.type].label}: </span>
                      </span>
                      <span className="font-medium">{t.title}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-surface-raised px-2 py-0.5 text-ink-primary">{stageLabel(t.status)}</span>
                      <DuePill task={t} now={now} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="edit-profile-title" className="rounded-xl border border-surface-line bg-surface-card p-4 lg:col-span-2">
          <h3 id="edit-profile-title" className="mb-3 text-[0.8125rem] font-semibold uppercase tracking-wider text-ink-muted">
            Edit profile
          </h3>
          <form onSubmit={submit} noValidate className="grid gap-3">
            <div>
              <label htmlFor="p-name" className={labelCls}>
                Display name
              </label>
              <input
                id="p-name"
                autoComplete="name"
                value={draft.name}
                onChange={(e) => {
                  set('name')(e);
                  if (e.target.value.trim()) setNameError(false);
                }}
                aria-invalid={nameError}
                aria-describedby={nameError ? 'p-name-err' : undefined}
                className={`${fieldCls} ${nameError ? '!border-due-overdue' : ''}`}
              />
              {nameError && (
                <p id="p-name-err" role="alert" className="mt-1 text-xs text-due-overdue">
                  Your name can’t be empty.
                </p>
              )}
            </div>
            {nameChanged && mine.length > 0 && (
              <label className="flex min-h-[44px] items-start gap-2 text-sm">
                <input type="checkbox" checked={renameTasks} onChange={(e) => setRenameTasks(e.target.checked)} className="mt-1 h-4 w-4 accent-[rgb(var(--brand-primary))]" />
                Also move my {mine.length} task{mine.length === 1 ? '' : 's'} to the new name
              </label>
            )}
            {!session.guest && (
              <div>
                <label htmlFor="p-email" className={labelCls}>
                  Email
                </label>
                <input id="p-email" type="email" autoComplete="email" value={draft.email} onChange={set('email')} className={fieldCls} />
              </div>
            )}
            <div>
              <label htmlFor="p-role" className={labelCls}>
                Role
              </label>
              <input id="p-role" autoComplete="organization-title" value={draft.role} onChange={set('role')} placeholder="e.g. Vibecoder · frontend" className={fieldCls} />
            </div>
            <div>
              <label htmlFor="p-tool" className={labelCls}>
                Favourite AI tool
              </label>
              <select id="p-tool" value={draft.preferredTool} onChange={set('preferredTool')} className={fieldCls}>
                <option value="">— none —</option>
                {AI_TOOLS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-bio" className={labelCls}>
                About me
              </label>
              <textarea id="p-bio" rows={3} value={draft.bio} onChange={set('bio')} placeholder="What are you building?" className={fieldCls} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className={btnPrimary}>
                Save profile
              </button>
              <p aria-live="polite" className="text-sm text-feature">
                {saved ? '✓ Saved' : ''}
              </p>
            </div>
          </form>
        </section>
      </div>

      <section aria-labelledby="account-tools-title" className="mt-4 rounded-xl border border-surface-line bg-surface-card p-4">
        <h3 id="account-tools-title" className="mb-3 text-[0.8125rem] font-semibold uppercase tracking-wider text-ink-muted">
          Settings &amp; data
        </h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOpenSettings} className={btnGhost}>
            <Icon.access /> Accessibility settings
          </button>
          <button type="button" onClick={onExport} className={btnGhost}>
            <Icon.download /> Export my board
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Signing out keeps your board in this browser; signing back in with the same email restores this profile.
        </p>
      </section>
    </main>
  );
}
