# Vibe Ledger

**Every task, every prompt, one board.** A Kanban tracker for vibecoding projects that keeps the prompt context behind every task, so you — or the next AI — can pick up exactly where you left off.

**Author:** Taygun ([@Pink123456789](https://github.com/Pink123456789)) — BSc Applied Software Engineering, Cardiff University
**Module:** CM6312 *Adopting Technologies*, Assessment 1 (Requirements and Prototyping), 2026–27

I started this project at the UXD Vibecoding Hackathon 2026 from [ignacioalvmar/vibecoding-project-tracker](https://github.com/ignacioalvmar/vibecoding-project-tracker), shipped all 13 hackathon milestones, and then extended it in week 4 with accessibility, phone support, a prototype sign-in and changes based on user testing.

- **Live prototype:** `[add the Vercel URL here]`
- **No registration needed:** on the sign-in screen, choose **Continue with the demo account** or **Continue as guest**.

## What it does

| Area | Features |
|---|---|
| Board | Four columns (To Do · In Progress · Review · Done), feature/bug styling, due-date tints, drag-and-drop, `Alt` + `←/→` to move cards, a “Move to” menu on phones |
| Tasks | A visible **Edit** button on every card; an editor grouped into Details, Planning and Context; delete with confirmation and **Undo**; a free-text assignee with suggestions; “Hand off to…” on every card |
| Context | A Markdown briefing per task with preview, an AI-tool tag, last-updated time, **prompt history** with restore, and one-click **Copy Context** |
| Find | Search across title, description and context; filter by owner, type and due state |
| Accessibility | Dark / light / high-contrast themes, red–green and blue–yellow colour-vision palettes, a grayscale check, text size up to 150%, a readable font, reduce motion, **read aloud**, a skip link, keyboard shortcuts (which can be turned off) and a help dialog |
| Phones | One column at a time with tabs, a full-screen editor, a floating “+” button, 44 px touch targets, installable to the home screen |
| Account | Prototype sign-in (demo / guest / any email) and a profile page with stats, “My tasks” and editable details |
| Data | Stored in the browser (`localStorage`); JSON backup export and import; a deliverable-links board |

Design decisions and requirements are documented in [`PRD.md`](PRD.md) and [`DESIGN.md`](DESIGN.md). Accessibility audit results and screenshots are in [`docs/evidence/`](docs/evidence/).

## Evaluation

- **Accessibility:** axe-core (WCAG 2.2 A/AA + best practice) reports 0 violations across 54 combinations of theme, colour palette, screen size and page. Lighthouse accessibility went from 96 (hackathon version) to 100.
- **User testing:** I ran a think-aloud session with one participant from outside the university. The System Usability Scale score was **67.5**, around the average of 68. The participant valued the attention to accessibility but found editing a task hard and the editor generic-looking. In response, I added a visible Edit button to every card and regrouped the editor with clearer labels (PRD §16; screenshots 26–32).

## Prototype limitations

- **Sign-in is simulated.** There is no server: any email and password are accepted, and the password is never stored. Real accounts need a backend (e.g. Supabase or Firebase Auth), which is planned future work.
- **Data is per browser.** Tasks live in this browser’s `localStorage`, so a board isn’t shared between devices or people. Use *Accessibility & data → Export backup* to move it.
- **Small evaluation.** The usability test had one participant; a second round with around five users is the next step.

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
├── lib/hooks.js            localStorage, accessibility preferences, read aloud
└── components/
    ├── Board.jsx           columns, cards, phone tabs, Edit and Copy Context buttons
    ├── TaskModal.jsx       add / edit / delete, Context field, prompt history
    ├── Panels.jsx          deliverables, driver strip, search & filters, legend, toast, welcome
    ├── Settings.jsx        accessibility & data panel, help dialog
    ├── Auth.jsx            prototype sign-in
    ├── Profile.jsx         profile page
    └── ui.jsx              shared styles, icons, dialog, avatar
```

## Hackathon milestones

All 13 milestone tags (`git-linked` → `pitch-done`) were pushed during the hackathon; later tags (`accessibility-mobile`, `final-version`, `user-test-fixes`, `before-after`) mark the week 4 iterations. You can see them under the repository’s tags.

## AI use

As the module brief permits for the prototype, I built this app with Claude (Anthropic) as an AI coding assistant. I worked milestone by milestone: I set the goal of each step, Claude generated the code, and I ran and checked every change in the browser before committing it. Claude also wrote the automated test and audit scripts, drafted the first versions of `PRD.md` and `DESIGN.md`, and proposed the theme and the solo + AI-teammates framing; I reviewed and accepted these. I chose drag-and-drop as the hackathon’s secret sauce, asked for the accessibility, phone, sign-in and profile features, ran the user test myself, and approved the changes that followed from it. The coursework report is my own writing.
