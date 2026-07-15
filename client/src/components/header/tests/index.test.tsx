import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../index";

describe("Header", () => {
  it("renders the primary nav links with the expected hrefs", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Buy" })).toHaveAttribute("href", "/listings?type=2");
    expect(screen.getByRole("link", { name: "Rent" })).toHaveAttribute("href", "/listings?type=1");
    expect(screen.getByRole("link", { name: "Manage Rentals" })).toHaveAttribute("href", "/listings?userId=1");
    expect(screen.getByRole("link", { name: "Add Property" })).toHaveAttribute("href", "/listings/new");
  });

  it("opens and closes the mobile menu dialog", async () => {
    const { container } = render(<Header />);
    const dialog = container.querySelector("dialog")!;
    expect(dialog).not.toHaveAttribute("open");

    await userEvent.click(screen.getByText("Open main menu"));
    expect(dialog).toHaveAttribute("open");

    await userEvent.click(screen.getByText("Close main menu"));
    expect(dialog).not.toHaveAttribute("open");
  });
});
