import { SchemaType } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export const getListingDeclaration = {
  name: "get_listing",
  description:
    "Get full details of a single listing by its ID. Use this when a user asks about a specific listing or provides a listing ID.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      listingId: {
        type: SchemaType.STRING,
        description: "The MongoDB ObjectId of the listing.",
      },
    },
    required: ["listingId"],
  },
};

export async function executeGetListing(args: { listingId: string }) {
  await connectDB();

  const listing = await Listing.findById(args.listingId)
    .populate("owner", "name email phone isPremium profileImage")
    .lean();

  if (!listing) {
    return { error: "Listing not found." };
  }

  const owner = listing.owner as unknown as {
    name?: string;
    phone?: string;
    isPremium?: boolean;
  };

  return {
    id: listing._id?.toString(),
    title: listing.title,
    description: listing.description,
    category: listing.category,
    subcategory: listing.subcategory,
    price: listing.price,
    currency: "ETB",
    isElectric: listing.isElectric,
    location: {
      city: listing.location?.city ?? "N/A",
      region: listing.location?.region ?? "N/A",
      subcity: listing.location?.subcity ?? null,
      woreda: listing.location?.woreda ?? null,
      landmark: listing.location?.landmark ?? null,
    },
    specs: listing.specs instanceof Map ? Object.fromEntries(listing.specs) : listing.specs ?? {},
    imageCount: listing.images?.length ?? 0,
    seller: {
      name: owner?.name ?? "Unknown",
      isPremium: owner?.isPremium ?? false,
    },
    views: listing.views,
    rating: listing.averageRating ?? 0,
    ratingCount: listing.ratingCount ?? 0,
    featured: listing.isFeatured,
    createdAt: listing.createdAt,
  };
}
