"use client";

import Image from "next/image";

export default function LogoLoader({
  label = "Loading...",
  fullScreen = true,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? "min-h-screen flex flex-col items-center justify-center gap-4 bg-[#040401]"
          : "flex flex-col items-center justify-center gap-3 py-8"
      }
    >
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-[#C9A227]/25 border-t-[#C9A227] animate-spin" />
        <Image
          src="/logorigel.png"
          alt="Rigel"
          width={48}
          height={48}
          priority
          className="w-12 h-12 object-contain rounded-full animate-pulse"
        />
      </div>
      {label && (
        <p className="text-xs text-neutral-500 font-medium tracking-wider uppercase animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
