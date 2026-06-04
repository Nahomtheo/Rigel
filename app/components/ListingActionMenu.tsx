"use client";

import { useState } from "react";
import UpdateListing from "./UpdateListing";
import DeleteListing from "./DeleteListing";
import Link from "next/link";

export default function ListingActionMenu({ 
  id, 
  ownerId 
}: { 
  id: string; 
  ownerId: string; 
}) {


  return (
    <>
      {/* Dropdown Menu */}
      <div className="relative z-10">

            <div className=" right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden">
             <Link href={`/userlisting/${id}`}  > <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Listing
              </button>
              </Link>
                
  
            </div>
 
      </div>


      <div className="hidden">
        <DeleteListing id={id} ownerId={ownerId} />
      </div>
    </>
  );
}