import type { CountryRow } from "./transform.ts";

/** Column headers, in output order. The flag image is intentionally excluded. */
const HEADERS = ["Country Name", "Capital", "Population", "Languages", "Currency"];

/**
 * Serialises processed rows into a complete CSV document (RFC 4180): a header
 * row followed by one row per country, with CRLF line endings.
 *
 * @param rows Processed country rows.
 * @returns The CSV document as a string.
 */
export function toCsv(rows: CountryRow[]): string {
  const records = [HEADERS, ...rows.map(rowToFields)];
  return records.map(toCsvLine).join("\r\n") + "\r\n";
};

/** Maps a row to its ordered CSV fields (excluding the flag). */
function rowToFields(row: CountryRow): string[] {
  return [row.name, row.capital, row.population, row.languages, row.currency];
};

/** Joins one record's fields into a CSV line, escaping each field. */
function toCsvLine(fields: string[]): string {
  return fields.map(escapeField).join(",");
};

/**
 * Escapes a single field. If it contains a comma, double quote, or newline,
 * the field is wrapped in double quotes and any internal quotes are doubled.
 */
function escapeField(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};
