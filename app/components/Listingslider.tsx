"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type ImageType = {
  url: string;
  publicId: string;
};

export default function ListingSlider({
  images,
}: {
  images: ImageType[];
}) {
  const [current, setCurrent] = useState(0);

  // Auto slide every 2 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (!images?.length) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-xl">
        No Media
      </div>
    );
  }

  const next = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDragEnd = (
    _: any,
    info: { offset: { x: number } }
  ) => {
    const swipeThreshold = 50;

    if (info.offset.x > swipeThreshold) {
      prev();
    } else if (info.offset.x < -swipeThreshold) {
      next();
    }
  };

  const file = images[current];
  const isVideo = /\.(mp4|webm|ogg)$/i.test(file.url);

  return (
    <div
      className="
        relative
        w-full
        h-56
        sm:h-64
        md:h-72
        overflow-hidden
        rounded-xl
        group
      "
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="w-full h-full"
      >
        {isVideo ? (
          <video
            src={file.url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={file.url}
            alt={`Listing image ${current + 1}`}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        )}
      </motion.div>

      {images.length > 1 && (
        <>
          {/* Previous */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prev();
            }}
            className="
              absolute
              left-2
              top-1/2
              -translate-y-1/2
              z-20
              w-10
              h-10
              rounded-full
              bg-black/50
              text-white
              flex
              items-center
              justify-center
              opacity-100
              md:opacity-0
              md:group-hover:opacity-100
              transition
            "
          >
            ←
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              next();
            }}
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              z-20
              w-10
              h-10
              rounded-full
              bg-black/50
              text-white
              flex
              items-center
              justify-center
              opacity-100
              md:opacity-0
              md:group-hover:opacity-100
              transition
            "
          >
            →
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrent(index);
              }}
              className={`rounded-full transition-all ${
                index === current
                  ? "w-5 h-2 bg-white"
                  : "w-2 h-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
