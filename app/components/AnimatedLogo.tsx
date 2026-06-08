"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function AnimatedLogo() {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothX = useSpring(rotateX, {
    stiffness: 180,
    damping: 18,
  });

  const smoothY = useSpring(rotateY, {
    stiffness: 180,
    damping: 18,
  });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x =
      e.clientX - rect.left - rect.width / 2;

    const y =
      e.clientY - rect.top - rect.height / 2;

    rotateX.set(-(y / rect.height) * 15);
    rotateY.set((x / rect.width) * 15);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ perspective: 1200 }}
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Glow */}
      <motion.div
        className="
          absolute
          inset-0
          rounded-full
          bg-blue-500/20
          blur-xl
        "
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
        }}
      />

      {/* Star sparkle */}
      <motion.div
        className="
          absolute
          -top-1
          -right-1
          text-amber-400
          text-xs
          z-20
        "
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 1, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        ✦
      </motion.div>

      <motion.div
        style={{
          rotateX: smoothX,
          rotateY: smoothY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.08,
        }}
        className="
          relative
          w-14
          h-14
          sm:w-16
          sm:h-16
          lg:w-18
          lg:h-18
        "
      >
        <Image
          src="/logorigel.png"
          alt="Rigel Logo"
          fill
          priority
          className="
            object-contain
            drop-shadow-[0_8px_25px_rgba(0,0,0,0.25)]
            rounded-ful
          "
        />
      </motion.div>
    </motion.div>
  );
}