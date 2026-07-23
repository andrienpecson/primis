// AI-generated (authored with Claude): unit tests for the transform module.

import { test } from "node:test";
import assert from "node:assert/strict";
import { processCountries } from "../src/utils/transform.ts";
import type { RestCountry } from "../src/RestCountriesApi.ts";

/** Builds a single processed row from one country. */
function rowOf(country: RestCountry) {
  return processCountries([country])[0]!;
}

test("extracts the common name", () => {
  assert.equal(rowOf({ names: { common: "Spain" } }).name, "Spain");
});

test("falls back to N/A for a missing name", () => {
  assert.equal(rowOf({}).name, "N/A");
});

test("extracts the first capital's name", () => {
  const row = rowOf({ capitals: [{ name: "Madrid" }, { name: "Other" }] });
  assert.equal(row.capital, "Madrid");
});

test("falls back to N/A when there is no capital", () => {
  assert.equal(rowOf({ capitals: [] }).capital, "N/A");
  assert.equal(rowOf({}).capital, "N/A");
});

test("formats population with thousands separators", () => {
  assert.equal(rowOf({ population: 1234567 }).population, "1,234,567");
});

test("falls back to N/A for a non-numeric population", () => {
  assert.equal(rowOf({}).population, "N/A");
  assert.equal(rowOf({ population: Number.NaN }).population, "N/A");
});

test("joins multiple languages with a comma and space", () => {
  const row = rowOf({ languages: [{ name: "German" }, { name: "French" }] });
  assert.equal(row.languages, "German, French");
});

test("falls back to N/A when there are no languages", () => {
  assert.equal(rowOf({ languages: [] }).languages, "N/A");
});

test("formats the first currency as Name (Symbol)", () => {
  const row = rowOf({ currencies: [{ name: "Euro", symbol: "€" }] });
  assert.equal(row.currency, "Euro (€)");
});

test("falls back to N/A when currency name or symbol is missing", () => {
  assert.equal(rowOf({ currencies: [{ name: "Euro" }] }).currency, "N/A");
  assert.equal(rowOf({ currencies: [{ symbol: "€" }] }).currency, "N/A");
  assert.equal(rowOf({ currencies: [] }).currency, "N/A");
});

test("passes through the flag PNG url, or empty string when absent", () => {
  assert.equal(rowOf({ flag: { url_png: "http://x/al.png" } }).flagUrl, "http://x/al.png");
  assert.equal(rowOf({}).flagUrl, "");
});

test("sorts alphabetically, case- and accent-insensitively", () => {
  const rows = processCountries([
    { names: { common: "Belgium" } },
    { names: { common: "Åland Islands" } },
    { names: { common: "albania" } },
  ]);
  assert.deepEqual(rows.map((r) => r.name), ["Åland Islands", "albania", "Belgium"]);
});

test("handles malformed data defensively without throwing", () => {
  // Fields with wrong types should degrade to fallbacks, not crash.
  const malformed = {
    names: { common: undefined },
    capitals: undefined,
    languages: undefined,
    currencies: undefined,
    population: "not-a-number",
  } as unknown as RestCountry;

  const row = rowOf(malformed);
  assert.equal(row.name, "N/A");
  assert.equal(row.capital, "N/A");
  assert.equal(row.languages, "N/A");
  assert.equal(row.currency, "N/A");
  assert.equal(row.population, "N/A");
});
