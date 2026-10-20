# Vibe Ledger — Design

**Status:** Completed · tagged `design-done`.

**Why this file exists.** This tracker is my tool. It should look like *my* tool — not a generic Kanban with default Tailwind blue.

---

## 1. Mood / vibe

A calm, late-night studio desk: dark, quiet surfaces where the only bright things are the bits that need your attention.

References:

- Linear's dark UI — dense information, no visual noise.
- Raycast — monospace details and crisp focus states that feel like a developer tool.
- A paper ledger — every entry is dated and has an owner, which is where the name comes from.

Anti-references — what we are explicitly **not** trying to look like:

- A default Trello/Jira board with bright blue headers and heavy drop shadows.

## 2. Color palette

All text/background pairs were chosen to meet WCAG AA contrast on the dark surfaces.

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#8B7CFF` | Header wordmark, "+" button, focus rings |
| `brand-accent` | `#22D3EE` | Highlights, hover states, links |
| `surface-page` | `#0E1015` | Page background |
| `surface-card` | `#181B23` | Card background |
| `text-primary` | `#E8EAF0` | Body text |
| `text-muted` | `#9AA3B5` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#34D399` | Cards tagged `feature` (accent stripe + sparkle icon) |
| `type-bug` | `#FB7185` | Cards tagged `bug` (accent stripe + bug icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#5EEAD4` | More than 2 days out |
| `due-soon` | `#FCD34D` | Between 1 and 2 days (added so the jump from calm to warning isn't abrupt) |
| `due-warning` | `#FB923C` | Less than 24 hours |
| `due-overdue` | `#F43F5E` | Past due |
| `due-neutral` | `#64748B` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | Space Grotesk | Slightly quirky geometric shapes give the wordmark character without being loud. |
| Body | Inter | Built for screens and stays legible at 12–14 px on dark backgrounds. |
| Monospace (tags, badges, code) | JetBrains Mono | Context blocks are Markdown/prompts, so they should look like code. |

Sizes:

- Page title: 24 px / semibold
- Section header: 13 px / semibold uppercase, letter-spaced
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

- **Cards:** Flat dark tiles with a 1 px border and a 3 px coloured left stripe for the type; they lift slightly on hover and show a visible focus ring.
- **Buttons:** Solid violet for the one primary action per view, ghost (border only) for everything else, rounded-lg, never a gradient.
- **Modal:** Centered, max-width 2xl, black backdrop at 60% opacity, closes on `Esc` and on backdrop click.
- **Empty states:** Dashed border, muted text, encouraging — never sad.
- **Drag affordance:** Status is changed with a dropdown first (M5); drag-and-drop is the M12 secret sauce, with a grab cursor and a highlighted drop column.

## 5. Voice / microcopy

| Where | Text |
|---|---|
| "+" button label | + New task |
| Empty column placeholder | Nothing here yet — drop a task in. |
| Toast after "Copy Context" | Context copied. Paste it into your AI and keep vibing. |
| Confirm-delete message | Delete this task? This can't be undone. |
| Handoff toast (M7 `task-owner`) | Handed off to {name}. They've got it. |

## 6. Logo / wordmark

- **Product name:** Vibe Ledger
- **Wordmark style:** The name in Space Grotesk, brand-primary colour, with a small "▍" cursor mark before it in brand-accent.

## 7. Out of scope (this hackathon)

- A light mode toggle. We ship dark only.
- Multiple themes.
- Animations beyond short fades and the card hover lift.
- A custom icon set — inline SVG icons only.
