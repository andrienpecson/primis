import RestCountriesApi from "./src/RestCountriesApi.ts";
import { REGION } from "./src/config.ts";

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

const DEFAULT_REGION = "Europe";
const COUNTRY_FIELDS = [
  "names.common",
  "capitals.name",
  "population",
  "languages.name",
  "currencies.name",
  "currencies.symbol",
  "flag.url_png",
];

async function main(): Promise<void> {
  const region = REGION ?? DEFAULT_REGION;
  const api = new RestCountriesApi();
  const countries = await api.fetchCountriesByRegion(region, COUNTRY_FIELDS);
  console.log(`Fetched ${countries.length} countries from region "${region}".`);
}

main()
  .then(() => process.exit(EXIT_SUCCESS))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(EXIT_FAILURE);
  });
