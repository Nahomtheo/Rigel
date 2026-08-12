"use client";

import { useRouter } from "next/navigation";
import LoginPage from "@/app/components/SigninForm";

export default function SigninModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Close button */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close sign in"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>

        {/* Login */}
        <LoginPage />

      </div>
    </div>
  );
}