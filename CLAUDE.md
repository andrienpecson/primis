# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A Node.js command-line tool (written in TypeScript) that fetches European country
data from the **REST Countries API**, transforms it, and generates two report files:
a styled **HTML** table and a **CSV**. Built as a technical assessment for Primis CX.

The full, authoritative requirements live in [Brainstorm.md](Brainstorm.md) — a
checklist derived directly from the assessment brief. **Treat `Brainstorm.md` as the
source of truth for scope**, and tick items off there as they are completed.

## Hard constraints (from the brief — do not violate)

- **No third-party *runtime* dependencies.** Node.js built-in modules only.
  - Exception, already decided: `typescript` and `@types/node` are allowed as
    **dev-only** deps (needed for TS itself). They never ship or run at runtime.
- **Use the native `fetch` API only** — no Axios or other HTTP libraries.
- **Node.js 20 LTS or above.** This project targets **23.6+ / Node 24** specifically,
  to run TypeScript natively (see below).
- Any AI-generated / AI-assisted lines must be marked with a comment (e.g. `// AI-generated`).
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
| `npm run typecheck` | Type-check with `tsc --noEmit`. Run this before committing. |
| `npm install` | Install dev-only tooling (`typescript`, `@types/node`). |

## Project layout

```
index.ts          # CLI entry point: orchestration, exit codes, top-level error handling
tsconfig.json     # Type-check + native-strip config (noEmit, erasableSyntaxOnly)
package.json      # ESM ("type":"module"), engines >=23.6, dev-only deps
Brainstorm.md     # Requirements checklist (source of truth for scope)
output/           # Generated countries.html + countries.csv (git-ignored)
```

As the code grows, prefer small focused modules under a `src/` directory (e.g.
`src/api.ts`, `src/transform.ts`, `src/html.ts`, `src/csv.ts`) imported by `index.ts`.
Keep `index.ts` as thin orchestration.

## Conventions & expectations

- **ESM only** (`"type": "module"`). Use `import`/`export`, not `require`.
- Import built-ins with the `node:` prefix (e.g. `import { writeFile } from "node:fs/promises"`).
- **Fail gracefully:** network errors, non-200 responses, missing/malformed fields, and
  file I/O errors must be caught. Log a meaningful message and `process.exit(1)`.
  Exit `0` only on full success.
- **Defensive data handling:** many API fields are optional (capital, currencies,
  languages). Always provide sensible fallbacks (e.g. `"N/A"`). Never assume shape.
- **CSV correctness:** escape fields containing commas/quotes/newlines by wrapping in
  double quotes and doubling internal quotes.
- Keep code clean and readable over clever — the brief scores on clarity, not tricks.

## The API

> The brief names the free `https://restcountries.com/v3.1/region/europe` endpoint,
> but this project targets the **authenticated v5 API** instead (per project owner).

- Base: `https://api.restcountries.com` (override via `API_BASE_URL`).
- Endpoint used: `GET /countries/v5?region=Europe&limit=<n>&offset=<n>`.
- Auth: `Authorization: Bearer <API_KEY>` (loaded from `.env`; required).
- Response is a **paginated envelope**, not a bare array:
  `{ data: { objects: Country[] }, meta: { total, count, offset, more, ... } }`.
  The `RestCountriesApi` class in `src/RestCountriesApi.ts` walks pages via
  `offset` until `meta.more` is false.
- Fields consumed: `name.common`, `capital[0]`, `population`, `languages`,
  `currencies`, `flags.png`. See the field-mapping table in `Brainstorm.md`.
  The v5 object shape has been verified against live data and is modelled by the
  `RestCountry` interface in `src/RestCountriesApi.ts`. Real v5 paths (differ from
  the brief's v3.1 paths): `names.common`, `capitals[0].name`, `population`,
  `languages[].name`, `currencies[0].name`/`.symbol`, `flag.url_png`.
  Extraction/transform lives in `src/utils/transform.ts`, which trims each
  country to a flat `CountryRow`.
