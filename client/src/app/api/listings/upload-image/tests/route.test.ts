import { describe, it, expect, vi } from "vitest";
import type { NextRequest } from "next/server";

const uploadStream = vi.fn();
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: { upload_stream: (...a: unknown[]) => uploadStream(...a) },
  },
}));

import { POST } from "../route";

// Return a minimal formData whose get("file") yields the given value. jsdom's
// Blob lacks arrayBuffer(), so we patch it on the instance we hand back.
const requestWith = (file: unknown) =>
  ({ formData: async () => ({ get: (k: string) => (k === "file" ? file : null) }) } as unknown as NextRequest);

describe("POST /api/listings/upload-image", () => {
  it("returns 400 when no file is present", async () => {
    const res = await POST(requestWith(null));
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("File not found");
  });

  it("uploads the file buffer to cloudinary and returns the url", async () => {
    uploadStream.mockImplementation((_opts: unknown, cb: (e: unknown, r: unknown) => void) => {
      // Cloudinary returns both; we use the https secure_url.
      cb(null, {
        url: "http://res.cloudinary.com/listings/x.jpg",
        secure_url: "https://res.cloudinary.com/listings/x.jpg",
      });
      return { write: vi.fn(), end: vi.fn() };
    });

    const blob = new Blob(["binary"], { type: "image/jpeg" });
    blob.arrayBuffer = async () => new Uint8Array([1, 2, 3]).buffer;

    const res = await POST(requestWith(blob));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("https://res.cloudinary.com/listings/x.jpg");
    // the public_id is namespaced under "listings/"
    expect(uploadStream.mock.calls[0][0]).toMatchObject({ public_id: expect.stringContaining("listings/") });
  });
});
