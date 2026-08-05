import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListingGallery from "../ListingGallery";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const imgs = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"];

describe("ListingGallery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a Show all photos affordance and the photos", () => {
    render(<ListingGallery images={imgs} title="Nice place" />);
    expect(screen.getByRole("button", { name: /show all photos/i })).toBeInTheDocument();
    // desktop mosaic + mobile carousel both render, so at least one <img> per photo
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(imgs.length);
  });

  it("opens the fullscreen lightbox when a photo is clicked", async () => {
    render(<ListingGallery images={imgs} title="Nice place" />);
    await userEvent.click(screen.getByRole("button", { name: /show all photos/i }));
    // the lightbox Close control only exists while open
    expect(await screen.findByText("Close")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next photo/i })).toBeInTheDocument();
  });

  it("shows a placeholder when there are no photos", () => {
    render(<ListingGallery images={[]} title="Empty" />);
    expect(screen.getByText(/no photos yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /show all photos/i })).not.toBeInTheDocument();
  });
});
