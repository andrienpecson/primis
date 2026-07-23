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
Extract and transform the following fields per country:
- [ ] **Country Name** — from `name.common`
- [ ] **Capital** — from `capital[0]`; handle countries with no capital
- [ ] **Population** — from `population`; format with commas (e.g. `1,234,567`)
- [ ] **Languages** — from `languages`; join all values with a comma and space
- [ ] **Currency** — from `currencies`; display name + symbol of first currency (e.g. `Euro (€)`); handle missing data
- [ ] **Flag** — from `flags.png`; HTML only, rendered as `<img>` 32px wide

General processing:
- [ ] Sort results alphabetically by country name
- [ ] Handle missing/malformed data defensively with sensible fallbacks (e.g. `N/A`)

## 3. HTML Output
- [ ] Generate `countries.html` in an `/output` directory
- [ ] Single HTML table with a header row + one row per country
- [ ] CSS styling: alternating row colours
- [ ] CSS styling: header background colour
- [ ] CSS styling: reasonable padding (clean, readable)
- [ ] Page has a `<title>`
- [ ] Page has a heading
- [ ] Visible timestamp showing when the report was generated

## 4. CSV Output
- [ ] Generate `countries.csv` in the same `/output` directory
- [ ] Same data as the HTML table, excluding the flag image
- [ ] First row is a header row
- [ ] Properly escape fields containing commas (wrap in double quotes)

## 5. CLI Behaviour
- [ ] Print a completion summary to console (e.g. `Fetched 44 countries. Files written to /output.`)
- [ ] Exit with code 0 on success
- [ ] Exit with code 1 on failure

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
- [ ] Search/filter input in the HTML table
- [ ] Sortable HTML table columns (click column headings)
