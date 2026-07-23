// AI-generated (authored with Claude): shapes for the REST Countries response.
//
// Every field is optional on purpose: the brief requires defensive handling of
// missing/malformed data, so nothing here is assumed to be present.

export interface RestCountry {
  name?: {
    common?: string;
    official?: string;
  };
  capital?: string[];
  population?: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name?: string; symbol?: string }>;
  flags?: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  region?: string;
  subregion?: string;
}
