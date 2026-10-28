# Vibecoding Project Tracker — PRD

**Status:** Reviewed and completed for team *Vibe Ledger* · tagged `prd-done`.

---

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the team members, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of vibecoders taking the same class.

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

## 3. Product overview

A single-page web app with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states.
- An **Anchor Board** above it that pins the four final-project deliverables (Presentation, Demo, Report, Documentation).

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

## 4. Primary user flow

1. Open the Webapp. The board loads from local storage.
2. Click "+" to add a task. Fill in title, type, assignee, due date, prompt context.
3. Move the task across columns as you work.
4. When stuck, click "Copy as Prompt Context" on a task and paste it into Claude/ChatGPT/Cursor to continue.
5. Hand off a task to a teammate with one dropdown.
6. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,              // free text since §15; the §8 names are suggestions
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'

  // Added in later milestones:
  context: string,               // M9 context — curated briefing for the next AI / teammate
  contextTool: string | null,    // M9 context — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
  contextUpdatedAt: string|null, // M9 context — ISO timestamp set automatically on save

  // Added after the hackathon (§14):
  contextHistory: Array<{ at: string, tool: string|null, text: string }>, // earlier Context versions, newest first, max 20
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}
```

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + a `useLocalStorage` hook | Simple, no library needed. |
| Persistence | **localStorage** | Zero infra. Pick this. Do not switch to a backend mid-hackathon. |
| Deploy | Vercel | One-click deploy from GitHub. |

> **Decision:** localStorage, not a shared backend. If you want a shared backend later, that's M14 — out of scope for the hackathon.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

Fill these in before tagging `prd-done`:

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | Taygun (human lead) | `@Pink123456789` |
| Teammate B | Claude (AI pair) | n/a — AI collaborator |
| Teammate C | Gemini (AI pair) | n/a — AI collaborator |

These three names are the default people. Since §15, `Task.assignee` is free text: these names are offered as suggestions and any typed name becomes a person on the board.

> **Team note.** Taygun is working solo. Instead of inventing classmates, the two remaining slots are the AI tools he actually pairs with. "Hand off to Claude" means: this task's next step is an AI session, and the Copy Context button produces the briefing for it.

## 9. Milestone ownership

Fill in the owner column. Recommended default in **bold**; change if your team has different strengths.

| # | Tag | Title | Suggested owner | Final owner |
|---|---|---|---|---|
| 3 | `design-done` | Design system + voice (DESIGN.md) | **B** | Taygun |
| 4 | `data-model` | Task model + board view | **A** | Taygun |
| 5 | `crud-modal` | Add / edit / delete modal | **A** | Taygun |
| 6 | `tag-style` | Feature / bug colors | **B** | Taygun |
| 7 | `task-owner` | Owner indicator + handoff | **A** | Taygun |
| 8 | `due-tint` | Due-date color tinting | **B** | Taygun |
| 9 | `task-context` | Context field on the task modal | **C** | Taygun |
| 10 | `copy-context` | "Copy as Prompt Context" button | **C** | Taygun |
| 11 | `project-deliverables` | Deliverable Anchor Board | **B** | Taygun |
| 12 | `secret-sauce` | The one thing that makes it yours | **C / All** | Taygun |
| 13 | `pitch-done` | Demo + pitch rehearsal | **All** | Taygun |


Track A owns the state model and task ownership. Track B owns the visuals (and design — M3 runs parallel to M2 so the team starts Phase 3 with the palette already chosen). Track C owns the differentiator features (M9 + M10 — the context field and the Copy-as-Prompt button) and usually leads on M12 secret-sauce. Put your strongest prompter on Track C.

**Dependency note.** M3 (`design-done`) runs **in parallel with M2** — Person B drafts DESIGN.md and pastes the colors into `tailwind.config.js` while the rest of the team reviews the PRD. M6 / M7 / M8 / M11 all depend on M4 + M5 being done first. While Person A builds M4+M5 (first ~60 min of Phase 3), Person C should draft the Markdown template for the "Copy as Prompt Context" output (M10). M12 `secret-sauce` is open-ended — pick whatever makes the tracker uniquely yours; constraint is "must be visible in the demo and must not break anything else."

## 10. AI / vibe coding angle

Where AI will be heavily used:
- M4, M5: scaffold the board and the modal from a single prompt each.
- M9, M10: write the Markdown serialization helper for the Context field.
- M7: animation polish for the handoff toast.

Where AI will **not** save you time:
- M2 (this PRD review) — read it yourself.
- M3 (DESIGN.md) — design taste is yours, not the model's.
- M12 (secret-sauce) — the whole point is that AI can't predict it.
- M13 (pitch) — write the script in your own voice.

Keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks — those become part of your Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

Fill in:

- **Team name:** Vibe Ledger
- **Tagline (one sentence):** Every task, every prompt, one board — so no good prompt gets lost.
- **Tracker URL after deploy:** added after the Vercel deploy in M13.

## 11b. Accessibility (added after the requirements Q&A)

The module leaders asked for accessibility in both design and implementation. Minimum bar for this build:

- Every interactive element is reachable and usable with the keyboard; the modal traps focus and closes on `Esc`.
- Icon-only buttons carry an `aria-label`; colour is never the only signal (feature/bug and due states also have an icon or text label).
- Text meets WCAG AA contrast against its background.
- Toasts are announced through an `aria-live` region.

## 12. Out of scope (do not build)

- Authentication / accounts.
- Real GitHub integration.
- A real backend / shared database.
- ~~Mobile responsive — desktop only is fine.~~ Moved into scope after the hackathon (§14), following the Small Screen Usability session.
- Multi-team support.
- Real-time collaboration.

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- The board loads on Vercel without errors.
- The "Copy as Prompt Context" demo works on stage.
- 5 min pitch is rehearsed.

## 14. Post-hackathon iteration (week 4)

After the hackathon the tracker was extended with the accessibility, usability and data features below. Each one is listed here so it can be traced to a requirement in the coursework report. Preferences are stored in `localStorage` under `vibetracker.prefs`.

| Area | Feature | Where |
|---|---|---|
| Accessibility | Themes: match device, dark, light, high contrast | Accessibility panel |
| Accessibility | Colour-vision palettes: red–green (Okabe–Ito), blue–yellow, grayscale | Accessibility panel |
| Accessibility | Text size 100 / 112.5 / 125 / 150 % (root font size, everything scales) | Accessibility panel |
| Accessibility | Readable font (Atkinson Hyperlegible) with wider text spacing | Accessibility panel |
| Accessibility | Reduce motion (follows the OS setting by default) | Accessibility panel |
| Accessibility | Read aloud (Web Speech API): any card, the task editor, or a whole-board summary; adjustable speed | Speaker buttons |
| Accessibility | Skip link, keyboard shortcuts (N, /, ?, A, Ctrl/⌘+Z, Alt+arrows) that can be switched off, help dialog | Header, Help |
| Usability | Undo for moves, hand-offs, deletes, imports and demo resets | Message bar / Ctrl+Z |
| Usability | Search (title, description, context) and filters (owner, type, due state); driver strip filters by owner | Above the board |
| Usability | First-visit welcome with the three core steps | Top of the board |
| Small screens | One-column tab bar, "Move to" menu instead of drag, full-screen editor, floating New-task button, 44 px touch targets, collapsible deliverables, installable (web app manifest) | Phones |
| Data | Export / import a JSON backup with validation; prompt history with view and restore | Accessibility & data panel, task editor |

**Verification.** Automated checks with axe-core (WCAG 2.2 A/AA + best practice) across 54 combinations of theme, colour palette, screen size and page (sign-in, board, task editor, settings, profile) report 0 violations. Lighthouse accessibility went from 96 to 100 on both mobile and desktop.

## 15. Prototype sign-in, profile and free-text assignees

- **Sign-in (prototype).** There is no backend, so this is a front-end simulation, labelled as such on screen. Any email + password is accepted; the password is never stored. One-click **demo account** and **guest** options mean an assessor never has to register. Follows WCAG 3.3.8 Accessible Authentication (paste allowed, `autocomplete` for password managers, show/hide password, no puzzles).
- **Session** is kept in `localStorage` (`vibetracker.session`); signing back in with the same email restores the last profile (`vibetracker.lastProfile`).
  `Session = { name, email, role, bio, preferredTool, guest, memberSince, signedInAt }`
- **Profile page** (`#/profile`, works with the browser Back button): avatar, role, member since; counts of open, due/overdue, done tasks and Context versions; *My tasks* list that opens the editor; editable name, email, role, favourite AI tool and bio (renaming can move your tasks to the new name); sign out; shortcuts to accessibility settings and backup export.
- **Free-text assignee.** The editor's Assignee field is a text box with suggestions (`<datalist>`) from everyone already on the board. Names are trimmed and matched case-insensitively, so "claude" reuses "Claude". New people appear in the hand-off menu, the driver strip and the owner filter, each with a stable avatar colour.
- **Out of scope / future work:** real accounts, password checks and a shared synced board need a backend (e.g. Supabase or Firebase Auth).

## 16. Changes after user testing

A think-aloud test with one participant from outside the university gave a SUS score of 67.5. The participant found **editing a task** hardest and said the task editor looked generic. Two changes followed:

- **Visible Edit button on every card.** Editing used to require clicking the card itself, which nothing on the card signalled (Norman: signifiers; Nielsen #6 recognition rather than recall).
- **Clearer task editor.** Fields are grouped under Details, Planning and Context; labels are sentence case at normal size instead of small upper-case; the title field is larger (Nielsen #8 aesthetic and minimalist design). The new label style is used on every form for consistency.

Screenshots 26–29 in `docs/evidence/` show before and after. axe still reports 0 violations across all 54 scenarios.

---

*PRD version: hackathon-starter v1 · maintained by Prof. Dr. Ignacio Alvarez*
