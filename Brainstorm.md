# Brainstorm — Node.js Technical Assessment (Primis CX)

A checklist of all split requirement items from the assessment brief.

## Constraints & Setup
- [x] Node.js version 20 LTS or above (targets 23.6+ / Node 24 for native `.ts` execution)
- [x] Use only Node.js built-in modules (no third-party *runtime* npm packages; TypeScript + `@types/node` are dev-only)
- [x] Use the native `fetch` API (no Axios or other HTTP libraries) — availability guard added in `index.ts`
- [x] Script runnable via `node index.ts` (TypeScript variant of `node index.js`)

## 1. Data Fetching
> **Endpoint updated:** using the authenticated v5 API — `GET https://api.restcountries.com/countries/v5?region=Europe` with `Authorization: Bearer <API_KEY>`. Response is a paginated envelope (`data.objects` + `meta`), so the client walks all pages.
- [x] Fetch all European countries (54) from the v5 endpoint, following pagination
- [x] Use native `fetch` (Node 20+)
- [x] Handle network errors gracefully (no crash)
- [x] Handle non-200 responses gracefully (no crash) — surfaces the API's own error message
- [x] Log a meaningful error message on failure
- [x] Exit with a non-zero code on failure

## 2. Data Processing
Extract and transform the following fields per country (v5 paths differ from the brief's v3.1 paths — see `src/transform.ts`):
- [x] **Country Name** — from `names.common`
- [x] **Capital** — from `capitals[0].name`; handles countries with no capital
- [x] **Population** — from `population`; formatted with commas (e.g. `1,234,567`)
- [x] **Languages** — from `languages[].name`; joined with a comma and space
- [x] **Currency** — from `currencies[0]`; displays name + symbol (e.g. `Euro (€)`); handles missing data
- [x] **Flag** — from `flag.url_png`; carried on the row for the HTML `<img>` (CSV excludes it)

General processing:
- [x] Sort results alphabetically by country name (case-insensitive)
- [x] Handle missing/malformed data defensively with sensible fallbacks (`N/A`)

## 3. HTML Output
- [x] Generate `countries.html` in an `/output` directory
- [x] Single HTML table with a header row + one row per country
- [x] CSS styling: alternating row colours (`tbody tr:nth-child(even)`)
- [x] CSS styling: header background colour
- [x] CSS styling: reasonable padding (clean, readable)
- [x] Page has a `<title>`
- [x] Page has a heading (`<h1>`)
- [x] Visible timestamp showing when the report was generated

## 4. CSV Output
- [x] Generate `countries.csv` in the same `/output` directory
- [x] Same data as the HTML table, excluding the flag image
- [x] First row is a header row
- [x] Properly escape fields containing commas (also quotes/newlines, RFC 4180)

## 5. CLI Behaviour
- [x] Print a completion summary to console (count + files written to `output/`)
- [x] Exit with code 0 on success
- [x] Exit with code 1 on failure

## 6. Documentation & Version Control
- [x] Clear README with instructions to run the project (setup + all commands)
- [x] README documents any decisions made (v5 API, native TS, no runtime deps, etc.)

## 7. Testing (extra — not required by the brief)
- [x] Add unit tests using Node's built-in `node:test` + `node:assert` (no third-party deps), run via `npm test`. Covers the pure logic: `transform.ts` (field extraction, `N/A` fallbacks, sorting, currency/languages formatting, defensive malformed input) and sub-region validation. CSV escaping (`csv.ts`) is covered by `test/csv.test.ts` when present.

## Assessment Focus Areas (self-review)
- [x] Code Quality — small, single-purpose modules and pure functions; sensible names; JSDoc throughout; removed leftover debug logging so the CLI output is clean
- [x] Error Handling — network errors, non-200s (API message surfaced), and malformed JSON caught in the client; file I/O and validation errors bubble to a single top-level handler that logs and exits 1; extractors degrade to `N/A`
- [x] Data Handling — correct v5 nested extraction (`names.common`, `capitals[0].name`, etc.); RFC 4180 CSV escaping verified (comma fields quoted, quotes doubled)
- [x] Project Structure — `index.ts` (entry) · `src/` (client + config) · `src/utils/` (transform/csv/markup/output/subregion) · `test/`; unit-tested pure logic
- [x] Documentation — README (setup, all commands, output, env vars, structure, decisions) + `CLAUDE.md` + JSDoc
- [x] Output Quality — valid CSV (header + escaping); professional HTML (title, heading, timestamp, alternating rows, 32px flags, search + sortable columns); clean console summary

## Bonus (Optional)
- [x] CLI argument to filter by sub-region (`--region`/`--subregion`, e.g. `--region "Northern Europe"`)
- [x] Search/filter input in the HTML table (live-filters + updates visible count)
- [x] Sortable HTML table columns (click column headings; Population sorts numerically)
