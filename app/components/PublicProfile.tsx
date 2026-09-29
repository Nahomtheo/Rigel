'use client';

import Link from "next/link";
import Image from "next/image";
import {
  User,
  Crown,
  BadgeCheck,
  Calendar,
  Package,
  Phone,
  ArrowLeft,
} from "lucide-react";
import ListingCard from "./ListingCard";

interface PublicUser {
  _id: string;
  name: string;
  profileImage: string | null;
  isPremium: boolean;
  isVerified: boolean;
  memberSince: string;
  phone: string | null;
}

interface PublicListing {
  _id: string;
  title: string;
  price: number;
  category: string;
  subcategory?: string;
  isElectric?: boolean;
  isFeatured?: boolean;
  availability?: 'active' | 'sold' | 'rented';
  location: { city: string; region: string; subcity?: string };
  images: { url: string; publicId: string }[];
  createdAt: string;
  views?: number;
}

export default function PublicProfile({
  user,
  listings,
}: {
  user: PublicUser;
  listings: PublicListing[];
}) {
  const memberSince = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const totalViews = listings.reduce(
    (sum, l) => sum + (l.views || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--app-text)] transition-colors text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      {/* Header */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden mb-10">
        <div className="h-32 sm:h-40 bg-gradient-to-br from-[var(--accent)]/25 via-[var(--app-bg)] to-[var(--app-bg)]" />

        <div className="px-6 sm:px-10 pb-8">
          <div className="relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-[var(--app-bg)] bg-[var(--surface-soft)] flex-shrink-0">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                  <User className="w-14 h-14" />
                </div>
              )}
            </div>

            <div className="flex-1 pt-4 sm:pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--app-text)] tracking-tight">
                  {user.name}
                </h1>
                {user.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--gold)] text-xs font-bold">
                    <Crown className="w-3.5 h-3.5" />
                    Premium
                  </span>
                )}
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted)] flex-wrap">
                {memberSince && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {memberSince}
                  </span>
                )}
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 py-4 sm:py-0 mt-2 sm:mt-0">
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--accent)]">
                  {listings.length}
                </p>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-0.5">
                  Listings
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-[var(--accent)]">
                  {totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-0.5">
                  Views
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-4 h-4 text-[var(--accent)]" />
        <h2 className="font-serif text-xl font-bold text-[var(--app-text)] tracking-tight">
          Posts
        </h2>
      </div>

      {listings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--surface)] rounded-3xl border border-dashed border-[var(--border)]">
          <p className="text-lg font-medium text-[var(--app-text)]">
            No listings yet
          </p>
          <p className="text-[var(--muted)] text-sm mt-1">
            This user has not posted anything.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((item) => (
          <Link
            key={item._id}
            href={`/listing/${item.title.replace(/\s+/g, "-")}-${item._id}`}
            className="block group bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden hover:shadow-lg hover:shadow-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-colors duration-300"
          >
            <ListingCard
              id={item._id}
              title={item.title}
              price={item.price}
              category={item.category}
              subcategory={item.subcategory}
              isElectric={item.isElectric}
              isFeatured={item.isFeatured}
              availability={item.availability}
              location={item.location}
              images={item.images}
              createdAt={item.createdAt}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}