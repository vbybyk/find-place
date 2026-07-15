import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "../route";

const makeRequest = (params: Record<string, string>) =>
  ({ nextUrl: { searchParams: new URLSearchParams(params) } } as unknown as NextRequest);

beforeEach(() => vi.unstubAllGlobals());

describe("GET /api/listings", () => {
  it("proxies to geonames with the incoming params + username and returns its json", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ geonames: [{ name: "Manila" }] }) });
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(makeRequest({ maxRows: "10", country: "PH", name_startsWith: "man" }));

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("http://api.geonames.org/searchJSON");
    expect(calledUrl).toContain("maxRows=10");
    expect(calledUrl).toContain("country=PH");
    expect(calledUrl).toContain("username=");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(await res.json()).toEqual({ geonames: [{ name: "Manila" }] });
  });
});
