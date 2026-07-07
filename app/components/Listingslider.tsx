'use client';
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Images } from "lucide-react";

type ImageType = {
  url: string;
  publicId: string;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    // Old slide moves out opposite to the incoming slide
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  })
};

export default function ListingSlider({ images }: { images: ImageType[] }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Safely wrap the current index
  const current = (page % images.length + images.length) % images.length;

  const navigate = (newPage: number, newDirection: number) => {
    setPage([newPage, newDirection]);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      navigate(page + 1, 1);
    }, 3000); // 3 seconds timer
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [page, images.length]); // Dependencies updated to handle timer reset correctly on user interaction

  if (!images || images.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        No Media
      </div>
    );
  }

  const file = images[current];
  const isVideo = /\.(mp4|webm|ogg)$/i.test(file.url);

  const handleDragEnd = (_: any, info: { offset: { x: number }, velocity: { x: number } }) => {
    const swipe = info.offset.x;
    const speed = info.velocity.x;

    if (swipe < -40 || speed < -300) {
      navigate(page + 1, 1);
    } else if (swipe > 40 || speed > 300) {
      navigate(page - 1, -1);
    }
  };

  return (
    <div
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onTouchStart={stopAutoPlay}
      onTouchEnd={startAutoPlay}
      className="group/slider relative h-full w-full overflow-hidden rounded-t-xl bg-black"
    >
      {/* Changed mode to "wait" or keeping popLayout but using a cleaner transition configuration */}
      <AnimatePresence initial={false} custom={direction}>
  <motion.div
    key={page}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    drag="x"
    dragDirectionLock
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={0.2}
    onPointerDown={(e) => {
      e.stopPropagation();
      stopAutoPlay();
    }}
    onDragEnd={handleDragEnd}
    style={{ touchAction: "none" }}
    
    // CHANGE THIS BLOCK:
    transition={{
      x: { type: "tween", duration: 0.35, ease: "easeInOut" },
      opacity: { type: "tween", duration: 0.35, ease: "easeInOut" }
    }}
    
    className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
  >
    {isVideo ? (
      <video src={file.url} controls className="h-full w-full object-cover pointer-events-auto" />
    ) : (
      <img src={file.url} alt="listing" draggable={false} className="h-full w-full object-cover select-none" />
    )}
  </motion.div>
</AnimatePresence>

      {/* Counter */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-lg select-none pointer-events-none">
        <Images size={14} />
        {current + 1}/{images.length}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(page - 1, -1);
            }}
            className="hidden sm:flex absolute left-4 top-1/2 z-30 h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-lg opacity-0 transition group-hover/slider:opacity-100 pointer-events-auto hover:bg-white/40"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(page + 1, 1);
            }}
            className="hidden sm:flex absolute right-4 top-1/2 z-30 h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-lg opacity-0 transition group-hover/slider:opacity-100 pointer-events-auto hover:bg-white/40"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-16 pointer-events-none select-none">
        <h3 className="text-white font-semibold text-lg">Explore Every Detail</h3>
        {isVideo && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-lg">
            <Play size={14} /> Video
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2 pointer-events-auto">
          {images.map((_, index) => {
            // Determine the shortcut direction when clicking dots
            const dotDirection = index > current ? 1 : -1;
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (index !== current) {
                    navigate(page + (index - current), dotDirection);
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${index === current ? "w-7 bg-white" : "w-2 bg-white/60"}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}