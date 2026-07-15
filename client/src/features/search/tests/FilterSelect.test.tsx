import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSelect from "../FilterSelect";

const push = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

// Stub the Base UI Select with a minimal control: one button per option plus a
// "clear" button that emits 0. Lets us drive FilterSelect's onChange directly.
vi.mock("@/components/ui/select", () => ({
  default: ({ options, onChange }: { options: { id: number; name: string }[]; onChange: (v: number) => void }) => (
    <div>
      <button onClick={() => onChange(0)}>clear</button>
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}>
          {o.name}
        </button>
      ))}
    </div>
  ),
}));

const options = [
  { id: 1, name: "Rent" },
  { id: 2, name: "Sale" },
];

describe("FilterSelect", () => {
  beforeEach(() => {
    push.mockClear();
    searchParams = new URLSearchParams();
  });

  it("pushes a url with the selected value added under queryKey", async () => {
    render(<FilterSelect options={options} queryKey="type" />);

    await userEvent.click(screen.getByText("Sale"));

    expect(push).toHaveBeenCalledTimes(1);
    const [url, opts] = push.mock.calls[0];
    expect(new URLSearchParams(url.split("?")[1]).get("type")).toBe("2");
    expect(opts).toEqual({ scroll: false });
  });

  it("preserves other existing query params when adding one", async () => {
    searchParams = new URLSearchParams("q=manila");
    render(<FilterSelect options={options} queryKey="type" />);

    await userEvent.click(screen.getByText("Rent"));

    const parsed = new URLSearchParams(push.mock.calls[0][0].split("?")[1]);
    expect(parsed.get("q")).toBe("manila");
    expect(parsed.get("type")).toBe("1");
  });

  it("removes the key from the url when cleared (value 0)", async () => {
    searchParams = new URLSearchParams("type=2&q=manila");
    render(<FilterSelect options={options} queryKey="type" />);

    await userEvent.click(screen.getByText("clear"));

    const parsed = new URLSearchParams(push.mock.calls[0][0].split("?")[1] ?? "");
    expect(parsed.has("type")).toBe(false);
    expect(parsed.get("q")).toBe("manila");
  });
});
