# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A Node.js command-line tool (written in TypeScript) that fetches European country
data from the **REST Countries API**, transforms it, and generates two report files:
a styled **HTML** table and a **CSV**. Built as a technical assessment for Primis CX.

The full, authoritative requirements live in [Brainstorm.md](Brainstorm.md) — a
checklist derived directly from the assessment brief. **Treat `Brainstorm.md` as the
source of truth for scope**, and tick items off there as they are completed.

[README.md](README.md) is the user-facing doc (setup, usage, decisions). Keep it in
sync when behaviour, flags, env vars, or output names change.

## Hard constraints (from the brief — do not violate)

- **No third-party *runtime* dependencies.** Node.js built-in modules only.
  - Exception, already decided: `typescript` and `@types/node` are allowed as
    **dev-only** deps (needed for TS itself). They never ship or run at runtime.
- **Use the native `fetch` API only** — no Axios or other HTTP libraries.
- **Node.js 20 LTS or above.** This project targets **23.6+ / Node 24** specifically,
  to run TypeScript natively (see below).
- Any AI-generated / AI-assisted code must be marked with a comment. Established
  convention: a header comment on the first line of the module, e.g.
  `// AI-generated (authored with Claude): HTML report generation.`
- Commit incrementally with meaningful messages — the working process matters, not a
  single monolithic commit.

## TypeScript setup — native type stripping

This project uses **Node's native TypeScript execution** (type stripping), available
in Node 23.6+. There is **no build step** and **no bundler**.

- Run directly: `node index.ts`
- Because Node strips types rather than compiling, **only fully-erasable TS syntax is
  allowed**: no `enum`, no `namespace`, no parameter properties, no experimental
  decorators. `tsconfig.json` enforces this via `erasableSyntaxOnly`.
- Relative imports must include the `.ts` extension (e.g. `import { x } from "./foo.ts"`).
  This is required by `allowImportingTsExtensions` + `verbatimModuleSyntax`.
- `tsc` is used for **type-checking only** (`noEmit`); it never produces output.

## Commands

| Command | What it does |
|---|---|
| `node index.ts` | Run the tool (fetch → transform → write `output/`). |
| `npm start` | Same as above. |
| `node index.ts --subregion "Northern Europe"` | Run scoped to one European sub-region. |
| `npm test` | Run unit tests with Node's built-in runner (`node --test`). |
| `npm run typecheck` | Type-check with `tsc --noEmit`. Run this before committing. |
| `npm install` | Install dev-only tooling (`typescript`, `@types/node`). |

Run `npm run typecheck` and `npm test` before committing.

## Project layout

```
index.ts                    # CLI entry point: orchestration, exit codes, summary output
src/
  RestCountriesApi.ts       # API client + RestCountry type: auth, pagination, error handling
  config.ts                 # Loads .env (process.loadEnvFile) and exposes configuration
  utils/
    transform.ts            # RestCountry -> CountryRow extraction, fallbacks, sorting
    csv.ts                  # CSV serialisation (RFC 4180)
    markup.ts               # HTML document generation (+ client-side search/sort)
    output.ts               # Writes files into ./output
test/
  transform.test.ts         # node:test unit tests for the transform module
  subregion.test.ts         # node:test unit tests for sub-region validation
tsconfig.json               # Type-check + native-strip config (noEmit, erasableSyntaxOnly)
package.json                # ESM ("type":"module"), engines >=23.6, dev-only deps
Brainstorm.md               # Requirements checklist (source of truth for scope)
README.md                   # User-facing setup/usage/decisions
.env / .env.example         # API_KEY etc. (.env is git-ignored)
output/                     # Generated reports (git-ignored)
```

Pipeline: **fetch** (`RestCountriesApi`) → **transform** (`transform.ts`) → **render**
(`csv.ts`, `markup.ts`) → **write** (`output.ts`). Keep `index.ts` as thin
orchestration; put new logic in a small focused module under `src/`.

## CLI, config, and output

