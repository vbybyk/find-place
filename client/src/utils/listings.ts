import { uploadImage } from "@/lib/actions/listings";
import { IListingFormImage } from "@/types/listings";

export const resolveListingImageUrls = async (images: IListingFormImage[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const image of images) {
    if (image.kind === "remote") {
      urls.push(image.url);
      continue;
    }
    const formData = new FormData();
    formData.append("file", image.file);
    const url = await uploadImage(formData);
    if (!url) throw new Error("Failed to upload image");
    urls.push(url);
  }
  return urls;
};
