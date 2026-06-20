"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled error (app/error.tsx):", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{error?.message || 'An unexpected error occurred.'}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded bg-blue-600 text-white font-medium"
          >
            Try again
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded border border-gray-200"
          >
            Go home
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-400">If the problem persists, please contact support.</div>
      </div>
    </div>
  );
}
