"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteListing({
  id,
  ownerId,
}: {
  id: string;
  ownerId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const query = new URLSearchParams({
    ownerId,
  }).toString();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/listing/${id}?${query}`, {
      method: "DELETE",
    });

    if (res.ok) {
      console.log("Deleted successfully");
      router.refresh();
    } else {
      console.log("Failed to delete");
    }
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-[#120f06] border border-neutral-800 rounded-2xl shadow-2xl shadow-black/50 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-100">Delete Listing?</h3>
                <p className="text-neutral-500 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-neutral-400 mb-6">
              Are you sure you want to delete this listing? It will be permanently removed from the marketplace.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-neutral-300 font-medium rounded-lg hover:bg-[#C9A227]/10 hover:text-[#e0bd4c] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Listing'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}