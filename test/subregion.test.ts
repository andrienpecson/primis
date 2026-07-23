// AI-generated (authored with Claude): unit tests for sub-region validation.

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSubregion, VALID_SUBREGIONS } from "../src/utils/subregion.ts";

test("returns the canonical form for an exact match", () => {
  assert.equal(resolveSubregion("Northern Europe"), "Northern Europe");
});

test("matches case-insensitively and returns canonical casing", () => {
  assert.equal(resolveSubregion("northern europe"), "Northern Europe");
  assert.equal(resolveSubregion("WESTERN EUROPE"), "Western Europe");
});

test("accepts every valid sub-region", () => {
  for (const subregion of VALID_SUBREGIONS) {
    assert.equal(resolveSubregion(subregion), subregion);
  }
});

test("throws for an unknown sub-region", () => {
  assert.throws(() => resolveSubregion("Nowhere"), /Invalid sub-region "Nowhere"/);
});

test("error message lists the valid options", () => {
  assert.throws(() => resolveSubregion("xyz"), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.ok(error.message.includes("Northern Europe"));
    return true;
  });
});
