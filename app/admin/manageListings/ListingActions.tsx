"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ListingActionsProps = {
  listingID: string;
  status?: string;
  isFeatured?: boolean;
};

export default function ListingActions({
  listingID,
  status,
  isFeatured,
}: ListingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateListing = async (body: Record<string, unknown>, action: string) => {
    setLoading(action);

    try {
      const response = await fetch(`/api/admin/listings/${listingID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update listing");
      }

      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const deleteListing = async () => {
    const confirmed = window.confirm("Delete this listing permanently?");
    if (!confirmed) return;

    setLoading("delete");

    try {
      const response = await fetch(`/api/admin/listings/${listingID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }

      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateListing({ status: "approved" }, "approve")}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>
      )}

      {status !== "rejected" && (
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateListing({ status: "rejected" }, "reject")}
          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </button>
      )}

      <button
        type="button"
        disabled={loading !== null}
        onClick={() => updateListing({ isFeatured: !isFeatured }, "feature")}
        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      >
        {loading === "feature" ? "Saving..." : isFeatured ? "Unfeature" : "Feature"}
      </button>

      <button
        type="button"
        disabled={loading !== null}
        onClick={deleteListing}
        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
