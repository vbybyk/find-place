"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import cn from "classnames";
import { IListingFormImage } from "@/types/listings";

const REORDER_MIME = "application/x-fp-image-index";
const ACCEPTED_EXTENSIONS = ["jpg", "png", "jpeg"];
const ACCEPTED_ACCEPT = ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(",");
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // keep in sync with uploadImage Server Action
const TILE_SHADOW = "shadow-[0_2px_4px_rgb(0_0_0_/_0.05)] dark:shadow-[0_2px_4px_rgb(0_0_0_/_0.5)]";

const revokeLocal = (image: IListingFormImage) => {
  if (image.kind === "local") URL.revokeObjectURL(image.previewUrl);
};

interface IProps {
  images?: IListingFormImage[];
  onChange: (images: IListingFormImage[]) => void;
}

const FileUploader = ({ images = [], onChange }: IProps) => {
  const [error, setError] = useState("");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const processFiles = (filesArray: File[]) => {
    if (!filesArray.length) return;

    const next = [...images];
    const fileTypeRegex = new RegExp(ACCEPTED_EXTENSIONS.join("|"), "i");
    let hasError = false;

    for (const file of filesArray) {
      const fileExtension = file.name.split(".").pop() || "";
      if (!fileTypeRegex.test(fileExtension)) {
        setError(`Only ${ACCEPTED_EXTENSIONS.join(", ")} files are allowed`);
        hasError = true;
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("Each photo must be 10 MB or smaller");
        hasError = true;
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        kind: "local",
        previewUrl: URL.createObjectURL(file),
        file,
      });
    }

    if (!hasError) setError("");
    if (next.length !== images.length) onChange(next);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) processFiles(Array.from(event.target.files));
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  const handleZoneDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleZoneDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes(REORDER_MIME)) return;
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length) processFiles(droppedFiles);
  };

  const handleTileDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.setData(REORDER_MIME, String(index));
    event.dataTransfer.effectAllowed = "move";
    setDragFrom(index);
  };

  const handleTileDragEnd = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  const handleTileDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOver !== index) setDragOver(index);
  };

  const handleTileDrop = (event: React.DragEvent, toIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    const raw = event.dataTransfer.getData(REORDER_MIME);
    setDragFrom(null);
    setDragOver(null);
    if (raw === "") return;
    reorder(Number(raw), toIndex);
  };

  const handleFileDelete = (index: number) => {
    const removed = images[index];
    if (removed) revokeLocal(removed);
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  const fileInput = (
    <input
      type="file"
      id="files"
      name="files"
      multiple
      accept={ACCEPTED_ACCEPT}
      ref={fileInputRef}
      className="hidden"
      onChange={handleFileChange}
      onClick={(event) => {
        (event.target as HTMLInputElement).value = "";
      }}
    />
  );

  if (images.length === 0) {
    return (
      <>
        <div
          className={cn(
            "flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-10 text-center",
            TILE_SHADOW
          )}
          onDragOver={handleZoneDragOver}
          onDrop={handleZoneDrop}
        >
          <p className="text-sm text-gray-600">Drop photos here or browse</p>
          <p className="text-xs text-gray-400">JPG or PNG · up to 10 MB · uploaded when you publish</p>
          <button type="button" onClick={openFilePicker} className="ui-button mt-1">
            Add photos
          </button>
          {fileInput}
        </div>
        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </>
    );
  }

  return (
    <>
      <div
        className="rounded-xl border border-gray-200 bg-white p-3"
        onDragOver={handleZoneDragOver}
        onDrop={handleZoneDrop}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleTileDragStart(e, index)}
              onDragEnd={handleTileDragEnd}
              onDragOver={(e) => handleTileDragOver(e, index)}
              onDrop={(e) => handleTileDrop(e, index)}
              className={cn(
                "group relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl border border-gray-200 bg-gray-100 active:cursor-grabbing",
                TILE_SHADOW,
                dragFrom === index && "opacity-50",
                dragOver === index && dragFrom !== index && "ring-2 ring-gray-900"
              )}
            >
              {image.kind === "remote" ? (
                <Image
                  src={image.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              ) : (
                // Local blob previews aren't supported by next/image remotePatterns.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.previewUrl}
                  alt={`Photo ${index + 1}`}
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              )}
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() => handleFileDelete(index)}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">Drag to reorder · uploads on publish</p>
          <button type="button" onClick={openFilePicker} className="ui-button px-4 py-2 text-sm">
            Add photos
          </button>
        </div>
        {fileInput}
      </div>
      {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
    </>
  );
};

export default FileUploader;
