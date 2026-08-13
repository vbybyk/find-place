import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  emptyListingFormValues,
  formValuesToPayload,
  listingToFormValues,
  resolveListingImageUrls,
} from "../listings";
import { IListing, IListingFormImage, IListingFormValues } from "@/types/listings";

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

const listing = {
  id: 42,
  user_id: 7,
  title: "Old title",
  description: "Old desc",
  price: 9000,
  discount: 10,
  type: 1,
  house_type: 2,
  country: "PH",
  place_id: "ChIJ_old",
  city_label: "Cebu",
  admin_name1: "Cebu",
  barangay: null,
  postal_code: "6000",
  address_line1: "Old addr",
  address_line2: "",
  latitude: 10.3,
  longitude: 123.9,
  rooms_number: 2,
  bathrooms: 1,
  parking: 0,
  furnished: 3,
  floors_number: null,
  floor: null,
  area_total: 55,
  amenities: ["wifi"],
  images: ["https://cdn/a.jpg"],
  created_at: "2026-01-01",
} as IListing;

describe("emptyListingFormValues", () => {
  it("returns a PH listing with empty nested location", () => {
    expect(emptyListingFormValues()).toMatchObject({
      userId: 0,
      title: "",
      type: 0,
      houseType: 0,
      roomsNumber: 0,
      amenities: [],
      images: [],
      location: { country: "PH", city: "", placeId: null, latitude: null },
    });
  });
});

describe("listingToFormValues", () => {
  it("flattens API snake_case into the nested form shape", () => {
    expect(listingToFormValues(listing)).toMatchObject({
      userId: 7,
      title: "Old title",
      price: 9000,
      discount: 10,
      type: 1,
      houseType: 2,
      furnished: 3,
      roomsNumber: 2,
      bathrooms: 1,
      areaTotal: 55,
      amenities: ["wifi"],
      images: [{ id: "https://cdn/a.jpg", kind: "remote", url: "https://cdn/a.jpg" }],
      location: {
        placeId: "ChIJ_old",
        country: "PH",
        city: "Cebu",
        admin1: "Cebu",
        barangay: "",
        postalCode: "6000",
        addressLine1: "Old addr",
        latitude: 10.3,
        longitude: 123.9,
      },
    });
  });

  it("defaults missing amenities, images and unknown types", () => {
    const values = listingToFormValues({
      ...listing,
      type: 99,
      house_type: 99,
      amenities: null,
      images: null,
      furnished: null,
      rooms_number: null,
    });
    expect(values.type).toBe(0);
    expect(values.houseType).toBe(0);
    expect(values.amenities).toEqual([]);
    expect(values.images).toEqual([]);
    expect(values.furnished).toBe(0);
    expect(values.roomsNumber).toBe(0);
  });
});

describe("formValuesToPayload", () => {
  it("maps form values to a flat snake_case payload with the given image urls", () => {
    const data: IListingFormValues = listingToFormValues(listing);
    expect(formValuesToPayload(data, ["https://cdn/a.jpg", "https://cdn/b.jpg"])).toMatchObject({
      user_id: 1,
      title: "Old title",
      type: 1,
      house_type: 2,
      price: 9000,
      discount: 10,
      furnished: 3,
      rooms_number: 2,
      bathrooms: 1,
      parking: null,
      area_total: 55,
      amenities: ["wifi"],
      country: "PH",
      place_id: "ChIJ_old",
      city_label: "Cebu",
      postal_code: "6000",
      address_line1: "Old addr",
      latitude: 10.3,
      longitude: 123.9,
      images: ["https://cdn/a.jpg", "https://cdn/b.jpg"],
    });
  });
});

