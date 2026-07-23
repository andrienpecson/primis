import type { CountryRow } from "./transform.ts";

const HEADERS = ["Country Name", "Capital", "Population", "Languages", "Currency"];

export function toCsv(rows: CountryRow[]): string {
  const records = [HEADERS, ...rows.map(rowToFields)];
  return records.map(toCsvLine).join("\r\n") + "\r\n";
};

function rowToFields(row: CountryRow): string[] {
  return [row.name, row.capital, row.population, row.languages, row.currency];
};

function toCsvLine(fields: string[]): string {
  return fields.map(escapeField).join(",");
};

function escapeField(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};
