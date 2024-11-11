"use server";

import { type NextRequest } from "next/server";

function buildUrl(baseUrl: string, searchParams: URLSearchParams): string {
  const url = new URL(baseUrl);
  searchParams.forEach((value, key) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = "http://api.geonames.org/searchJSON";
  const url = buildUrl(baseUrl, searchParams);
  console.log("url", url);
  const res = await fetch(`${url}&username=${process.env.GEONAMES_USERNAME}`);
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}