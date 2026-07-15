import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted so these exist before the hoisted vi.mock factories reference them.
const { Listing, connectToDatabase, revalidatePath } = vi.hoisted(() => ({
  Listing: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
  connectToDatabase: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/database", () => ({ connectToDatabase: () => connectToDatabase() }));
vi.mock("@/lib/database/models/listing", () => ({ default: Listing }));
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
  connectToDatabase.mockResolvedValue(undefined);
});

describe("getListings", () => {
  it("connects and returns the query results", async () => {
    Listing.find.mockResolvedValue([{ title: "a" }]);
    const result = await getListings({ type: 1 } as never);

    expect(connectToDatabase).toHaveBeenCalledTimes(1);
    expect(Listing.find).toHaveBeenCalledWith({ type: 1 });
    expect(result).toEqual([{ title: "a" }]);
  });

  it("swallows errors and returns undefined", async () => {
    Listing.find.mockRejectedValue(new Error("db down"));
    expect(await getListings({} as never)).toBeUndefined();
  });
});

describe("getListingById", () => {
  it("returns a plain serialized document", async () => {
    Listing.findById.mockResolvedValue({ _id: "1", title: "a" });
    const result = await getListingById("1");
    expect(Listing.findById).toHaveBeenCalledWith("1");
    expect(result).toMatchObject({ _id: "1", title: "a" });
  });
});

describe("createListing", () => {
  it("creates, revalidates the path and returns the serialized doc", async () => {
    Listing.create.mockResolvedValue({ _id: "9", title: "new" });
    const result = await createListing({ title: "new" } as never, "/listings");

    expect(Listing.create).toHaveBeenCalledWith({ title: "new" });
    expect(revalidatePath).toHaveBeenCalledWith("/listings");
    expect(result).toEqual({ _id: "9", title: "new" });
  });
});

describe("updateListing", () => {
  it("updates by id with { new: true }, revalidates and serializes", async () => {
    Listing.findByIdAndUpdate.mockResolvedValue({ _id: "9", title: "upd" });
    const result = await updateListing("9", { title: "upd" } as never, "/listings/9");

    expect(Listing.findByIdAndUpdate).toHaveBeenCalledWith("9", { title: "upd" }, { new: true });
    expect(revalidatePath).toHaveBeenCalledWith("/listings/9");
    expect(result).toEqual({ _id: "9", title: "upd" });
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
