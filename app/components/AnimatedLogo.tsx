"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";



export default function AnimatedLogo() {
  return (
    <motion.div
      className="w-10 h-10 relative"
      initial={{ rotateY: 0 }}
      animate={{ rotateY: 360 }}
      transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
    >
      <Image
        src="/logorigel.svg"
        priority
        alt="Rigel Logo"
        width={100}
        height={100}
        quality={100}
        sizes="(max-width: 768px) 60px, 68px"
        className="object-contain"
      />
    </motion.div>
  );
}