"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Images,
} from "lucide-react";

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const next = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startAutoPlay = () => {
    stopAutoPlay();

    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();

    return () => stopAutoPlay();
  }, [images.length]);

  if (!images?.length) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
        No Media
      </div>
    );
  }

  const file = images[current];
  const isVideo = /\.(mp4|webm|ogg)$/i.test(file.url);

const handleDragEnd = (
  _: any,
  info: { 
    offset: { x: number };
    velocity: { x: number };
  }
) => {
  const distance = info.offset.x;
  const velocity = info.velocity.x;

  if (distance < -80 || velocity < -500) {
    next();
    startAutoPlay();
  } 
  else if (distance > 80 || velocity > 500) {
    prev();
    startAutoPlay();
  }
};

  return (
    <div
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      className="group relative h-60 w-full overflow-hidden rounded-3xl bg-black shadow-2xl sm:h-72 md:h-80"
    >
      <AnimatePresence mode="wait">
      <motion.div
  key={current}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  dragMomentum={false}
  style={{ touchAction: "pan-y" }}
  onDragEnd={handleDragEnd}
  initial={{
    opacity: 0,
    scale: 1.12,
  }}
  animate={{
    opacity: 1,
    scale: 1.05,
  }}
  exit={{
    opacity: 0,
    scale: 0.98,
  }}
  transition={{
    duration: 1,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="absolute inset-0 cursor-grab active:cursor-grabbing"
>
          {isVideo ? (
            <video
              src={file.url}
              controls
              className="h-full w-full object-cover"
            />
          ) : (
            <motion.img
              src={file.url}
              alt={`Listing ${current + 1}`}
              className="h-full w-full select-none object-cover pointer-events-none"
              animate={{
                scale: [1.05, 1.12],
              }}
              transition={{
                duration: 5,
                ease: "linear",
              }}
            />
          )}

          {/* Luxury overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Counter */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl shadow-lg">
        <Images size={14} />
        {current + 1} / {images.length}
      </div>

      {/* Previous */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prev();
              startAutoPlay();
            }}
            className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-xl opacity-0 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white/25 group-hover:opacity-100"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              next();
              startAutoPlay();
            }}
            className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-xl opacity-0 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-white/25 group-hover:opacity-100"
          >
            <ChevronRight size={22} />
          </button>
                  </>
      )}

      {/* Premium Bottom Info */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 pb-5 pt-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.35em] text-white/70">
              Premium Listing
            </p>

            <h3 className="text-lg font-semibold text-white drop-shadow-lg">
              Explore Every Detail
            </h3>
          </div>

          {isVideo && (
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-sm text-white backdrop-blur-xl shadow-lg">
              <Play size={15} fill="white" />
              <span>Video</span>
            </div>
          )}
        </div>
      </div>

      {/* Premium Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <motion.button
              key={index}
              layout
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrent(index);
                startAutoPlay();
              }}
              animate={{
                width: index === current ? 26 : 8,
                opacity: index === current ? 1 : 0.6,
              }}
              transition={{
                duration: 0.35,
              }}
              className={`h-2 rounded-full ${
                index === current
                  ? "bg-white shadow-lg"
                  : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Elegant Shine */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl"
        />
      </div>
    </div>
  );
}