"use server";

import { type NextRequest } from "next/server";
import { buildUrl } from "@/utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = "http://api.geonames.org/searchJSON";
  const url = buildUrl(baseUrl, searchParams);
  const res = await fetch(`${url}&username=${process.env.GEONAMES_USERNAME}`);
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}
