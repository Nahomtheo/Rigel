"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import AnimatedLogo from "./AnimatedLogo";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed Header Bar (Pinned to left and right corners) */}
      <header className="fixed top-2 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        
        {/* Left Corner Box: Custom Contour-Fitted Frame */}
        <div className="pointer-events-auto inline-flex items-center relative group">
          {/* Outer glowing trace line */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#C9A227] via-[#8B6B23] to-transparent rounded-tl-3xl rounded-br-2xl rounded-tr-md rounded-bl-md opacity-70 blur-[1px] group-hover:opacity-100 transition duration-500" />

          {/* Main contoured capsule */}
          <div className="relative overflow-hidden border border-[#C9A227]/40 bg-[#120B07]/95 backdrop-blur-xl rounded-tl-3xl rounded-br-2xl rounded-tr-md rounded-bl-md pl-2.5 pr-5 py-1 flex items-center shadow-2xl">
            
            {/* Ethiopian Tilet Pattern */}
            <div
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(45deg,#C9A227 1px,transparent 1px),
                  linear-gradient(-45deg,#C9A227 1px,transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            <Link href="/" className="relative z-10 flex items-center gap-2.5">
              {/* Logo icon frame tightly bounding the icon */}
              <div className="rounded-full p-1 border border-[#C9A227]/70 bg-gradient-to-b from-[#120B07] to-black shadow-inner flex items-center justify-center">
                <AnimatedLogo />
              </div>

              {/* Text fitted with zero vertical padding drift */}
              <div className="flex flex-col justify-center leading-none">
                <span className="font-serif font-extrabold text-xl tracking-widest bg-gradient-to-r from-[#F5E6B8] via-[#C9A227] to-[#8B6B23] text-transparent bg-clip-text drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  Rigel
                </span>
                
              </div>
            </Link>
          </div>
        </div>

        {/* Right Corner Box: Desktop Links */}
        <div className="pointer-events-auto hidden md:flex relative overflow-hidden border border-[#C9A227]/30 bg-[#120B07]/90 backdrop-blur-xl rounded-2xl px-6 py-2.5 shadow-xl items-center gap-6">
          {/* Ethiopian Tilet Pattern */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(45deg,#C9A227 1px,transparent 1px),
                linear-gradient(-45deg,#C9A227 1px,transparent 1px)
              `,
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 flex items-center gap-6">
            {[
              ["Home", "/"],
              ["Search", "/search"],
              ["Add Listing", "/createlisting"],
            ].map(([name, path]) => (
              <Link
                key={path}
                href={path}
                className="text-[#F5EFE6] hover:text-[#C9A227] transition text-sm font-medium"
              >
                {name}
              </Link>
            ))}

            {session && (
              <Link
                href="/userlisting"
                className="inline-flex items-center gap-1.5 text-[#F5EFE6] hover:text-[#C9A227] transition text-sm font-medium"
              >
                My Listings
              </Link>
            )}

            {!session ? (
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-[#C9A227] text-black font-semibold hover:bg-[#e2bd42] transition"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-5 py-2 rounded-full bg-[#E8D49A] text-[#120B07] font-semibold hover:bg-[#C9A227] transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Right Corner: Mobile Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="pointer-events-auto md:hidden p-3 rounded-2xl border border-[#C9A227]/30 bg-[#120B07]/90 text-[#C9A227] backdrop-blur-xl shadow-xl"
        >
          ☰
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="fixed top-20 right-4 left-4 z-40 md:hidden relative overflow-hidden border border-[#C9A227]/30 bg-[#120B07]/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
          {/* Ethiopian Tilet Pattern */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(45deg,#C9A227 1px,transparent 1px),
                linear-gradient(-45deg,#C9A227 1px,transparent 1px)
              `,
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 flex flex-col space-y-2">
            {[
              ["Home", "/"],
              ["Search", "/search"],
              ["Add Listing", "/createlisting"],
            ].map(([name, path]) => (
              <Link
                key={path}
                onClick={() => setOpen(false)}
                href={path}
                className="block py-2.5 px-4 rounded-xl text-[#F5EFE6] hover:bg-[#C9A227]/20 hover:text-[#C9A227]"
              >
                {name}
              </Link>
            ))}

            {session && (
              <Link
                onClick={() => setOpen(false)}
                href="/userlisting"
                className="block py-2.5 px-4 rounded-xl text-[#F5EFE6] hover:bg-[#C9A227]/20 hover:text-[#C9A227]"
              >
                My Listings
              </Link>
            )}

            {!session ? (
              <Link
                href="/login"
                className="block mt-2 text-center bg-[#C9A227] text-black py-3 rounded-xl font-bold"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full mt-2 bg-[#E8D49A] text-black py-3 rounded-xl font-bold"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}