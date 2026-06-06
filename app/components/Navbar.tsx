"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import AnimatedLogo from "./AnimatedLogo";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const userName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <AnimatedLogo />
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            Rigel
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">

          {!session ? (
            <>
              <Link
                href="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
              >
                Dashboard
              </Link>

              <Link
                href="/userlisting"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
              >
                Listings
              </Link>

              {/* 👤 User name */}
              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <span className="text-gray-700 dark:text-gray-200 font-medium max-w-[120px] truncate">
                  {userName}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-500 hover:text-red-600 ml-2"
              >
                Logout
              </button>
            </>
          )}

          <ThemeToggle />
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-3">

          {!session ? (
            <>
              <Link onClick={() => setOpen(false)} href="/login" className="block text-gray-700 dark:text-gray-200">
                Login
              </Link>

              <Link
                onClick={() => setOpen(false)}
                href="/signup"
                className="block px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* 👤 Mobile user */}
              <div className="flex items-center gap-2 py-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {userName}
                </span>
              </div>

              <Link
                onClick={() => setOpen(false)}
                href="/dashboard"
                className="block text-gray-700 dark:text-gray-200"
              >
                Dashboard
              </Link>

              <Link
                onClick={() => setOpen(false)}
                href="/userlisting"
                className="block text-gray-700 dark:text-gray-200"
              >
                Listings
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="text-red-500"
              >
                Logout
              </button>
            </>
          )}

          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}