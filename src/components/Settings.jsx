import { useRef, useState } from 'react';
import { Dialog, DialogHeader, Icon, TYPE_STYLE, TypeIcon, DUE_STYLE, btnGhost, btnPrimary } from './ui.jsx';

// --- Accessibility & data settings -------------------------------------------------------

function RadioGroup({ legend, name, value, options, onChange, hint }) {
  return (
    <fieldset className="rounded-lg border border-surface-line p-3 sm:p-4">
      <legend className="px-1 text-sm font-semibold">{legend}</legend>
      {hint && <p className="mb-2 text-xs text-ink-muted">{hint}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={String(o.value)}
            className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-brand-primary ${
              value === o.value ? 'border-brand-primary bg-brand-primary/10' : 'border-surface-line hover:bg-surface-raised'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-1 h-4 w-4 accent-[rgb(var(--brand-primary))]"
            />
            <span>
              <span className="block font-medium">{o.label}</span>
              {o.hint && <span className="block text-xs text-ink-muted">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ id, label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-surface-line p-3 sm:p-4">
      <label htmlFor={id} className="text-sm">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
          checked ? 'border-brand-primary bg-brand-primary' : 'border-surface-line bg-surface-raised'
        }`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-surface-page shadow transition ${checked ? 'left-8' : 'left-1'}`} />
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

/** A live sample so people can judge a palette before closing the panel. */
function PalettePreview() {
  return (
    <div aria-hidden="true" className="flex flex-wrap items-center gap-3 rounded-lg border border-surface-line bg-surface-page p-3 text-xs">
      {Object.entries(TYPE_STYLE).map(([k, st]) => (
        <span key={k} className={`flex items-center gap-1 rounded-md border-l-4 bg-surface-card px-2 py-1 ${st.stripe} ${st.text}`}>
          <TypeIcon type={k} /> {st.label}
        </span>
      ))}
      {['safe', 'soon', 'warning', 'overdue'].map((k) => (
        <span key={k} className={`flex items-center gap-1 font-mono ${DUE_STYLE[k].pill}`}>
          <span className={`h-2 w-2 ${DUE_STYLE[k].shape} ${DUE_STYLE[k].dot.replace(' animate-pulse', '')}`} />
          {k}
        </span>
      ))}
    </div>
  );
}

export function SettingsDialog({ prefs, update, reset, onClose, speech, onExport, onImportFile, onResetDemo }) {
  const fileRef = useRef(null);
  const [importError, setImportError] = useState('');
  return (
    <Dialog titleId="settings-title" onClose={onClose}>
      <DialogHeader id="settings-title" title="Accessibility & data" onClose={onClose} />
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">Settings are saved in this browser and apply straight away.</p>

        <RadioGroup
          legend="Theme"
          name="theme"
          value={prefs.theme}
          onChange={(theme) => update({ theme })}
          options={[
            { value: 'system', label: 'Match my device', hint: 'Light or dark from your system setting' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'contrast', label: 'High contrast', hint: 'Black background, white text and borders' },
          ]}
        />

        <RadioGroup
          legend="Colour vision"
          name="cvd"
          value={prefs.cvd}
          onChange={(cvd) => update({ cvd })}
          hint="Every state also has an icon or text, so nothing depends on colour alone."
          options={[
            { value: 'none', label: 'Standard colours' },
            { value: 'redgreen', label: 'Red–green friendly', hint: 'Protanopia / deuteranopia — blue vs orange' },
            { value: 'blueyellow', label: 'Blue–yellow friendly', hint: 'Tritanopia — cyan vs red' },
            { value: 'mono', label: 'Grayscale', hint: 'Achromatopsia, or to check nothing relies on colour' },
          ]}
        />
        <PalettePreview />

        <RadioGroup
          legend="Text size"
          name="textSize"
          value={prefs.textSize}
          onChange={(textSize) => update({ textSize })}
          options={[
            { value: 100, label: 'Default' },
            { value: 112.5, label: 'Large' },
            { value: 125, label: 'Larger' },
            { value: 150, label: 'Largest' },
          ]}
        />

        <RadioGroup
          legend="Font"
          name="font"
          value={prefs.font}
          onChange={(font) => update({ font })}
          options={[
            { value: 'default', label: 'Default (Inter)' },
            { value: 'readable', label: 'Readable', hint: 'Atkinson Hyperlegible with wider letter and line spacing' },
          ]}
        />

        <RadioGroup
          legend="Motion"
          name="motion"
          value={prefs.motion}
          onChange={(motion) => update({ motion })}
          options={[
            { value: 'system', label: 'Match my device' },
            { value: 'reduce', label: 'Reduce motion', hint: 'No animations, pulses or slides' },
            { value: 'full', label: 'Allow animations' },
          ]}
        />

        <fieldset className="rounded-lg border border-surface-line p-3 sm:p-4">
          <legend className="px-1 text-sm font-semibold">Read aloud</legend>
          {speech.supported ? (
            <>
              <p className="mb-3 text-xs text-ink-muted">Every card, the task editor and the header have a speaker button that reads the task out loud.</p>
              <label htmlFor="speech-rate" className="flex items-center justify-between text-sm">
                Speed <span className="font-mono text-xs text-ink-muted">{prefs.speechRate.toFixed(1)}×</span>
              </label>
              <input
                id="speech-rate"
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={prefs.speechRate}
                onChange={(e) => update({ speechRate: Number(e.target.value) })}
                className="mt-1 w-full accent-[rgb(var(--brand-primary))]"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => speech.speak('This is how Vibe Ledger sounds when it reads a task to you.', 'test')}
                  className={btnGhost}
                >
                  <Icon.speaker /> Test voice
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-muted">Your browser doesn’t support speech output. Your device’s screen reader still works with this app.</p>
          )}
        </fieldset>
        {speech.supported && (
          <Toggle
            id="read-context"
            label="Include Context when reading"
            hint="Off reads only title, status, owner and due date."
            checked={prefs.readContext}
            onChange={(readContext) => update({ readContext })}
          />
        )}

        <Toggle
          id="shortcuts"
          label="Single-key keyboard shortcuts"
          hint="N, /, ? and A. Turn off if you use speech input or they get in the way (WCAG 2.1.4)."
          checked={prefs.shortcuts}
          onChange={(shortcuts) => update({ shortcuts })}
        />

        <section aria-labelledby="data-title" className="rounded-lg border border-surface-line p-3 sm:p-4">
          <h3 id="data-title" className="text-sm font-semibold">
            Your data
          </h3>
          <p className="mb-3 mt-1 text-xs text-ink-muted">
            Tasks live only in this browser. Export a backup before clearing your browser or to move to another device.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onExport} className={btnGhost}>
              <Icon.download /> Export backup (.json)
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className={btnGhost}>
              <Icon.upload /> Import backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const err = await onImportFile(file);
                setImportError(err || '');
              }}
            />
            <button type="button" onClick={onResetDemo} className={btnGhost}>
              Reset demo data
            </button>
          </div>
          {importError && (
            <p role="alert" className="mt-2 text-sm text-due-overdue">
              Import failed: {importError}
            </p>
          )}
        </section>

        <div className="flex flex-wrap justify-between gap-2 border-t border-surface-line pt-4">
          <button type="button" onClick={reset} className={btnGhost}>
            Reset display settings
          </button>
          <button type="button" onClick={onClose} className={btnPrimary}>
            Done
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// --- Help & keyboard shortcuts --------------------------------------------------------------

const Kbd = ({ children }) => <kbd className="rounded border border-surface-line bg-surface-page px-1.5 py-0.5 font-mono text-xs">{children}</kbd>;

export function HelpDialog({ onClose, shortcutsOn }) {
  const rows = [
    [['N'], 'New task', true],
    [['/'], 'Search tasks', true],
    [['A'], 'Accessibility & data settings', true],
    [['?'], 'This help', true],
    [['Alt', '←/→'], 'Move the focused card to the previous / next column', false],
    [['Ctrl/⌘', 'Z'], 'Undo the last move, hand-off, delete or import', false],
    [['Esc'], 'Close any dialog', false],
    [['Tab'], 'Move between controls (focus stays inside open dialogs)', false],
  ];
  return (
    <Dialog titleId="help-title" onClose={onClose} maxWidth="sm:max-w-xl">
      <DialogHeader id="help-title" title="Help" onClose={onClose} />
      <div className="flex flex-col gap-5 p-4 text-sm sm:p-6">
        <section>
          <h3 className="mb-2 font-semibold">How Vibe Ledger works</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Each card is a vibecoding task; the four columns are its stage.</li>
            <li>The <b>Context</b> field keeps the prompt history behind the task, so nothing gets lost.</li>
            <li><b>Copy Context</b> turns the task into a briefing you paste into Claude, ChatGPT or Cursor.</li>
            <li>Move cards by dragging, with <Kbd>Alt</Kbd> + arrows, or with the “Move to” menu on phones.</li>
            <li>Made a mistake? Every move, hand-off and delete can be undone from the message at the bottom.</li>
          </ol>
        </section>
        <section>
          <h3 className="mb-2 font-semibold">Keyboard shortcuts</h3>
          {!shortcutsOn && <p className="mb-2 text-xs text-ink-muted">Single-key shortcuts are turned off in Accessibility settings.</p>}
          <table className="w-full text-left">
            <thead className="sr-only">
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([keys, action, single]) => (
                <tr key={action} className={`border-t border-surface-line ${single && !shortcutsOn ? 'opacity-60' : ''}`}>
                  <td className="whitespace-nowrap py-2 pr-4">
                    {keys.map((k, i) => (
                      <span key={k}>
                        {i > 0 && ' + '}
                        <Kbd>{k}</Kbd>
                      </span>
                    ))}
                  </td>
                  <td className="py-2">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h3 className="mb-2 font-semibold">What the colours mean</h3>
          <ul className="space-y-1">
            <li className="flex items-center gap-2"><span className={TYPE_STYLE.feature.text}><TypeIcon type="feature" /></span> Star / left stripe = feature</li>
            <li className="flex items-center gap-2"><span className={TYPE_STYLE.bug.text}><TypeIcon type="bug" /></span> Bug icon / left stripe = bug</li>
            <li>Due labels always say the state in words: “Due in 5d”, “Due tomorrow”, “Due today”, “Overdue 2d”, “Done”.</li>
          </ul>
        </section>
        <button type="button" onClick={onClose} className={`${btnPrimary} self-end`}>
          Close help
        </button>
      </div>
    </Dialog>
  );
}
