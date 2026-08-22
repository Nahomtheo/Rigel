"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AnimatedLogo() {
  return (
    <motion.div
      className="relative w-11 h-11"
      animate={{ y: [0, -2, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Pulsing glow — kept tight so it stays inside the navbar */}
      <motion.div
        className="
          absolute
          -inset-1.5
          rounded-full
          blur-md
          pointer-events-none
          z-0
        "
        style={{
          background:
            "radial-gradient(circle, rgba(201,162,39,0.8) 0%, rgba(201,162,39,0.3) 50%, transparent 75%)",
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.45, 0.85, 0.45],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative w-full h-full z-10">
        <Image
          src="/logorigel.png"
          alt="Rigel Logo"
          width={160}
          height={50}
          priority
          className="
            object-contain
            drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]
            rounded-ful
          "
        />
      </div>
    </motion.div>
  );
}
