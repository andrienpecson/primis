// AI-generated (authored with Claude): shapes for the REST Countries v5 API.
//
// This mirrors the v5 schema served from api.restcountries.com/countries/v5,
// which differs from the older v3.1 shape described in the brief (e.g. `names`
// not `name`, `capitals`/`languages`/`currencies` are arrays, `flag.url_png`).
//
// Every field is optional on purpose: the brief requires defensive handling of
// missing/malformed data, so nothing here is assumed to be present. Only the
// fields consumed by the report are modelled.

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
