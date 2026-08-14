"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteListing from "./DeleteListing";
import { EllipsisVertical } from "lucide-react";

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
        className="p-2 rounded-lg border border-neutral-700 bg-[#0c0a03]/60 text-[#e0bd4c] hover:text-black hover:bg-[#C9A227] hover:border-[#C9A227] transition-all"
        aria-label="Listing actions"
      >
        <EllipsisVertical className="w-5 h-5" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            mt-2
            w-44
            overflow-hidden
            rounded-xl
            border
            border-neutral-800
            bg-[#120f06]
            shadow-2xl shadow-black/50
          "
        >

          {/* Edit */}
          <Link href={`/userlisting/${id}`}>
            <button
              className="
                flex w-full items-center gap-3
                px-4 py-3 text-sm text-neutral-200
                hover:bg-[#C9A227]/10 hover:text-[#e0bd4c] transition
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Listing
            </button>
          </Link>

          {/* Delete */}
          <div className="border-t border-neutral-800">
            <DeleteListing id={id} ownerId={ownerId} />
          </div>

        </div>
      )}

    </div>
  );
}