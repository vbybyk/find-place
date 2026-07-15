import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUploader from "../FileUploader";

const uploadImage = vi.fn();
vi.mock("@/lib/actions/listings", () => ({
  uploadImage: (...args: unknown[]) => uploadImage(...args),
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const fileInput = (): HTMLInputElement => document.querySelector('input[type="file"]')!;

describe("FileUploader", () => {
  beforeEach(() => uploadImage.mockReset());

  it("uploads an accepted image and reports the returned url via onChange", async () => {
    uploadImage.mockResolvedValue("https://res.cloudinary.com/x.jpg");
    const onChange = vi.fn();
    render(<FileUploader images={[]} onChange={onChange} />);

    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    await userEvent.upload(fileInput(), file);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(["https://res.cloudinary.com/x.jpg"]));
    expect(uploadImage).toHaveBeenCalledTimes(1);
  });

  it("rejects a file with a disallowed extension and does not upload", async () => {
    const onChange = vi.fn();
    render(<FileUploader images={[]} onChange={onChange} />);

    const file = new File(["x"], "resume.pdf", { type: "application/pdf" });
    // applyAccept:false so the browser's accept filter doesn't drop the file
    // before the component's own extension validation can run.
    await userEvent.upload(fileInput(), file, { applyAccept: false });

    expect(await screen.findByText("Only jpg, png, jpeg files are allowed")).toBeInTheDocument();
    expect(uploadImage).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders previews for existing images and removes one on delete", async () => {
    const onChange = vi.fn();
    render(<FileUploader images={["a.jpg", "b.jpg"]} onChange={onChange} />);

    expect(screen.getAllByRole("img", { name: "File Preview" })).toHaveLength(2);

    await userEvent.click(screen.getAllByRole("button")[0]); // first delete button
    expect(onChange).toHaveBeenCalledWith(["b.jpg"]);
  });
});
