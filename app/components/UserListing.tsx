import DeleteListing from "./DeleteListing";
import ListingCard from "./ListingCard";
import ListingActionMenu from "./ListingActionMenu";
import Link from "next/link";

export default async function UserListing({
  ownerId,
}: {
  ownerId: string;
}) {
  const query = new URLSearchParams({
    ownerId,
  }).toString();

  const resp = await fetch(
    `${process.env.NEXTAUTH_URL}/api/listing/my?${query}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const listingData = await resp.json();
  console.log(listingData);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Your Listings
          </h1>
          <p className="text-gray-500 mt-2">
            Manage and review all your posted listings
          </p>
        </div>
        <Link
          href="/createlisting"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Listing
        </Link>
      </div>

      {/* Empty state */}
      {listingData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">No listings found</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Start by creating your first listing</p>
          <Link
            href="/createlisting"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Create a listing →
          </Link>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listingData.map((item: any) => (
          <div
            key={item._id}
            className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <ListingCard id={item._id}
            title={item.title}
            price={item.price}
            category={item.category}
            subcategory={item.subcategory}
            isElectric={item.isElectric}
            location={item.location}
            images={item.images}
            createdAt={item.createdAt} />
            
            {/* Action Bar with Dropdown */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-mono">
                ...{item._id.slice(-6)}
              </span>
              <ListingActionMenu id={item._id} ownerId={item.owner} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}