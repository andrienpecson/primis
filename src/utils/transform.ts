import type { RestCountry } from "../RestCountriesApi.ts";

export interface CountryRow {
  name: string;
  capital: string;
  population: string;
  languages: string;
  currency: string;
  flagUrl: string;
};

const NOT_AVAILABLE = "N/A";

/**
 * Processes raw countries into display-ready rows, sorted alphabetically
 * (case- and accent-insensitively) by country name.
 *
 * @param countries Raw country objects from the API.
 * @returns Sorted, flattened rows.
 */
export function processCountries(countries: RestCountry[]): CountryRow[] {
  return countries
    .map(toCountryRow)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
};

/** Maps one raw country to a flat, display-ready row. */
function toCountryRow(country: RestCountry): CountryRow {
  return {
    name: getName(country),
    capital: getCapital(country),
    population: getPopulation(country),
    languages: getLanguages(country),
    currency: getCurrency(country),
    flagUrl: getFlagUrl(country),
  };
};

/** Returns the common name, or "N/A" when absent. */
function getName(country: RestCountry): string {
  return country.names?.common || NOT_AVAILABLE;
};

/** Returns the first capital's name, or "N/A" when absent. */
function getCapital(country: RestCountry): string {
  const [capital] = asArray(country.capitals);
  return capital?.name || NOT_AVAILABLE;
};

/** Returns the population with thousands separators, or "N/A" when not a finite number. */
function getPopulation(country: RestCountry): string {
  const population = country.population;

  if (typeof population !== "number" || !Number.isFinite(population)) {
    return NOT_AVAILABLE;
  }

  return population.toLocaleString("en-US");
};

/** Returns all language names joined by ", ", or "N/A" when none are present. */
function getLanguages(country: RestCountry): string {
  const names = asArray(country.languages)
    .map((language) => language?.name)
    .filter((name) => name !== undefined);

  return names.length > 0 ? names.join(", ") : NOT_AVAILABLE;
};

/** Returns the first currency as "Name (Symbol)", or "N/A" when either part is missing. */
function getCurrency(country: RestCountry): string {
  const currency = asArray(country.currencies)[0];

  if (currency?.name && currency.symbol) {
    const { name, symbol } = currency;
    return `${name} (${symbol})`;
  }

  return NOT_AVAILABLE;
};

/** Returns the PNG flag URL, or an empty string when absent. */
function getFlagUrl(country: RestCountry): string {
  return country.flag?.url_png || "";
};

/** Narrows a possibly-undefined value to an array, defaulting to []. */
function asArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
};