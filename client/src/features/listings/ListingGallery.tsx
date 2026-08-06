"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui-components/react/dialog";

interface IProps {
  images: string[] | null | undefined;
  title: string;
}

const Tile = ({
  src,
  alt,
  className,
  sizes,
  priority,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative overflow-hidden bg-gray-100 focus:outline-none ${className ?? ""}`}
  >
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition duration-200 group-hover:brightness-90"
    />
  </button>
);

const ListingGallery = ({ images, title }: IProps) => {
  const imgs = images ?? [];
  const count = imgs.length;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(0); // mobile carousel position
  const touchX = useRef<number | null>(null);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Arrow-key navigation while the lightbox is open (ESC is handled by the Dialog).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  if (count === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400 md:h-96">
        No photos yet
      </div>
    );
  }

  const alt = (i: number) => `${title} — photo ${i + 1}`;

  // --- desktop mosaic (adapts to how many photos exist) ---
  let mosaic;
  if (count >= 5) {
    const bottom = imgs.slice(3, 8); // up to 5
    mosaic = (
      <div className="flex flex-col gap-2">
        <div className="grid h-[360px] grid-cols-3 grid-rows-2 gap-2">
          <Tile
            src={imgs[0]}
            alt={alt(0)}
            onClick={() => openAt(0)}
            sizes="(max-width: 767px) 1px, 60vw"
            priority
            className="col-span-2 row-span-2"
          />
          <Tile src={imgs[1]} alt={alt(1)} onClick={() => openAt(1)} sizes="(max-width: 767px) 1px, 30vw" />
          <Tile src={imgs[2]} alt={alt(2)} onClick={() => openAt(2)} sizes="(max-width: 767px) 1px, 30vw" />
        </div>
        <div className="grid h-[116px] gap-2" style={{ gridTemplateColumns: `repeat(${bottom.length}, 1fr)` }}>
          {bottom.map((src, i) => (
            <Tile key={src} src={src} alt={alt(i + 3)} onClick={() => openAt(i + 3)} sizes="(max-width: 767px) 1px, 20vw" />
          ))}
        </div>
      </div>
    );
  } else if (count === 1) {
    mosaic = (
      <div className="h-[380px]">
        <Tile src={imgs[0]} alt={alt(0)} onClick={() => openAt(0)} sizes="(max-width: 767px) 1px, 1120px" priority className="h-full w-full" />
      </div>
    );
  } else if (count === 2) {
    mosaic = (
      <div className="grid h-[360px] grid-cols-2 gap-2">
        {imgs.map((src, i) => (
          <Tile key={src} src={src} alt={alt(i)} onClick={() => openAt(i)} sizes="(max-width: 767px) 1px, 50vw" priority={i === 0} />
        ))}
      </div>
    );
  } else if (count === 3) {
    mosaic = (
      <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-2">
        <Tile src={imgs[0]} alt={alt(0)} onClick={() => openAt(0)} sizes="(max-width: 767px) 1px, 50vw" priority className="row-span-2" />
        <Tile src={imgs[1]} alt={alt(1)} onClick={() => openAt(1)} sizes="(max-width: 767px) 1px, 50vw" />
        <Tile src={imgs[2]} alt={alt(2)} onClick={() => openAt(2)} sizes="(max-width: 767px) 1px, 50vw" />
      </div>
    );
  } else {
    // count === 4
    mosaic = (
      <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-2">
        {imgs.map((src, i) => (
          <Tile key={src} src={src} alt={alt(i)} onClick={() => openAt(i)} sizes="(max-width: 767px) 1px, 50vw" priority={i === 0} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: mosaic with a "Show all photos" affordance */}
      <div className="relative hidden overflow-hidden rounded-2xl md:block">
        {mosaic}
        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-gray-900/10 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          <GridIcon />
          Show all photos
        </button>
      </div>

      {/* Mobile: edge-to-edge swipe carousel (bleeds past the Container padding) */}
      <div className="relative -mx-4 sm:-mx-6 md:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setCurrent(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {imgs.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => openAt(i)}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-gray-100"
            >
              <Image
                src={src}
                alt={alt(i)}
                fill
                sizes="(min-width: 768px) 1px, 100vw"
                priority={i === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {current + 1} / {count}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/95" />
          <Dialog.Popup
            className="fixed inset-0 z-50 flex flex-col outline-none"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (dx > 50) prev();
              else if (dx < -50) next();
              touchX.current = null;
            }}
          >
            <Dialog.Title className="sr-only">{title} — photos</Dialog.Title>

            <div className="flex items-center justify-between px-4 py-3 text-white">
              <Dialog.Close className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-white/10">
                <CloseIcon />
                Close
              </Dialog.Close>
              <span className="text-sm tabular-nums">
                {index + 1} / {count}
              </span>
              <span className="w-16" />
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
              {count > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white"
                >
                  <ChevronIcon dir="left" />
                </button>
              )}
              <div className="relative h-full w-full max-w-5xl">
                <Image
                  src={imgs[index]}
                  alt={alt(index)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />
              </div>
              {count > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white"
                >
                  <ChevronIcon dir="right" />
                </button>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default ListingGallery;
