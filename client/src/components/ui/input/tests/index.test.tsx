import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../index";

describe("Input", () => {
  it("forwards standard input props (type, placeholder, value)", () => {
    render(<Input type="number" placeholder="Price" value={42} readOnly />);
    const input = screen.getByPlaceholderText("Price") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "number");
    expect(input.value).toBe("42");
  });

  it("merges a custom className with the base classes", () => {
    render(<Input className="custom-x" placeholder="p" />);
    const input = screen.getByPlaceholderText("p");
    expect(input).toHaveClass("custom-x");
    expect(input.className).toContain("ui-input");
  });

  it("forwards a ref to the underlying input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="p" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("fires onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<Input placeholder="p" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText("p"), "hi");
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
