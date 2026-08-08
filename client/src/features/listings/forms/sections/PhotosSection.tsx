"use client";

import FileUploader from "@/features/listings/FileUploader";

const PhotosSection = ({ images, onChange }: { images: string[]; onChange: (files: string[]) => void }) => (
  <div>
    <label htmlFor="images">Images</label>
    <FileUploader images={images} onChange={onChange} />
  </div>
);

export default PhotosSection;
