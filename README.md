# European Countries Report

A Node.js command-line tool that fetches European country data from the REST
Countries API, transforms it, and generates two reports: a styled **HTML** page
and a **CSV** file.

Written in TypeScript and run directly by Node — no build step and no
third-party runtime dependencies.

---

## Requirements

- **Node.js 23.6 or newer** (tested on v24). This is above the brief's stated
  minimum of Node 20 because the project runs TypeScript **natively** via Node's
  built-in type stripping — there is no compile step. Check with `node --version`.

## Setup

```bash
# 1. Install dev tooling (TypeScript + @types/node — used only for type-checking)
npm install

# 2. Create your environment file and add your API key
cp .env.example .env
# then edit .env and set:  API_KEY=your-api-key-here
```

## Usage

Run the tool:

```bash
node index.ts
# or
npm start
```

This fetches all European countries and writes the reports to `./output`, then
prints a summary such as:

```
Fetched 54 countries from region "Europe".
Files written to output/:
  - output/countries-europe.html
  - output/countries-europe.csv
```

### Filter by sub-region (optional)

Narrow the results to a single European sub-region with `--subregion`:

```bash
node index.ts --subregion "Northern Europe"
node index.ts --subregion "Western Europe"
```

Valid sub-regions: **Central Europe**, **Eastern Europe**, **Northern Europe**,
**Southeast Europe**, **Southern Europe**, **Western Europe**.
An invalid value fails fast (before any network call) and exits with code 1.

### Other commands

```bash
npm run typecheck                       # type-check without running
open output/countries-europe.html       # view the report (macOS)
```

## Output

Files are written to the `./output` directory, named by scope:

| Run | Files |
| --- | --- |
| Default (all Europe) | `countries-europe.html`, `countries-europe.csv` |
| `--subregion "Northern Europe"` | `countries-europe-northern-europe.html`, `.csv` |

- **HTML** — a styled, single table (title, heading, generation timestamp,
  alternating row colours, 32px flag images). It also includes two client-side
  extras: a **search box** and **sortable columns** (click a header).
- **CSV** — the same data minus the flag image, RFC 4180-escaped, with a header row.

The tool exits with code **0** on success and **1** on any failure (network
error, non-200 response, invalid input, or file I/O error).

## Environment variables

Loaded from `.env` via Node's built-in `process.loadEnvFile()` (no `dotenv`).

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `API_KEY` | **Yes** | — | Bearer token for the REST Countries API. |
| `API_BASE_URL` | No | `https://api.restcountries.com` | Override the API base URL. |
| `REGION` | No | `Europe` | Base region to fetch. |

## Project structure

```
index.ts                    # CLI entry point: args, orchestration, exit codes, summary
src/
  RestCountriesApi.ts       # API client + RestCountry type: fetch, auth, pagination
  config.ts                 # Loads .env and exposes configuration
  utils/
    transform.ts            # Extracts + normalises fields into display rows; sorts
    csv.ts                  # CSV serialisation (RFC 4180)
    markup.ts               # HTML document generation (+ search/sort scripts)
    output.ts               # Writes files into ./output
output/                     # Generated reports (git-ignored)
```

The pipeline is: **fetch** (`RestCountriesApi`) → **transform** (`transform.ts`)
→ **render** (`csv.ts`, `markup.ts`) → **write** (`output.ts`), coordinated by
`index.ts`.

---

## Decisions & notes

**API — the authenticated v5 endpoint, not the brief's v3.1.**
The brief references the free `https://restcountries.com/v3.1/region/europe`
endpoint, but this project targets the **authenticated v5 API**
(`https://api.restcountries.com/countries/v5?region=Europe`, `Authorization:
Bearer <API_KEY>`) as directed. This differs from v3.1 in three important ways,
all handled by the client:
- **Response envelope** — data comes back as `{ data: { objects: [...] }, meta: {...} }`
  rather than a bare array.
- **Pagination** — results are paged (`meta.more`/`offset`), so the client walks
  every page until all countries are collected.
- **Different schema** — fields are named differently from v3.1 (e.g. `names.common`,
  `capitals[0].name`, `languages[].name`, `currencies[0]`, `flag.url_png`). The
  extraction logic targets these v5 paths.

**Field selection via `response_fields`.**
The client requests only the fields the report needs using the API's
`response_fields` parameter, which trims each country payload by roughly 90% —
faster and lighter on the rate limit.

**TypeScript with native execution — no build step.**
Node 23.6+ runs `.ts` files directly by stripping types, so the tool runs with
`node index.ts` and no compilation. `tsconfig.json` enforces the erasable-only
syntax this requires (`erasableSyntaxOnly`) and is used purely for type-checking
(`npm run typecheck`, `noEmit`). This is the one deviation from the brief's
literal `node index.js`.

**No third-party runtime dependencies.**
The script uses only Node.js built-ins and the native `fetch` API — including
`node:util`'s `parseArgs` for CLI flags, `process.loadEnvFile()` for `.env`, and
`node:fs/promises` for output. CSV is produced by a small hand-written RFC 4180
serialiser rather than a library. `typescript` and `@types/node` are the only
dependencies and are **dev-only** (type-checking); they never run at runtime.

**Defensive data handling.**
Every field is treated as potentially missing or malformed. Extractors validate
types and fall back to `"N/A"` (or an empty flag), so a single bad record can
never break a report.

**Error handling.**
Network failures, non-200 responses (the API's own error message is surfaced),
and malformed JSON are all caught. The tool logs a meaningful message and exits
with code 1.

**Rate limiting.**
The v5 API throttles bursts (HTTP 429 with a `Retry-After` header). Because the
client fetches pages sequentially and paces successive requests with a short
delay, normal runs stay well under the limit.

**Sub-region filtering is server-side.**
`--subregion` is sent to the API as a filter rather than fetching
everything and filtering locally, and the input is validated against the known
list before any request is made.

**AI assistance.**
Per the brief, code written with AI assistance (Claude) is marked with an
`// AI-generated` comment at the top of the relevant module.
