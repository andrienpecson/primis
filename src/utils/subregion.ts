// AI-generated (authored with Claude): sub-region CLI parsing and validation.
import { parseArgs } from "node:util";

/** Valid sub-regions within Europe, used to validate the --subregion flag. */
export const VALID_SUBREGIONS = [
  "Central Europe",
  "Eastern Europe",
  "Northern Europe",
  "Southeast Europe",
  "Southern Europe",
  "Western Europe",
];

/**
 * Validates a sub-region against the known list (case-insensitively) and
 * returns its canonical form. Throws with a helpful message when invalid.
 */
export function resolveSubregion(input: string): string {
  const match = VALID_SUBREGIONS.find(
    (valid) => valid.toLowerCase() === input.toLowerCase()
  );
  if (!match) {
    throw new Error(
      `Invalid sub-region "${input}". Valid options: ${VALID_SUBREGIONS.join(", ")}.`
    );
  }
  return match;
};

/**
 * Reads and validates the `--subregion` CLI flag.
 * @returns the canonical sub-region name, or undefined when the flag is absent.
 */
export function getSubregionArg(): string | undefined {
  const { values } = parseArgs({
    options: {
      subregion: { type: "string" },
    },
  });
  const raw = values.subregion?.trim();
  return raw ? resolveSubregion(raw) : undefined;
};