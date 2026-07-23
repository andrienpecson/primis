import RestCountriesApi from "./src/RestCountriesApi.ts";
import { processCountries } from "./src/utils/transform.ts";
import { toCsv } from "./src/utils/csv.ts";
import { toHtml } from "./src/utils/markup.ts";
import { writeOutputFile, OUTPUT_DIR } from "./src/utils/output.ts";
import { getSubregionArg } from "./src/utils/subregion.ts";
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
  const subregion = getSubregionArg();

  const region = REGION ?? DEFAULT_REGION;
  const api = new RestCountriesApi();

  const countries = await api.fetchCountriesByRegion(region, COUNTRY_FIELDS, subregion);
  const rows = processCountries(countries);

  const written: string[] = [];
  const fileName = `countries-${region}${(subregion) ? `-${subregion}` : ""}`.trim().replace(/\s+/g, "-").toLowerCase();
  written.push(await writeOutputFile(`${fileName}.html`, toHtml(rows)));
  written.push(await writeOutputFile(`${fileName}.csv`, toCsv(rows)));

  const scope = subregion ? `sub-region "${subregion}"` : `region "${region}"`;
  console.log(`\nFetched ${rows.length} countries from ${scope}.`);
  console.log(`Files written to ${OUTPUT_DIR}/:`);
  for (const filePath of written) {
    console.log(`  - ${filePath}`);
  }
};

main()
  .then(() => process.exit(EXIT_SUCCESS))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(EXIT_FAILURE);
  });
