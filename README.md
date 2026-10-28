# Vibe Ledger

**Every task, every prompt, one board.** A Kanban tracker for vibecoding projects that keeps the prompt context behind every task, so you (or the next AI) can pick up exactly where you left off.

Built for CM6312 *Adopting Technologies* (Cardiff University) — started at the UXD Vibecoding Hackathon 2026 from [ignacioalvmar/vibecoding-project-tracker](https://github.com/ignacioalvmar/vibecoding-project-tracker), then extended in week 4.

- **Live prototype:** `[add the Vercel URL here]`
- **No registration needed:** on the sign-in screen choose **Continue with the demo account** or **Continue as guest**.

## What it does

| Area | Features |
|---|---|
| Board | Four columns (To Do · In Progress · Review · Done), feature/bug styling, due-date tints, drag-and-drop, `Alt` + `←/→` to move cards, “Move to” menu on phones |
| Tasks | Add / edit / delete with confirmation and **Undo**; free-text assignee with suggestions; “Hand off to…” on every card |
| Context | Markdown briefing per task with preview, AI-tool tag, last-updated time, **prompt history** with restore, one-click **Copy Context** |
| Find | Search across title, description and context; filter by owner, type and due state |
| Accessibility | Dark / light / high-contrast themes, red–green and blue–yellow colour-vision palettes, grayscale check, text size up to 150 %, readable font, reduce motion, **read aloud**, skip link, keyboard shortcuts (can be turned off), help dialog |
| Phones | One column at a time with tabs, full-screen editor, floating “+” button, 44 px touch targets, installable to the home screen |
| Account | Prototype sign-in (demo / guest / any email), profile page with stats, “My tasks” and editable details |
| Data | Stored in the browser (`localStorage`); JSON backup export / import; deliverable links board |

Design decisions and requirements are documented in [`PRD.md`](PRD.md) and [`DESIGN.md`](DESIGN.md). Accessibility audit results and screenshots are in [`docs/evidence/`](docs/evidence/).

## Prototype limitations

- **Sign-in is simulated.** There is no server: any email and password are accepted and the password is never stored. Real accounts need a backend (e.g. Supabase or Firebase Auth) — planned future work.
- **Data is per browser.** Tasks live in this browser’s `localStorage`, so a board isn’t shared between devices or people. Use *Accessibility & data → Export backup* to move it.

## Run it locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/Pink123456789/vibecoding-project-tracker.git
cd vibecoding-project-tracker
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). `npm run build` creates the production version in `dist/`.

## Deploy

Import the repository on [vercel.com](https://vercel.com) and accept the defaults (Vite is detected automatically). Every push to `main` redeploys. Make sure *Settings → Deployment Protection* is off so the link opens without a Vercel login.

## Project structure

```
src/
├── App.jsx                 app shell: session, routing (#/profile), undo, shortcuts
├── lib/model.js            data model, seed data, due states, search, backup, speech text
├── lib/hooks.js            localStorage, accessibility preferences, read-aloud
└── components/
    ├── Board.jsx           columns, cards, phone tabs, Copy Context
    ├── TaskModal.jsx       add / edit / delete, Context field, prompt history
    ├── Panels.jsx          deliverables, driver strip, search & filters, legend, toast, welcome
    ├── Settings.jsx        accessibility & data panel, help dialog
    ├── Auth.jsx            prototype sign-in
    ├── Profile.jsx         profile page
    └── ui.jsx              shared styles, icons, dialog, avatar
```

## Hackathon milestones

All 13 milestone tags (`git-linked` → `pitch-done`) were pushed during the hackathon; the history is visible under the repository’s tags.

## AI use

The code was written with Claude (Anthropic) as an AI coding assistant, milestone by milestone, with every step run and tested in the browser before it was committed. Design and scope decisions were reviewed and accepted by the author.
