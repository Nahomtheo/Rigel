import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import ListingActions from "./ListingActions";

type AdminListing = {
  _id: { toString(): string };
  title?: string;
  owner?: {
    email?: string;
  };
  status?: string;
  price?: number;
  pricing?: number;
  isFeatured?: boolean;
};

export default async function ManageListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  await connectDB();
  const params = await searchParams;
  const status = params?.status;
  const query =
    status && ["pending", "approved", "rejected"].includes(status)
      ? { status }
      : {};

  const listings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("owner", "name email")
    .lean<AdminListing[]>();

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            Back to admin
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Manage Listings</h1>
          {status && (
            <p className="mt-1 text-sm text-slate-500">
              Showing {status} listings
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-5 gap-4 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500">
            <span>Title</span>
            <span>Owner</span>
            <span>Status</span>
            <span>Price</span>
            <span>Actions</span>
          </div>

          {listings.map((listing) => (
            <div key={listing._id.toString()} className="grid grid-cols-5 gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0">
              <span className="font-medium text-slate-950">{listing.title}</span>
              <span className="text-slate-600">{listing.owner?.email || "No owner"}</span>
              <span className="text-slate-600">{listing.status}</span>
              <span className="text-slate-600">{listing.price ?? listing.pricing ?? "Not set"}</span>
              <ListingActions
                listingID={listing._id.toString()}
                status={listing.status}
                isFeatured={listing.isFeatured}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
