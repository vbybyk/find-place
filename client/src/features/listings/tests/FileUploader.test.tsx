import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUploader from "../FileUploader";
import { IListingFormImage } from "@/types/listings";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const REORDER_MIME = "application/x-fp-image-index";

const fileInput = (): HTMLInputElement => document.querySelector('input[type="file"]')!;

function mockDataTransfer(data: Record<string, string> = {}, files: File[] = []) {
  const store = { ...data };
  return {
    types: [...Object.keys(store), ...(files.length ? ["Files"] : [])],
    files,
    effectAllowed: "all" as const,
    dropEffect: "move" as const,
    setData: (key: string, value: string) => {
      store[key] = value;
    },
    getData: (key: string) => store[key] ?? "",
  };
}

const remote = (url: string): IListingFormImage => ({ id: url, kind: "remote", url });

describe("FileUploader", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("adds a local preview without uploading to Cloudinary", async () => {
    const onChange = vi.fn();
    render(<FileUploader images={[]} onChange={onChange} />);

    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    await userEvent.upload(fileInput(), file);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const next = onChange.mock.calls[0][0] as IListingFormImage[];
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ kind: "local", previewUrl: "blob:preview", file });
  });

  it("rejects a file with a disallowed extension and does not add it", async () => {
    const onChange = vi.fn();
    render(<FileUploader images={[]} onChange={onChange} />);

    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    await userEvent.upload(fileInput(), file, { applyAccept: false });

    expect(await screen.findByText("Only jpg, png, jpeg files are allowed")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 10 MB and does not add it", async () => {
    const onChange = vi.fn();
    render(<FileUploader images={[]} onChange={onChange} />);

    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "huge.jpg", { type: "image/jpeg" });
    await userEvent.upload(fileInput(), big);

    expect(await screen.findByText("Each photo must be 10 MB or smaller")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders previews for existing images and removes one on delete", async () => {
    const onChange = vi.fn();
    render(<FileUploader images={[remote("a.jpg"), remote("b.jpg")]} onChange={onChange} />);

    expect(screen.getByRole("img", { name: "Photo 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Photo 2" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove photo 1" }));
    expect(onChange).toHaveBeenCalledWith([remote("b.jpg")]);
  });

  it("reorders images when a tile is dropped onto another", () => {
    const onChange = vi.fn();
    const images = [remote("a.jpg"), remote("b.jpg"), remote("c.jpg")];
    render(<FileUploader images={images} onChange={onChange} />);

    const first = screen.getByRole("img", { name: "Photo 1" }).parentElement!;
    const third = screen.getByRole("img", { name: "Photo 3" }).parentElement!;

    fireEvent.dragStart(first, { dataTransfer: mockDataTransfer({ [REORDER_MIME]: "0" }) });
    fireEvent.dragOver(third, { dataTransfer: mockDataTransfer({ [REORDER_MIME]: "0" }) });
    fireEvent.drop(third, { dataTransfer: mockDataTransfer({ [REORDER_MIME]: "0" }) });

    expect(onChange).toHaveBeenCalledWith([remote("b.jpg"), remote("c.jpg"), remote("a.jpg")]);
  });

  it("does not add files when a reorder drop lands on the zone", () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUploader images={[remote("a.jpg"), remote("b.jpg")]} onChange={onChange} />
    );

    const zone = container.firstElementChild!;
    fireEvent.drop(zone, {
      dataTransfer: mockDataTransfer({ [REORDER_MIME]: "0" }, [new File(["x"], "dup.jpg", { type: "image/jpeg" })]),
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
