# Vibe Ledger — Pitch & Demo Guide (M13 `pitch-done`)

> Talking points, not a script to read out. PRD §10 says the pitch should be in your own voice, so rephrase everything here the way you'd actually say it.

## One-liner

**Vibe Ledger is a Kanban board for vibecoding that remembers the prompts behind every task.** One click turns any task into a briefing you can paste straight into Claude, ChatGPT or Cursor.

## The problem (PRD §1)

1. **Lost tasks.** Lots of small vibecoding jobs and no shared view of what state each one is in.
2. **Lost prompts.** The AI produced working code two days ago and nobody remembers the prompt. Iterating means starting from scratch.

Jira, Linear and Notion are overkill, take hours to set up, and don't know what a prompt is.

## Who it's for

- **Primary:** me, working solo, with two AI "teammates" (Claude and Gemini) as the other assignees. Handing a task to Claude means "the next step happens in an AI session".
- **Secondary:** future vibecoding cohorts on this module.

## 5-minute structure

| Time | Beat |
|---|---|
| 0:00–0:30 | Problem: lost tasks, lost prompts |
| 0:30–1:00 | One-liner + who it's for |
| 1:00–4:00 | Live demo (below) |
| 4:00–4:30 | Accessibility + design decisions |
| 4:30–5:00 | What's next + thank you |

## Live demo — click by click

Before you start: open the deployed URL, click **Continue with the demo account**, then open **Accessibility → Reset demo data** (or the footer link) so the board looks the same every time.

1. **Overview.** Point at the four columns (To Do → In Progress → Review → Done), the **Final deliverables** strip pinned on top, and the **driver strip** showing who is driving how many tasks.
2. **Feature vs bug (M6).** Green stripe + star = feature, pink stripe + bug icon = bug. Colour is never the only signal.
3. **Due tint (M8).** The red "Overdue 2d" card, the orange "Due today" card, and Done always neutral. No extra field — it's computed from the due date and updates by itself.
4. **Create a task (M5).** Click **+ New task**. Show that the Context field is pre-filled with the Background / Constraints / Tried so far / Pick up template (M9). Save it — it appears on the board.
5. **The hero moment (M9 + M10).** Open "Fix nav overlapping on scroll", show the Context and the **Preview** tab, then click **Copy Context**. Paste it into Claude/ChatGPT live and let the AI continue from "Pick up".
6. **Hand off (M7).** On a card, choose **Hand off to Claude**. The toast says "Handed off to Claude. They've got it." and the card flashes.
7. **Secret sauce (M12).** Drag a card from Review to Done ("… shipped. Nice."). Then focus a card with Tab and press **Alt + →** to show the keyboard alternative.
8. **Deliverables (M11).** Paste the demo URL into the **Demo** slot. The dot turns green and the counter goes to 1/4.
9. **Persistence.** Refresh the page — everything is still there (localStorage).
10. **Accessibility (post-hackathon).** Open **Accessibility**: switch to high contrast, then red–green friendly, then grayscale — every state still reads by icon and text. Press the speaker on a card to have it read aloud.
11. **On a phone.** Show the column tabs, the “Move to” menu and the floating + button.
12. **Profile.** Click your avatar: open/overdue/done counts and *My tasks*.

## Design & accessibility points to mention

- Dark "late-night studio" theme (DESIGN.md §1): calm surfaces, colour only where attention is needed.
- Keyboard: modal traps focus and closes on Esc; cards move with Alt + arrows; every icon button has an `aria-label`.
- Status is always text + icon + colour (WCAG: don't rely on colour alone).
- Toasts are announced to screen readers via `aria-live`.
- Delete asks for confirmation in the page instead of a browser popup.

## Likely questions

- **Why localStorage and not a database?** The PRD locks it for the hackathon: zero infrastructure. A shared backend + login is the natural next step (the module leaders suggested login for privacy).
- **Why are Claude and Gemini teammates?** I'm working solo, and those are the tools I actually hand work to. The Copy Context button is the handoff mechanism.
- **What would you add next?** Login, a shared backend, and a timestamped prompt history per task (feeds the Module 5 "Vibe Coding History" deliverable).

## AI use (be upfront)

The prototype was built with Claude as the coding assistant, milestone by milestone, with each step tested in the browser before it was committed. Claude also proposed the design and scope choices (theme, solo + AI-teammates framing). I reviewed and accepted them, and picked drag-and-drop as the secret sauce. I need to justify these choices myself in the report.
