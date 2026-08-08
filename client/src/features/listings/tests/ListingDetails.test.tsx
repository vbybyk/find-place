import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ListingDetails from "../ListingDetails";
import type { IListing } from "@/types/listings";

// The gallery pulls in next/image + Base UI Dialog — stub it and test it separately.
vi.mock("@/features/listings/ListingGallery", () => ({
  default: ({ title }: { title: string }) => <div data-testid="gallery">{title}</div>,
}));

const listing = {
  title: "Sea view condo",
  price: 25000,
  rooms_number: 2,
  description: "Bright unit near the bay.",
  images: ["a.jpg", "b.jpg", "c.jpg"],
  city_label: "Cebu",
  address_line1: "5 Osmena Blvd",
  address_line2: "Tower B",
} as unknown as IListing;

describe("ListingDetails", () => {
  it("renders the heading, price, rooms and description", () => {
    render(<ListingDetails listing={listing} />);
    expect(screen.getByRole("heading", { name: "Sea view condo" })).toBeInTheDocument();
    expect(screen.getByText("25000₱")).toBeInTheDocument();
    expect(screen.getByText("2 bedrooms")).toBeInTheDocument();
    expect(screen.getByText("Bright unit near the bay.")).toBeInTheDocument();
  });

  it("renders the gallery for the listing", () => {
    render(<ListingDetails listing={listing} />);
    expect(screen.getByTestId("gallery")).toHaveTextContent("Sea view condo");
  });

  it("composes the location line", () => {
    render(<ListingDetails listing={listing} />);
    expect(screen.getByText("Cebu, 5 Osmena Blvd, Tower B")).toBeInTheDocument();
  });
});
