import RestCountriesApi from "./src/RestCountriesApi.ts";
import { processCountries } from "./src/utils/transform.ts";
import { toCsv } from "./src/utils/csv.ts";
import { toHtml } from "./src/utils/markup.ts";
import { writeOutputFile, OUTPUT_DIR } from "./src/utils/output.ts";
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
  const rows = processCountries(countries);

  const written: string[] = [];
  written.push(await writeOutputFile("countries.html", toHtml(rows)));
  written.push(await writeOutputFile("countries.csv", toCsv(rows)));

  console.log(`\nFetched ${rows.length} countries from region "${region}".`);
  console.log(`Files written to ${OUTPUT_DIR}/:`);
  for (const filePath of written) {
    console.log(`  - ${filePath}`);
  }
}

main()
  .then(() => process.exit(EXIT_SUCCESS))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(EXIT_FAILURE);
  });
