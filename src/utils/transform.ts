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

export function processCountries(countries: RestCountry[]): CountryRow[] {
  return countries
    .map(toCountryRow)
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
};

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

function getName(country: RestCountry): string {
  return country.names?.common || NOT_AVAILABLE;
};

function getCapital(country: RestCountry): string {
  const [capital] = asArray(country.capitals);
  return capital?.name || NOT_AVAILABLE;
};

function getPopulation(country: RestCountry): string {
  const population = country.population;

  if (typeof population !== "number" || !Number.isFinite(population)) {
    return NOT_AVAILABLE;
  }

  return population.toLocaleString("en-US");
};

function getLanguages(country: RestCountry): string {
  const names = asArray(country.languages)
    .map((language) => language?.name)
    .filter((name) => name !== undefined);

  return names.length > 0 ? names.join(", ") : NOT_AVAILABLE;
};

function getCurrency(country: RestCountry): string {
  const currency = asArray(country.currencies)[0];

  if (currency?.name && currency.symbol) {
    const { name, symbol } = currency;
    return `${name} (${symbol})`;
  }

  return NOT_AVAILABLE;
};

function getFlagUrl(country: RestCountry): string {
  return country.flag?.url_png || "";
};

function asArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
};