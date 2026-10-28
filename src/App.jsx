import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_ANCHORS,
  EMPTY_FILTERS,
  boardToSpeech,
  emptyTask,
  filtersActive,
  makeBackup,
  matchesFilters,
  parseBackup,
  peopleFrom,
  seedTasks,
  stageLabel,
  todayISO,
  withHistory,
} from './lib/model.js';
import { isTyping, useLocalStorage, usePrefs, useSpeech } from './lib/hooks.js';
import { Board } from './components/Board.jsx';
import { TaskModal } from './components/TaskModal.jsx';
import { AnchorBoard, DriverStrip, FilterBar, Legend, Toast, Welcome } from './components/Panels.jsx';
import { HelpDialog, SettingsDialog } from './components/Settings.jsx';
import { LoginScreen } from './components/Auth.jsx';
import { ProfilePage } from './components/Profile.jsx';
import { Avatar, Icon, SpeakButton, btnGhost, btnPrimary, iconBtn } from './components/ui.jsx';

/**
 * Vibe Ledger — a Kanban board for vibecoding tasks and the prompts behind them.
 *
 * Hackathon milestones M4–M13 live in components/ (see PRD §9). The post-hackathon
 * iteration adds the accessibility panel (themes, colour-vision palettes, text size,
 * readable font, reduced motion, read aloud), undo, search & filters, phone layout,
 * JSON backup and prompt history — see PRD §14 — plus a prototype sign-in, a profile
 * page and free-text assignees (§15).
 */
export default function App() {
  // Preferences apply everywhere, including the sign-in screen.
  const prefsApi = usePrefs();
  const [session, setSession] = useLocalStorage('vibetracker.session', null);
  const [lastProfile, setLastProfile] = useLocalStorage('vibetracker.lastProfile', null);

  if (!session) {
    return (
      <LoginScreen
        lastProfile={lastProfile}
        onSignIn={(s) => {
          setSession(s);
          if (!s.guest) setLastProfile(s);
          window.location.hash = '#/';
        }}
      />
    );
  }
  return (
    <Tracker
      prefsApi={prefsApi}
      session={session}
      setSession={(s) => {
        setSession(s);
        if (s && !s.guest) setLastProfile(s);
      }}
      onSignOut={() => {
        if (!session.guest) setLastProfile(session);
        setSession(null);
        window.location.hash = '';
      }}
    />
  );
}

/** Track the hash so the profile page has its own URL and the Back button works. */
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash);
      // Move focus to the new page's main region so screen readers announce the change.
      requestAnimationFrame(() => document.getElementById('board')?.focus());
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash.startsWith('#/profile') ? 'profile' : 'board';
}

