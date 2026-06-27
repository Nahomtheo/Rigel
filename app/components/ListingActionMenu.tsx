"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteListing from "./DeleteListing";

export default function ListingActionMenu({
  id,
  ownerId,
}: {
  id: string;
  ownerId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-50">

      {/* Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6h.01M12 12h.01M12 18h.01"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-44
            overflow-hidden
            rounded-xl
            border
            border-gray-100
            bg-white
            shadow-2xl
          "
        >

          {/* Edit */}
          <Link href={`/userlisting/${id}`}>
            <button
              className="
                flex w-full items-center gap-3
                px-4 py-3 text-sm text-gray-700
                hover:bg-gray-50 transition
              "
            >
              ✏️ Edit Listing
            </button>
          </Link>

          {/* Delete */}
          <div className="border-t border-gray-100">
            <DeleteListing id={id} ownerId={ownerId} />
          </div>

        </div>
      )}

    </div>
  );
}