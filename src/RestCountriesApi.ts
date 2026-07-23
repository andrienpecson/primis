import { setTimeout as sleep } from "node:timers/promises";
import { API_BASE_URL, API_KEY } from "./config.ts";

export interface RestCountry {
  names?: {
    common?: string;
    official?: string;
  };
  capitals?: Array<{ name?: string }>;
  population?: number;
  languages?: Array<{ name?: string }>;
  currencies?: Array<{ name?: string; symbol?: string; code?: string }>;
  flag?: {
    url_png?: string;
    url_svg?: string;
    emoji?: string;
  };
  region?: string;
  subregion?: string;
}

interface CountriesPage {
  data?: { objects?: RestCountry[] };
  meta?: {
    total?: number;
    count?: number;
    limit?: number;
    offset?: number;
    more?: boolean;
  };
  errors?: Array<{ message?: string; code?: string }>;
};

export interface RestCountriesApiOptions {
  apiKey?: string;
  baseUrl?: string;
};

export default class RestCountriesApi {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  private readonly endpointPath = "/countries/v5";
  private readonly pageSize = 100;
  private readonly maxPages = 100;
  private readonly requestTimeoutMs = 15_000;
  private readonly interPageDelayMs = 150;

  public constructor(options: RestCountriesApiOptions = {}) {
    const apiKey = options.apiKey ?? API_KEY;

    if (!apiKey) {
      throw new Error(
        "API_KEY is not set. Add it to your .env file (see .env.example)."
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl ?? API_BASE_URL;
  }

  public async fetchCountriesByRegion(
    region: string,
    fields: string[] = [],
    subregion?: string
  ): Promise<RestCountry[]> {
    const countries: RestCountry[] = [];
    let offset = 0;

    for (let page = 0; page < this.maxPages; page++) {
      const params = new URLSearchParams({
        region,
        limit: String(this.pageSize),
        offset: String(offset),
      });

      if (subregion) {
        params.set("subregion", subregion);
      }

      if (fields.length > 0) {
        params.set("response_fields", fields.join(","));
      }

      const { data, meta } = await this.sendRequest(params);
      const objects = data?.objects;

      if (!Array.isArray(objects)) {
        throw new Error(
          `Unexpected response for region "${region}": missing data.objects array.`
        );
      }

      countries.push(...objects);

      if (meta?.more !== true || objects.length === 0) {
        break;
      }
      offset += objects.length;

      // Prevent from encountering error 429.
      // API does not provide a restore rate in the response header.
      await sleep(this.interPageDelayMs);
    }

    return countries;
  }

  private async sendRequest(searchParams: URLSearchParams): Promise<CountriesPage> {
    const url = new URL(this.endpointPath, this.baseUrl);
    url.search = searchParams.toString();

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(this.requestTimeoutMs),
      });
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause);
      throw new Error(`Network error while fetching ${url.href}: ${reason}`);
    }

    const body = (await this.safeJson(response)) as CountriesPage | undefined;

    if (!response.ok) {
      const apiMessage = body?.errors?.[0]?.message;
      const detail = apiMessage ? ` — ${apiMessage}` : "";
      throw new Error(
        `Request to ${url.href} failed with HTTP ${response.status} ${response.statusText}${detail}.`
      );
    }

    return body ?? {};
  }

  private async safeJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
}
