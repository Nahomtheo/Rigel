"use client";

import { useRouter } from "next/navigation";
import SignupForm from "@/app/components/SignupForm";

export default function SignupModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close sign up"
          className="
            absolute
            right-3
            top-3
            z-[99999]
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-gray-100
            text-gray-600
            border
            border-gray-200
            shadow-sm
            hover:bg-gray-200
            hover:text-gray-900
            active:scale-95
            transition-all
          "
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </button>

        {/* Signup Form */}
        <div className="pt-6">
          <SignupForm />
        </div>

      </div>
    </div>
  );
}