# Evidence for the coursework report

Generated on 27 Oct 2026 against a production build (`vite build` + `vite preview`).

| File | What it shows |
|---|---|
| `lighthouse-before-mobile.html` | Hackathon version (M13): Accessibility 96, Best practices 96, SEO 91 |
| `lighthouse-after-mobile.html` / `-desktop.html` | After the accessibility iteration: Accessibility 100, SEO 100, Performance 98 / 100 |
| `axe-before-desktop.json` | axe-core on the hackathon version: 2 issues (colour contrast, content outside landmarks) |
| `axe-after-30-scenarios.json` | axe-core (WCAG 2.2 A/AA + best practice) on 30 combinations of theme × colour palette × screen size × open dialog: 0 violations |
| `screenshots/` | One screenshot per feature, numbered in the order they appear in the report |

Best-practices stays at 96 only because the sandbox that ran the audit could not reach Google Fonts; re-run Lighthouse on the deployed URL for the final figure.
