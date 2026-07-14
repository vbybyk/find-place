import qs from "query-string";
import { UrlQueryParams, RemoveUrlQueryParams } from "../types";

export function buildUrl(baseUrl: string, searchParams: URLSearchParams): string {
  const url = new URL(baseUrl);
  searchParams.forEach((value, key) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}