function Tracker({ prefsApi, session, setSession, onSignOut }) {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', seedTasks);
  const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', DEFAULT_ANCHORS);
  const [prefs, updatePrefs, resetPrefs] = prefsApi;
  const speech = useSpeech(prefs.speechRate);
  const view = useHashRoute();
  const me = session.guest ? null : session.name;
  const people = useMemo(() => peopleFrom(tasks, me), [tasks, me]);
  const newTask = useCallback(() => emptyTask(me ?? people[0]), [me, people]);

  const [editing, setEditing] = useState(null); // a Task (id '' = new) or null
  const [dialog, setDialog] = useState(null); // 'settings' | 'help' | null
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeStage, setActiveStage] = useState('todo');
  const searchRef = useRef(null);
  const isWide = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 768px)').matches;

  // Re-evaluate due tints every minute so colours change with no user action (M8).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // --- Messages + undo ------------------------------------------------------------
  const [toast, setToast] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const undoRef = useRef(null);

  /** Show a message; pass `undo` (a snapshot) to offer an Undo button. */
  const notify = useCallback((message, { id = null, undo = null } = {}) => {
    undoRef.current = undo;
    setFlashId(id);
    setToast({ message, action: undo ? { label: 'Undo' } : null, key: Date.now() });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    setFlashId(null);
  }, []);

  const undo = useCallback(() => {
    const snap = undoRef.current;
    if (!snap) return;
    setTasks(snap.tasks);
    if (snap.anchors) setAnchors(snap.anchors);
    undoRef.current = null;
    setToast({ message: 'Undone.', action: null, key: Date.now() });
  }, [setTasks, setAnchors]);

  // --- Task operations ------------------------------------------------------------
  const moveTask = (id, status, keepFocus = false) => {
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status === status) return;
    const before = tasks;
    setTasks((all) => all.map((x) => (x.id === id ? { ...x, status } : x)));
    notify(status === 'done' ? `“${t.title}” shipped. Nice.` : `Moved “${t.title}” to ${stageLabel(status)}.`, {
      id,
      undo: { tasks: before },
    });
    if (keepFocus) {
      requestAnimationFrame(() => document.querySelector(`[data-task-id="${id}"] h3 button`)?.focus());
    }
  };

  const handOff = (task, name) => {
    if (name === task.assignee) return;
    const before = tasks;
    setTasks((all) => all.map((x) => (x.id === task.id ? { ...x, assignee: name } : x)));
    notify(`Handed off to ${name}. They've got it.`, { id: task.id, undo: { tasks: before } });
  };

  const saveTask = (t) => {
    const isNew = !t.id;
    setTasks((all) =>
      isNew ? [...all, { ...t, id: `t${Date.now()}` }] : all.map((x) => (x.id === t.id ? withHistory(x, t) : x))
    );
    setEditing(null);
    notify(isNew ? `Created “${t.title}”.` : `Saved “${t.title}”.`, { id: t.id || null });
    if (isNew) setActiveStage(t.status);
  };

  const renameAssignee = (from, to) => {
    setTasks((all) => all.map((x) => (x.assignee.toLowerCase() === from.toLowerCase() ? { ...x, assignee: to } : x)));
  };

  const deleteTask = (id) => {
    const t = tasks.find((x) => x.id === id);
    const before = tasks;
    setTasks((all) => all.filter((x) => x.id !== id));
    setEditing(null);
    notify(`Deleted “${t?.title ?? 'task'}”.`, { undo: { tasks: before } });
  };

  // --- Data: export / import / reset ----------------------------------------------
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(makeBackup(tasks, anchors), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-ledger-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`Backup saved: ${tasks.length} tasks.`);
  };

  const importBackup = async (file) => {
    try {
      const data = parseBackup(await file.text());
      const before = { tasks, anchors };
      setTasks(data.tasks);
      setAnchors(data.anchors);
      setDialog(null);
      notify(`Imported ${data.tasks.length} tasks.`, { undo: before });
      return null;
    } catch (err) {
      return err.message;
    }
  };

  const resetDemo = () => {
    const before = { tasks, anchors };
    setTasks(seedTasks());
    setAnchors(DEFAULT_ANCHORS);
    setFilters(EMPTY_FILTERS);
    setDialog(null);
    notify('Demo data restored.', { undo: before });
  };

  // --- Filters ----------------------------------------------------------------------
  const visibleTasks = useMemo(() => tasks.filter((t) => matchesFilters(t, filters, now)), [tasks, filters, now]);
  const filtered = filtersActive(filters);

  // --- Global keyboard shortcuts (single keys can be switched off: WCAG 2.1.4) ---------
  const anyDialog = Boolean(editing || dialog);
  // A message from the board shouldn't sit on top of a dialog that just opened.
  useEffect(() => {
    if (anyDialog) dismissToast();
  }, [anyDialog, dismissToast]);
  useEffect(() => {
    const onKey = (e) => {
      if (anyDialog || isTyping(document.activeElement)) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        if (undoRef.current) {
          e.preventDefault();
          undo();
        }
        return;
      }
      if (!prefs.shortcuts || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditing(newTask());
      } else if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setDialog('help');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setDialog('settings');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [anyDialog, prefs.shortcuts, undo, newTask]);

  const boardProps = {
    onOpen: setEditing,
    onHandOff: handOff,
    onCopied: notify,
    onMove: moveTask,
    flashId,
    now,
    speech,
    prefs,
    people,
  };

  return (
    <div className="min-h-screen bg-surface-page text-ink-primary">
      <a
        href="#board"
        className="sr-only z-50 rounded-lg bg-brand-primary px-4 py-2 text-surface-page focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to board
      </a>

      <header className="sticky top-0 z-30 border-b border-surface-line bg-surface-page/95 px-4 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:px-6 md:pb-2 md:pt-6 md:backdrop-blur-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold text-brand-primary md:text-2xl">
              <span className="mr-1 text-brand-accent" aria-hidden="true">
                ▍
              </span>
              Vibe Ledger
            </h1>
            <p className="hidden text-sm text-ink-muted sm:block">Every task, every prompt, one board.</p>
          </div>
          <nav aria-label="Tools" className="flex shrink-0 items-center gap-2">
            <SpeakButton
              speech={speech}
              id="board"
              label="board summary"
              text={() => boardToSpeech(visibleTasks, now)}
              className="md:hidden"
            />
            <span className="hidden md:inline-flex">
              <SpeakButton speech={speech} id="board" label="board summary" showLabel text={() => boardToSpeech(visibleTasks, now)} />
            </span>
            <button type="button" onClick={() => setDialog('help')} aria-label="Help and keyboard shortcuts" className={iconBtn}>
              <Icon.help className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setDialog('settings')} className={`${btnGhost} !px-2.5 md:!px-3`} aria-label="Accessibility and data settings">
              <Icon.access className="h-5 w-5" />
              <span className="hidden md:inline">Accessibility</span>
            </button>
            <button type="button" onClick={() => setEditing(newTask())} className={`${btnPrimary} hidden md:inline-flex`} aria-keyshortcuts="N">
              <Icon.plus /> New task
            </button>
            <a
              href="#/profile"
              aria-current={view === 'profile' ? 'page' : undefined}
              aria-label={`Your profile: ${session.name}`}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:min-h-0 md:min-w-0"
            >
              <Avatar name={session.name} size="h-9 w-9 text-xs" />
            </a>
          </nav>
        </div>
      </header>

      {view === 'profile' ? (
        <ProfilePage
          session={session}
          tasks={tasks}
          now={now}
          onSave={(next) => {
            setSession(next);
            notify('Profile saved.');
          }}
          onRenameTasks={renameAssignee}
          onOpenTask={setEditing}
          onSignOut={onSignOut}
          onOpenSettings={() => setDialog('settings')}
          onExport={exportBackup}
        />
      ) : (
        <main id="board" tabIndex={-1} className="px-4 pb-28 pt-4 focus:outline-none md:px-6 md:pb-10">
          {!prefs.welcomeDismissed && <Welcome onDismiss={() => updatePrefs({ welcomeDismissed: true })} onHelp={() => setDialog('help')} />}
  
          <AnchorBoard anchors={anchors} onChange={(id, url) => setAnchors((all) => all.map((a) => (a.id === id ? { ...a, url } : a)))} defaultOpen={isWide} />
  
          <div className="mb-4 flex flex-col gap-3">
            <DriverStrip
              tasks={tasks}
              people={people}
              owner={filters.owner}
              onToggleOwner={(name) => setFilters((f) => ({ ...f, owner: f.owner === name ? 'all' : name }))}
            />
            <FilterBar filters={filters} setFilters={setFilters} shown={visibleTasks.length} total={tasks.length} searchRef={searchRef} people={people} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Legend />
              <p className="hidden text-xs text-ink-muted md:block">
                Drag cards between columns — or focus a card and press <kbd className="rounded border border-surface-line px-1 font-mono">Alt</kbd> +{' '}
                <kbd className="rounded border border-surface-line px-1 font-mono">←</kbd>/<kbd className="rounded border border-surface-line px-1 font-mono">→</kbd>
              </p>
            </div>
          </div>
  
          <Board allTasks={tasks} visibleTasks={visibleTasks} filtered={filtered} activeStage={activeStage} setActiveStage={setActiveStage} {...boardProps} />
        </main>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-line px-4 py-4 pb-24 text-xs text-ink-muted md:px-6 md:pb-4">
        <span>Vibe Ledger · UXD Vibecoding Hackathon 2026 · data stays in this browser</span>
        <button type="button" onClick={() => setDialog('settings')} className="min-h-[44px] rounded-md px-2 underline-offset-2 hover:text-ink-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:min-h-0">
          Backup, import &amp; reset demo
        </button>
      </footer>

      {/* Phones: a thumb-reachable floating "New task" button. */}
      <button
        type="button"
        onClick={() => setEditing(newTask())}
        aria-label="New task"
        className="fixed bottom-5 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-brand-primary text-surface-page shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent md:hidden"
      >
        <Icon.plus className="h-6 w-6" />
      </button>

      {editing && (
        <TaskModal
          task={editing}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setEditing(null)}
          onNotify={(msg) => notify(msg)}
          now={now}
          speech={speech}
          prefs={prefs}
          people={people}
        />
      )}
      {dialog === 'settings' && (
        <SettingsDialog
          prefs={prefs}
          update={updatePrefs}
          reset={resetPrefs}
          onClose={() => setDialog(null)}
          speech={speech}
          onExport={exportBackup}
          onImportFile={importBackup}
          onResetDemo={resetDemo}
        />
      )}
      {dialog === 'help' && <HelpDialog onClose={() => setDialog(null)} shortcutsOn={prefs.shortcuts} />}

      <Toast toast={toast} onAction={undo} onDismiss={dismissToast} overDialog={anyDialog} />
    </div>
  );
}
