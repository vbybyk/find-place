import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateListingForm from "../CreateListingForm";
import type { IListing } from "@/types/listings";

const createListing = vi.fn();
const updateListing = vi.fn();
const push = vi.fn();

vi.mock("@/lib/actions/listings", () => ({
  createListing: (...a: unknown[]) => createListing(...a),
  updateListing: (...a: unknown[]) => updateListing(...a),
  uploadImage: vi.fn(),
}));

// LocationPicker pulls in the Google Maps SDK — stub it so the form renders in jsdom.
vi.mock("@/features/listings/LocationPicker", () => ({
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const setInput = async (name: string, value: string) => {
  const el = document.querySelector(`[name="${name}"]`) as HTMLElement;
  await userEvent.clear(el);
  await userEvent.type(el, value);
};

describe("CreateListingForm", () => {
  beforeEach(() => {
    createListing.mockReset();
    updateListing.mockReset();
    push.mockReset();
  });

  it("renders the create form with a Submit button", () => {
    render(<CreateListingForm />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("submits a created listing as a flat snake_case payload, then redirects", async () => {
    createListing.mockResolvedValue({});
    render(<CreateListingForm />);

    await setInput("title", "Nice flat");
    await setInput("price", "15000");
    await setInput("location.addressLine1", "1 Rizal St");

    // bedrooms is now a stepper (default 0 → click + three times)
    const incBedrooms = screen.getByRole("button", { name: /increase bedrooms/i });
    await userEvent.click(incBedrooms);
    await userEvent.click(incBedrooms);
    await userEvent.click(incBedrooms);

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(createListing).toHaveBeenCalledTimes(1));
    const [payload, path] = createListing.mock.calls[0];
    expect(payload).toMatchObject({
      title: "Nice flat",
      user_id: 1,
      price: 15000,
      rooms_number: 3,
      address_line1: "1 Rizal St",
      country: "PH",
    });
    expect(path).toBe("/listings");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/listings"));
  });

  it("hydrates from the listing prop and updates on submit in edit mode", async () => {
    const listing = {
      id: 42,
      user_id: 7,
      title: "Old title",
      description: "Old desc",
      price: 9000,
      rooms_number: 2,
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

    updateListing.mockResolvedValue({});
    render(<CreateListingForm listing={listing} type="edit" />);

    // hydration happens in an effect via setValue
    await waitFor(() =>
      expect(document.querySelector('[name="title"]')).toHaveValue("Old title")
    );
    expect(document.querySelector('[name="price"]')).toHaveValue("9000");

    await userEvent.click(screen.getByRole("button", { name: /update/i }));

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
    expect(createListing).not.toHaveBeenCalled();
  });
});
