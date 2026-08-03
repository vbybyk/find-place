import { describe, it, expect, vi, beforeEach } from "vitest";

// revalidatePath is a Next server-only helper; stub it so the actions run in jsdom.
const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  searchListingCity,
  uploadImage,
} from "../listings";

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("getListings", () => {
  it("builds the query string and returns the parsed listings", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [{ id: 1, title: "a" }] });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await getListings({ type: "1", houseType: "2", city: "Manila", userId: "7" });

    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("/listings?");
    expect(url).toContain("type=1");
    expect(url).toContain("house_type=2");
    expect(url).toContain("user_id=7");
    expect(url).toContain("city=Manila");
    expect(result).toEqual([{ id: 1, title: "a" }]);
  });

  it("returns an empty array on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    expect(await getListings()).toEqual([]);
  });
});

describe("getListingById", () => {
  it("returns the listing on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: 3, title: "a" }) })
    );
    expect(await getListingById("3")).toEqual({ id: 3, title: "a" });
  });

  it("returns null on 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await getListingById("999")).toBeNull();
  });
});

describe("createListing", () => {
  it("POSTs the payload, revalidates and returns the created listing", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 9, title: "new" }) });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await createListing(
      { user_id: 1, title: "new", description: "d", type: 1, house_type: 1 },
      "/listings"
    );

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/listings");
    expect((opts as RequestInit).method).toBe("POST");
    expect(revalidatePath).toHaveBeenCalledWith("/listings");
    expect(result).toEqual({ id: 9, title: "new" });
  });
});

describe("updateListing", () => {
  it("PATCHes by numeric id, revalidates and returns the updated listing", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ id: 9, title: "upd" }) });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await updateListing(9, { title: "upd" }, "/listings/9");

    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain("/listings/9");
    expect((opts as RequestInit).method).toBe("PATCH");
    expect(revalidatePath).toHaveBeenCalledWith("/listings/9");
    expect(result).toEqual({ id: 9, title: "upd" });
  });
});

describe("searchListingCity", () => {
  it("fetches geonames and formats them via formatGeoCities", async () => {
    const geonames = [
      { name: "Manila", geonameId: 1, adminName1: "NCR", population: 100, fclName: "city, village,..." },
      { name: "Zero", geonameId: 2, adminName1: "X", population: 0, fclName: "city, village,..." },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ geonames }) })
    );

    const result = await searchListingCity("man", "PH", "500");
    expect(result).toEqual([{ label: "Manila", id: 1, adminName1: "NCR" }]);
  });

  it("returns undefined on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await searchListingCity("x", "PH", "500")).toBeUndefined();
  });
});

describe("uploadImage", () => {
  it("returns parsed json when the response is json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ url: "https://cdn/x.jpg" }),
      })
    );

    const fd = new FormData();
    expect(await uploadImage(fd)).toEqual({ url: "https://cdn/x.jpg" });
  });

  it("falls back to text when the response is not json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "text/plain" },
        text: async () => "https://cdn/x.jpg",
      })
    );

    expect(await uploadImage(new FormData())).toBe("https://cdn/x.jpg");
  });
});
