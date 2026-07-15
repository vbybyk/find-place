import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Spinner from "../index";

describe("Spinner", () => {
  it("renders an animated svg", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });

  it("merges a custom className onto the base classes", () => {
    const { container } = render(<Spinner className="w-4 h-4" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-4", "h-4", "animate-spin");
  });
});
