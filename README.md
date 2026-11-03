# PK Playground

A cute, beginner-friendly learning tool (sky blue & gray theme, hand-drawn sketch icons) about Primary Keys. Plain HTML + CSS + JavaScript — no build step, no dependencies, no internet needed.

## Run it

- **With npm (no install needed):** open a terminal in this folder and run `npm run dev`, then open <http://localhost:3000> (the studio is at <http://localhost:3000/visualization>).
- **Easiest:** double-click `index.html`.
- **As a site** (so `/visualization` works as a route): from this folder run `python3 -m http.server 8000` and open <http://localhost:8000>. Any static host works the same way (`visualization/index.html` is served at `/visualization`).

## Main features (welcome page)

| Option | Path |
| --- | --- |
| 🔑 Primary Key | `primary-key/index.html` |
| ✨ Custom Primary Key | `custom-primary-key/index.html` |
| 🎨 **Visualization Studio** (new) | `visualization/index.html` → `/visualization` |

## Visualization Studio

| Page | What it shows |
| --- | --- |
| `visualization/primary-key.html` | Employee table, PK column, unique ID lookup, duplicate & NULL rejection, single + composite keys, plus a "try it yourself" sandbox |
| `visualization/generation.html` | Flowcharts: manual, database-side, application-side, ORM/JPA; JPA AUTO / IDENTITY / SEQUENCE / TABLE |
| `visualization/custom-id.html` | Prefix+Sequence, Date+Sequence, UUID, Random/Token, Business-rule, Sequence formatting, Manual ID — built from coloured segments |
| `visualization/code-to-database.html` | Java Entity → ID Generation → Repository Save → SQL Insert → Table, with Java and SQL highlighted side by side |

Every visualization shares the same controls: Start, Pause, Replay, Reset, Previous / Next (1 step), Back 3 / Forward 3, a step slider, and Speed. Keys: ← / → move 1 step, Shift + ← / → move 3 steps.
All data is simulated in local JavaScript — there is no real Java compiler or database.

## Files

```
package.json, server.js          `npm run dev` starts a tiny local server
index.html                       welcome page (3 main options)
primary-key/index.html           basic lesson page
custom-primary-key/index.html    basic lesson page
visualization/                   the Visualization Studio
assets/css/theme.css             sky blue & gray theme
assets/css/visualization.css     small extras for the studio
assets/js/common.js              header/footer, step player, code highlighter
assets/js/icons.js               sketchy hand-drawn icons (auto-replaces every emoji)
assets/logo.svg                  the logo (also the browser-tab icon)
assets/js/viz-*.js               one script per visualization
```
