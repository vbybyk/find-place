import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "../index";

const options = [
  { id: 1, name: "Rent" },
  { id: 2, name: "Sale" },
];

describe("Select", () => {
  it("shows the placeholder when no value is selected", () => {
    render(<Select options={options} keyValue="id" value={0} onChange={vi.fn()} placeholder="Any type" />);
    expect(screen.getByText("Any type")).toBeInTheDocument();
  });

  it("opens the listbox and emits the option's value on selection", async () => {
    const onChange = vi.fn();
    render(<Select options={options} keyValue="id" value={0} onChange={onChange} placeholder="Any type" />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Sale" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("maps options through keyValue (uses `code` when provided)", async () => {
    const onChange = vi.fn();
    const countries = [
      { id: 1, code: "PH", name: "Philippines" },
      { id: 2, code: "ID", name: "Indonesia" },
    ];
    render(<Select options={countries} keyValue="code" value="" onChange={onChange} placeholder="Country" />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Indonesia" }));

    expect(onChange).toHaveBeenCalledWith("ID");
  });
});
