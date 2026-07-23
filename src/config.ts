// AI-generated (authored with Claude): environment/configuration loading.

function loadEnvFileIfPresent(): void {
  try {
    // Reads ./.env relative to the current working directory.
    process.loadEnvFile();
  } catch {
    // .env is optional: the variable may already be set in the real environment
    // (e.g. in CI). Absence is only an error if API_KEY ends up missing below.
  }
}

loadEnvFileIfPresent();

/** Base URL for the REST Countries API. Overridable via env for testing. */
export const API_BASE_URL: string =
  process.env.API_BASE_URL ?? "https://api.restcountries.com";

/** Bearer token for the API. Required; validated at request time. */
export const API_KEY: string | undefined = process.env.API_KEY;

export const REGION: string | undefined = process.env.REGION; 
