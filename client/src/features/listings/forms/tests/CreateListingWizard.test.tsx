import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateListingWizard from "../CreateListingWizard";

const createListing = vi.fn();
const push = vi.fn();

vi.mock("@/lib/actions/listings", () => ({
  createListing: (...a: unknown[]) => createListing(...a),
  uploadImage: vi.fn(),
}));

// LocationPicker pulls in the Google Maps SDK — stub it for jsdom.
vi.mock("@/features/listings/LocationPicker", () => ({
  default: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("CreateListingWizard", () => {
  beforeEach(() => {
    createListing.mockReset();
    push.mockReset();
  });

  it("starts on the first step with a progress indicator", () => {
    render(<CreateListingWizard />);
    expect(screen.getByText("Step 1 of 7")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what are you listing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("blocks Next until the step is valid", async () => {
    render(<CreateListingWizard />);
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    // validation message shown, still on step 1
    await waitFor(() =>
      expect(screen.getByText(/choose a listing type and a property type/i)).toBeInTheDocument()
    );
    expect(screen.getByText("Step 1 of 7")).toBeInTheDocument();
    expect(createListing).not.toHaveBeenCalled();
  });
});
