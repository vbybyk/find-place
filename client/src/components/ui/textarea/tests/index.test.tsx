import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "../index";

describe("Textarea", () => {
  it("forwards props and renders a textarea", () => {
    render(<Textarea placeholder="Description" defaultValue="hello" />);
    const el = screen.getByPlaceholderText("Description") as HTMLTextAreaElement;
    expect(el.tagName).toBe("TEXTAREA");
    expect(el.value).toBe("hello");
  });

  it("merges a custom className with the base classes", () => {
    render(<Textarea className="custom-y" placeholder="p" />);
    const el = screen.getByPlaceholderText("p");
    expect(el).toHaveClass("custom-y");
    expect(el.className).toContain("min-h-[80px]");
  });

  it("forwards a ref and fires onChange", async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const onChange = vi.fn();
    render(<Textarea ref={ref} placeholder="p" onChange={onChange} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    await userEvent.type(screen.getByPlaceholderText("p"), "ab");
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
