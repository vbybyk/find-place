import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateListingForm from "../CreateListingForm";
import type { IListing } from "@/lib/database/models/listing";

const createListing = vi.fn();
const updateListing = vi.fn();
const searchListingCity = vi.fn();
const push = vi.fn();

vi.mock("@/lib/actions/listings", () => ({
  createListing: (...a: unknown[]) => createListing(...a),
  updateListing: (...a: unknown[]) => updateListing(...a),
  searchListingCity: (...a: unknown[]) => searchListingCity(...a),
  uploadImage: vi.fn(),
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
    searchListingCity.mockReset().mockResolvedValue([]);
    push.mockReset();
  });

  it("renders the create form with a Submit button", () => {
    render(<CreateListingForm />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("loads city options for the default country on mount", async () => {
    render(<CreateListingForm />);
    await waitFor(() => expect(searchListingCity).toHaveBeenCalledWith("", "PH", "500"));
  });

  it("submits a created listing with parsed numbers and userId, then redirects", async () => {
    createListing.mockResolvedValue({});
    render(<CreateListingForm />);

    await setInput("title", "Nice flat");
    await setInput("price", "15000");
    await setInput("roomsNumber", "3");
    await setInput("location.addressLine1", "1 Rizal St");

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(createListing).toHaveBeenCalledTimes(1));
    const [payload, path] = createListing.mock.calls[0];
    expect(payload).toMatchObject({
      title: "Nice flat",
      userId: 1,
      price: 15000,
      roomsNumber: 3,
      location: expect.objectContaining({ addressLine1: "1 Rizal St", country: "PH" }),
    });
    expect(path).toBe("/listings");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/listings"));
  });

  it("hydrates from the listing prop and updates on submit in edit mode", async () => {
    const listing = {
      _id: "abc123",
      userId: 7,
      title: "Old title",
      description: "Old desc",
      price: 9000,
      roomsNumber: 2,
      type: 1,
      houseType: 2,
      images: [],
      location: { country: "PH", city: null, addressLine1: "Old addr", addressLine2: "" },
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
    expect(id).toBe("abc123");
    expect(payload).toMatchObject({ title: "Old title", userId: 1, price: 9000, roomsNumber: 2 });
    expect(path).toBe("/listings/abc123");
    expect(createListing).not.toHaveBeenCalled();
  });
});
