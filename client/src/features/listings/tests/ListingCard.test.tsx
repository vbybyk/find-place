import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ListingCard from "../ListingCard";
import type { IListing } from "@/lib/database/models/listing";

// next/image renders a plain <img> in jsdom so we can assert on src/alt.
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const baseListing = {
  title: "Cozy flat",
  price: 15000,
  roomsNumber: 3,
  images: ["https://res.cloudinary.com/x.jpg"],
  location: { city: { label: "Manila" }, addressLine1: "1 Rizal St", addressLine2: "Unit 4" },
} as unknown as IListing;

describe("ListingCard", () => {
  it("renders title, price and rooms", () => {
    render(<ListingCard listing={baseListing} />);

    expect(screen.getByRole("heading", { name: "15000₱" })).toBeInTheDocument();
    expect(screen.getByText("Cozy flat")).toBeInTheDocument();
    expect(screen.getByText("Rooms: 3")).toBeInTheDocument();
  });

  it("composes the location line from city and address parts", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.getByText("Manila, 1 Rizal St, Unit 4")).toBeInTheDocument();
  });

  it("uses the first image as the card image, falling back to empty src", () => {
    const { rerender } = render(<ListingCard listing={baseListing} />);
    expect(screen.getByRole("img", { name: "Cozy flat" })).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/x.jpg"
    );

    rerender(<ListingCard listing={{ ...baseListing, images: [] } as unknown as IListing} />);
    expect(screen.getByRole("img", { name: "Cozy flat" }).getAttribute("src")).toBeFalsy();
  });
});
