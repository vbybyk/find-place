"use client";

import FileUploader from "@/features/listings/FileUploader";
import { IListingFormImage } from "@/types/listings";

const PhotosSection = ({
  images,
  onChange,
}: {
  images: IListingFormImage[];
  onChange: (files: IListingFormImage[]) => void;
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor="files" className="text-sm font-medium text-gray-900">
      Photos
    </label>
    <FileUploader images={images} onChange={onChange} />
  </div>
);

export default PhotosSection;
