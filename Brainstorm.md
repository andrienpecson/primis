# Brainstorm — Node.js Technical Assessment (Primis CX)

A checklist of all split requirement items from the assessment brief.

## Constraints & Setup
- [x] Node.js version 20 LTS or above (targets 23.6+ / Node 24 for native `.ts` execution)
- [x] Use only Node.js built-in modules (no third-party *runtime* npm packages; TypeScript + `@types/node` are dev-only)
- [x] Use the native `fetch` API (no Axios or other HTTP libraries) — availability guard added in `index.ts`
- [x] Script runnable via `node index.ts` (TypeScript variant of `node index.js`)
- [ ] Stay within the 2-hour time limit
- [ ] Mark any AI-generated/AI-assisted lines with a comment (e.g. `// AI-generated`)

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
- [ ] Clear README with instructions to run the project
- [ ] README documents any decisions made
- [ ] Commit to a Git repository with meaningful commit messages
- [ ] Multiple commits showing working process (not a single monolithic commit)
- [ ] Submit as a GitHub repo link (public, or private with access granted to recruiter email)

## Assessment Focus Areas (self-review)
- [ ] Code Quality — clean, readable, consistent formatting, sensible names, no unnecessary complexity
- [ ] Error Handling — defensive around API, missing fields, and file I/O; fails gracefully
- [ ] Data Handling — correct nested extraction/transformation; proper CSV escaping
- [ ] Project Structure — logical file organisation, easy for a teammate to pick up
- [ ] Documentation — clear README
- [ ] Output Quality — professional, usable HTML; valid CSV

## Bonus (Optional)
- [ ] CLI argument to filter by sub-region (e.g. `--region "Northern Europe"`)
- [x] Search/filter input in the HTML table (live-filters + updates visible count)
- [x] Sortable HTML table columns (click column headings; Population sorts numerically)
