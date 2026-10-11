# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This folder (inside an Obsidian vault) holds a paper-review presentation for a "Visualization for Data Science" course. The paper is reviewed as an interactive **website**, not as a traditional slide-style engineering review.

Paper: *Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco* (Moritz et al., IEEE TVCG 25(1), 2019, DOI 10.1109/TVCG.2018.2865240).

## Workflow

The work proceeds in documented stages tracked in `docs/00_Roadmap.md` (read it first to see the current stage):
1. Paper notes → `docs/01_paper/` (section summary, website-ready examples and numbers, glossary, critical review)
2. Site design concept → `docs/02_design.md`
3. Review order / table of contents → `docs/03_outline.md`
4. Build the site in `frontend/` from those docs
5. Build and deploy strategy → `docs/05_deploy.md`, then deploy (Vercel)
6. Content improvement → `docs/06_improvements.md`. Each request gets an `IMP-NNN` entry and one review direction: A add a part, B edit content, C presentation script only (`docs/07_script.md`), D no change. Record the review, get approval, then apply. Refer to parts by Part number (Deck slide number = Part + 1).

**Scope rule:** the review covers only the 2019 Draco described in this paper. Never present later work (Draco 2, the current Draco repo or docs, newer Vega-Lite features) as if it were part of the reviewed Draco. Later work may appear only in a clearly labeled "after this paper" mention. Implementation details the paper does not state must be marked as unstated, not filled in from other versions.

Site content should come from `docs/01_paper/` and the core-concept notes. `2019-Draco-InfoVis.pdf` is the source of truth for every claim; all docs cite paper sections (§) and figures.

## Content files

- `01_Paper Core concepts (Eng).md` / `02_Paper Core concepts (Kor).md` hold the same notes in English and Korean (Encoding, Vega-Lite, hard/soft constraints, ASP). Keep both in sync when either is edited.
- `docs/` is written in Korean, with technical terms kept in English.

## Frontend

`frontend/` is a Vite + React + TypeScript app (create-vite 9, Vite 8, React 19; linting with oxlint). Run from `frontend/`:

- `npm run dev`: dev server
- `npm run build`: type-check (`tsc -b`), production build to `dist/`, then `scripts/third-party-licenses.mjs` writes `dist/THIRD_PARTY_LICENSES.txt` (the minified bundle drops license comments)
- `npm run lint`: oxlint
- `npm run preview`: serve the built `dist/`

There are no tests. Visual checks so far were done by screenshotting `npm run preview` with headless Chrome.

### Architecture

The site applies Draco's own idea to itself. Three **views** (Paper / Deck / Explorer) render the same content, and a cost toast scores each view against site-design soft constraints, using a weight set chosen by the **context** toggle (present / read / explore).

- `src/content/sections.tsx`: the single content source (11 parts). Each part has `lead`, `points`, optional `detail` (hidden in Deck), and an optional `Demo` component. Every view reads only from here.
- `src/design/model.ts`: the site's own constraint knowledge base (soft constraints, per-context weights, per-view violation counts, facts, cost and ranking). These are hand-tuned values for the site, **not** the paper's knowledge base, and the UI says so. Keep `docs/02_design.md` in sync when changing them.
- `src/views/`: `PaperView`, `DeckView` (arrow keys, `?slide=`), `ExplorerView`. `App.tsx` keeps view, context, and slide in the URL query string and localStorage; keys `1`/`2`/`3` switch views.
- `src/demos/`: interactive demos, one per part, tied to paper sections (Fig. 2 code pair, design-space pruning, weight sliders using the §6.2 weights, query pipeline, an in-browser RankSVM, evidence tiles with the Fig. 8 task toggle). Captions mark which values come from the paper and which are illustrative.
- `src/components/VegaChart.tsx` lazy-loads `vega-embed` and builds the chart theme from CSS variables. It re-renders when `ThemeContext` changes; `theme.ts` uses a layout effect so the new `data-theme` is applied before the charts read the variables.
- Colors are CSS tokens in `src/index.css` (light and dark). Chart series use the first three slots of the dataviz reference palette; there are never more than 3 categories.
- `public/data/cars.json` (vega-datasets) is bundled so the site does not depend on network access during the presentation.

## Backend

`backend/` is intentionally empty. Keep it until the final site is done. The current plan is a static frontend only (no FastAPI/Render) unless a live Draco demo turns out to need a server.

## Notes

- The vault path contains spaces and parentheses (`01_Draco(InfoVis)`); always quote paths in shell commands.
- Git repo on `main`; commit author is set locally (`git config user.name/user.email`), not globally. Vercel deploys from the GitHub remote.
- Deploy: Vercel project with Root Directory `frontend`; settings in `frontend/vercel.json`. Every push to `main` redeploys production. See `docs/05_deploy.md`.
