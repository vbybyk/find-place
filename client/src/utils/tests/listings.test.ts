import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveListingImageUrls } from "../listings";
import { IListingFormImage } from "@/types/listings";

const uploadImage = vi.fn();
vi.mock("@/lib/actions/listings", () => ({
  uploadImage: (...args: unknown[]) => uploadImage(...args),
}));

describe("resolveListingImageUrls", () => {
  beforeEach(() => uploadImage.mockReset());

  it("passes remotes through and uploads locals in order", async () => {
    uploadImage.mockResolvedValueOnce("https://cdn/new.jpg");

    const images: IListingFormImage[] = [
      { id: "1", kind: "remote", url: "https://cdn/old.jpg" },
      {
        id: "2",
        kind: "local",
        previewUrl: "blob:x",
        file: new File(["x"], "photo.jpg", { type: "image/jpeg" }),
      },
    ];

    await expect(resolveListingImageUrls(images)).resolves.toEqual([
      "https://cdn/old.jpg",
      "https://cdn/new.jpg",
    ]);
    expect(uploadImage).toHaveBeenCalledTimes(1);
  });

  it("throws when a local upload returns no url", async () => {
    uploadImage.mockResolvedValueOnce(undefined);
    const images: IListingFormImage[] = [
      {
        id: "2",
        kind: "local",
        previewUrl: "blob:x",
        file: new File(["x"], "photo.jpg", { type: "image/jpeg" }),
      },
    ];
    await expect(resolveListingImageUrls(images)).rejects.toThrow("Failed to upload image");
  });
});
