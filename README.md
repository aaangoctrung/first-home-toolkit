# First Home Toolkit

A small static website with five calculators for people exploring a first home purchase in Victoria, Australia. Educational estimates only — not financial or legal advice. All calculations run in your browser; there is no backend, database, analytics or external API.

**Stack:** React + Vite + TypeScript, plain CSS (design tokens in `src/styles.css`), Vitest for calculation tests.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for src/lib/calc.ts
npm run build      # type-check + build static files into dist/
npm run preview    # serve dist/ locally
```

## Project structure

```
src/
  lib/calc.ts        pure calculation + validation helpers (tested)
  lib/calc.test.ts   Vitest tests
  lib/format.ts      en-AU / AUD formatting
  lib/storage.ts     localStorage hook
  components/        shared UI (fields, stats, progress, shell) and scenario inputs
  tools/             Mortgage, Savings, RateTest, Upfront, Compare
  App.tsx            hash-based navigation + shared state
  styles.css         design system (tokens, components, responsive rules)
```

To add a tool: create `src/tools/NewTool.tsx` using `ToolShell`, add an entry to `NAV` and `CARDS` in `App.tsx`, and add an icon path in `components/ui.tsx`.

## Deploy to Cloudflare Pages (from GitHub)

1. Push this repo to GitHub (branch `production`, or `main` if you prefer).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select the repo.
3. Build settings: framework preset **Vite** (or None), build command `npm run build`, output directory `dist`.
4. Set **Production branch** to your chosen branch. Optionally add env var `NODE_VERSION=20`.
5. **Save and Deploy**. Every push to the production branch redeploys automatically; other branches get preview URLs.

Navigation uses URL hashes (`#mortgage`, `#savings`, …), so no redirect rules are needed on static hosting.

## Notes

- Sample values ($650,000, 20%, 6.0%, 30 years) are illustrative, not live market rates.
- Stamp duty is a manual field; use the [SRO calculator](https://sro.vic.gov.au/).
- Preferences are stored in `localStorage` under keys starting with `fht:v1:`.