- **`--subregion <name>`** (optional) — parsed with `node:util`'s `parseArgs` in
  `src/utils/subregion.ts`, validated case-insensitively against `VALID_SUBREGIONS`
  before any network call, and passed to the API as a server-side filter (not filtered
  locally). Invalid values throw and exit `1`.
- **Env vars** (loaded from `.env` by `src/config.ts` via `process.loadEnvFile()` — no
  `dotenv`): `API_KEY` (required), `API_BASE_URL` (default `https://api.restcountries.com`),
  `REGION` (default `Europe`).
- **Output filenames are scope-derived**, not fixed: `countries-<region>[-<subregion>].{html,csv}`
  lowercased with spaces as hyphens — e.g. `output/countries-europe.csv`,
  `output/countries-europe-northern-europe.html`.
- **HTML report** includes a title, generation timestamp, alternating rows, 32px flag
  images, plus inline client-side **search** and **sortable columns**. **CSV** has the
  same columns minus the flag.

## Tests

- Node's built-in runner only (`node:test` + `node:assert/strict`) — no test framework,
  consistent with the no-runtime-deps constraint.
- Tests live in `test/*.test.ts` and cover pure logic (transform fallbacks/formatting/
  sorting, CSV escaping, sub-region validation). No network calls in tests.

## Conventions & expectations

- **ESM only** (`"type": "module"`). Use `import`/`export`, not `require`.
- Import built-ins with the `node:` prefix (e.g. `import { writeFile } from "node:fs/promises"`).
- **Fail gracefully:** network errors, non-200 responses, missing/malformed fields, and
  file I/O errors must be caught. Log a meaningful message and `process.exit(1)`.
  Exit `0` only on full success.
- **Defensive data handling:** many API fields are optional (capital, currencies,
  languages). Always provide sensible fallbacks (e.g. `"N/A"`). Never assume shape.
- **CSV correctness:** escape fields containing commas/quotes/newlines by wrapping in
  double quotes and doubling internal quotes (RFC 4180, CRLF line endings).
- **HTML escaping:** every dynamic value rendered by `markup.ts` must be escaped.
- **JSDoc** on exported functions and non-obvious helpers, matching the existing style.
- Keep code clean and readable over clever — the brief scores on clarity, not tricks.

## The API

> The brief names the free `https://restcountries.com/v3.1/region/europe` endpoint,
> but this project targets the **authenticated v5 API** instead (per project owner).

- Base: `https://api.restcountries.com` (override via `API_BASE_URL`).
- Endpoint used: `GET /countries/v5?region=Europe&limit=<n>&offset=<n>`, plus optional
  `subregion=<name>` and `response_fields=<comma-list>`.
- Auth: `Authorization: Bearer <API_KEY>` (loaded from `.env`; required — the
  `RestCountriesApi` constructor throws if it is missing).
- Response is a **paginated envelope**, not a bare array:
  `{ data: { objects: Country[] }, meta: { total, count, offset, more, ... }, errors: [...] }`.
  The `RestCountriesApi` class in `src/RestCountriesApi.ts` walks pages via
  `offset` until `meta.more` is false.
- Client behaviour worth preserving: page size 100 with a `maxPages` guard, a 15s
  per-request timeout via `AbortSignal.timeout`, a 150ms pause between pages to stay
  under the burst limit (the API sends 429 without a usable restore-rate header), and
  non-200 handling that surfaces the API's own `errors[0].message`.
- **`response_fields`** — `index.ts` passes only the fields the report needs
  (`COUNTRY_FIELDS`), which trims each payload substantially. Add to that list when a
  new column is introduced, or the field will come back undefined.
- The v5 object shape has been verified against live data and is modelled by the
  `RestCountry` interface in `src/RestCountriesApi.ts`. Real v5 paths (differ from
  the brief's v3.1 paths): `names.common`, `capitals[0].name`, `population`,
  `languages[].name`, `currencies[0].name`/`.symbol`, `flag.url_png`. See the
  field-mapping table in `Brainstorm.md`.
- Extraction/transform lives in `src/utils/transform.ts`, which trims each country to a
  flat `CountryRow` (`name`, `capital`, `population`, `languages`, `currency`,
  `flagUrl`) and sorts by name case-/accent-insensitively.
