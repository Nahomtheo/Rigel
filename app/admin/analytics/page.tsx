import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User";

export default async function AnalyticsPage() {
  await connectDB();

  const [users, listings, featuredListings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Listing.countDocuments({ isFeatured: true }),
  ]);

  const metrics = [
    { label: "Users", value: users },
    { label: "Listings", value: listings },
    { label: "Featured Listings", value: featuredListings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-black">
            Back to admin
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-950">Analytics</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{metric.label}</p>
              <p className="mt-3 text-3xl font-bold text-gray-950">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
