import { describe, it, expect, vi, beforeEach } from "vitest";

// revalidatePath is a Next server-only helper; stub it so the actions run in jsdom.
const { revalidatePath, uploadBufferToCloudinary } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  uploadBufferToCloudinary: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));
vi.mock("@/lib/cloudinary", () => ({
  uploadBufferToCloudinary: (...args: unknown[]) => uploadBufferToCloudinary(...args),
}));

import {
  getListings,
  getListingById,
  createListing,
  updateListing,
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

describe("uploadImage", () => {
  it("uploads the file buffer to cloudinary and returns the secure url", async () => {
    uploadBufferToCloudinary.mockResolvedValue("https://res.cloudinary.com/listings/x.jpg");

    const file = new File(["binary"], "photo.jpg", { type: "image/jpeg" });
    // jsdom's File/Blob lacks arrayBuffer(); patch like the old route test.
    file.arrayBuffer = async () => new Uint8Array([1, 2, 3]).buffer;

    const fd = new FormData();
    fd.append("file", file);

    expect(await uploadImage(fd)).toBe("https://res.cloudinary.com/listings/x.jpg");
    expect(uploadBufferToCloudinary).toHaveBeenCalledWith(expect.any(Buffer), "listings");
  });

  it("rejects when no file is present", async () => {
    await expect(uploadImage(new FormData())).rejects.toThrow("File not found");
    expect(uploadBufferToCloudinary).not.toHaveBeenCalled();
  });

  it("rejects files larger than 10 MB", async () => {
    const fd = new FormData();
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "huge.jpg", { type: "image/jpeg" });
    fd.append("file", big);

    await expect(uploadImage(fd)).rejects.toThrow("Each photo must be 10 MB or smaller");
    expect(uploadBufferToCloudinary).not.toHaveBeenCalled();
  });
});
