import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Autocomplete from "../index";

const cities = [
  { id: "1", label: "Manila", adminName1: "Metro Manila" },
  { id: "2", label: "Cebu", adminName1: "Central Visayas" },
];

describe("Autocomplete", () => {
  it("renders the search input", () => {
    render(<Autocomplete options={cities} value={null} onChange={vi.fn()} inputValue="" />);
    expect(screen.getByPlaceholderText("Type to search...")).toBeInTheDocument();
  });

  it("calls onInputChange as the user types", async () => {
    const onInputChange = vi.fn();
    render(
      <Autocomplete options={cities} value={null} onChange={vi.fn()} inputValue="" onInputChange={onInputChange} />
    );

    await userEvent.type(screen.getByPlaceholderText("Type to search..."), "Ma");

    expect(onInputChange).toHaveBeenCalled();
    // last call carries the latest value and the "input" reason
    const lastCall = onInputChange.mock.calls.at(-1)!;
    expect(lastCall[2]).toBe("input");
  });

  it("calls onChange with the picked option", async () => {
    const onChange = vi.fn();
    render(<Autocomplete options={cities} value={null} onChange={onChange} inputValue="" />);

    await userEvent.click(screen.getByPlaceholderText("Type to search..."));
    await userEvent.keyboard("{ArrowDown}"); // open the listbox
    await userEvent.click(await screen.findByText("Cebu"));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: "2", label: "Cebu" }));
  });

  it("shows the clear control when there is input and clears via onChange(null)", async () => {
    const onChange = vi.fn();
    const onInputChange = vi.fn();
    const { container } = render(
      <Autocomplete options={cities} value={null} onChange={onChange} inputValue="Manila" onInputChange={onInputChange} />
    );

    const clearBtn = container.querySelector("button")!;
    expect(clearBtn).toBeInTheDocument();

    await userEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
    // our Clear handler emits a "clear"-reason input change (Base UI may emit
    // its own "input" event too, so assert on presence rather than order)
    expect(onInputChange.mock.calls.some((c) => c[2] === "clear")).toBe(true);
  });

  it("renders an empty state when there are no options", async () => {
    render(<Autocomplete options={[]} value={null} onChange={vi.fn()} inputValue="" />);
    await userEvent.click(screen.getByPlaceholderText("Type to search..."));
    await userEvent.keyboard("{ArrowDown}"); // open the listbox
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });
});
