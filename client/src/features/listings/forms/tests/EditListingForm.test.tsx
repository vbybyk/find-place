import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditListingForm from "../EditListingForm";
import type { IListing } from "@/types/listings";

const updateListing = vi.fn();

vi.mock("@/lib/actions/listings", () => ({
  updateListing: (...a: unknown[]) => updateListing(...a),
  uploadImage: vi.fn(),
}));

vi.mock("@/features/listings/LocationPicker", () => ({
  default: () => null,
}));

const listing = {
  id: 42,
  user_id: 7,
  title: "Old title",
  description: "Old desc",
  price: 9000,
  discount: 0,
  rooms_number: 2,
  bathrooms: 1,
  parking: 0,
  furnished: 0,
  area_total: 0,
  amenities: [],
  type: 1,
  house_type: 2,
  images: [],
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
} as unknown as IListing;

describe("EditListingForm", () => {
  beforeEach(() => {
    updateListing.mockReset();
  });

  it("renders Details, Location and Photos tabs and hydrates the listing", () => {
    render(<EditListingForm listing={listing} />);

    expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Location" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Photos" })).toHaveAttribute("aria-selected", "false");

    expect(document.querySelector('[name="title"]')).toHaveValue("Old title");
    expect(document.querySelector('[name="price"]')).toHaveValue("9000");
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("switches tabs without unmounting the location panel", async () => {
    render(<EditListingForm listing={listing} />);

    const detailsPanel = document.getElementById("panel-details");
    const locationPanel = document.getElementById("panel-location");
    const photosPanel = document.getElementById("panel-photos");

    expect(detailsPanel).not.toHaveAttribute("hidden");
    expect(locationPanel).toHaveAttribute("hidden");
    expect(photosPanel).toHaveAttribute("hidden");

    await userEvent.click(screen.getByRole("tab", { name: "Location" }));
    expect(screen.getByRole("tab", { name: "Location" })).toHaveAttribute("aria-selected", "true");
    expect(locationPanel).not.toHaveAttribute("hidden");
    expect(detailsPanel).toHaveAttribute("hidden");
    expect(document.querySelector('[name="location.city"]')).toHaveValue("Cebu");

    await userEvent.click(screen.getByRole("tab", { name: "Photos" }));
    expect(screen.getByRole("tab", { name: "Photos" })).toHaveAttribute("aria-selected", "true");
    expect(photosPanel).not.toHaveAttribute("hidden");
    expect(locationPanel).toHaveAttribute("hidden");
    expect(document.getElementById("panel-location")).toBeInTheDocument();
  });

  it("saves the listing as a flat snake_case payload", async () => {
    updateListing.mockResolvedValue({});
    render(<EditListingForm listing={listing} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(updateListing).toHaveBeenCalledTimes(1));
    const [id, payload, path] = updateListing.mock.calls[0];
    expect(id).toBe(42);
    expect(payload).toMatchObject({
      title: "Old title",
      user_id: 1,
      price: 9000,
      rooms_number: 2,
      place_id: "ChIJ_old",
      city_label: "Cebu",
      postal_code: "6000",
    });
    expect(path).toBe("/listings/42");
  });

  it("discards unsaved edits when switching tabs", async () => {
    render(<EditListingForm listing={listing} />);

    await userEvent.click(screen.getByRole("tab", { name: "Location" }));
    const city = document.querySelector('[name="location.city"]') as HTMLElement;
    await userEvent.clear(city);
    await userEvent.type(city, "Manila");
    expect(city).toHaveValue("Manila");

    await userEvent.click(screen.getByRole("tab", { name: "Details" }));
    await userEvent.click(screen.getByRole("tab", { name: "Location" }));
    expect(document.querySelector('[name="location.city"]')).toHaveValue("Cebu");
  });
});
