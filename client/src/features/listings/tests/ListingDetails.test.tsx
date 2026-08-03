import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ListingDetails from "../ListingDetails";
import type { IListing } from "@/types/listings";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
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
    expect(screen.getByText("Rooms: 2")).toBeInTheDocument();
    expect(screen.getByText("Bright unit near the bay.")).toBeInTheDocument();
  });

  it("renders one image per entry in images", () => {
    render(<ListingDetails listing={listing} />);
    const imgs = screen.getAllByRole("img", { name: "Sea view condo" });
    expect(imgs).toHaveLength(3);
    expect(imgs[0]).toHaveAttribute("src", "a.jpg");
  });

  it("composes the location line", () => {
    render(<ListingDetails listing={listing} />);
    expect(screen.getByText("Cebu, 5 Osmena Blvd, Tower B")).toBeInTheDocument();
  });

  it("renders without crashing when images is missing", () => {
    render(<ListingDetails listing={{ ...listing, images: undefined } as unknown as IListing} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sea view condo" })).toBeInTheDocument();
  });
});
