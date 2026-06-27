"use client";

import Link from "next/link";
import DeleteListing from "./DeleteListing";

export default function ListingActionMenu({
  id,
  ownerId,
}: {
  id: string;
  ownerId: string;
}) {
  return (
    <div className="relative z-50">

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
          shadow-xl
        "
      >

        {/* Edit */}
        <Link href={`/userlisting/${id}`}>
          <button
            className="
              flex
              w-full
              items-center
              gap-3
              px-4
              py-3
              text-sm
              text-gray-700
              transition
              hover:bg-gray-50
            "
          >
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586"
              />
            </svg>

            Edit Listing
          </button>
        </Link>


        {/* Delete */}
        <div className="border-t border-gray-100">
          <DeleteListing 
            id={id} 
            ownerId={ownerId} 
          />
        </div>


      </div>

    </div>
  );
}