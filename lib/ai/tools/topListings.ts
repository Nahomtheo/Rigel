import { SchemaType } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export const topListingsDeclaration = {
  name: "get_top_rated_listings",
  description:
    "Get the highest-rated listings on Rigel Market. Use this when users ask for best listings, top-rated items, most popular, or best deals.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      category: {
        type: SchemaType.STRING,
        description:
          "Filter by category: car, rental, housing, or clothes.",
      },
      minRating: {
        type: SchemaType.NUMBER,
        description:
          "Minimum average rating threshold (1-5). Default is 3.",
      },
      limit: {
        type: SchemaType.NUMBER,
        description: "Max results to return (default 5, max 10).",
      },
    },
    required: [],
  },
};

interface TopListingsArgs {
  category?: string;
  minRating?: number;
  limit?: number;
}

export async function executeTopListings(args: TopListingsArgs) {
  await connectDB();

  const minRating = args.minRating ?? 3;
  const limit = Math.min(args.limit ?? 5, 10);

  const filter: Record<string, unknown> = {
    status: "approved",
    averageRating: { $gte: minRating },
    ratingCount: { $gte: 1 },
  };

  if (args.category) {
    filter.category = args.category;
  }

  const listings = await Listing.find(filter)
    .sort({ averageRating: -1, ratingCount: -1 })
    .limit(limit)
    .populate("owner", "name")
    .lean();

  if (listings.length === 0) {
    return {
      results: [],
      message: `No listings found with rating ${minRating} or higher.`,
    };
  }

  const formatted = listings.map((l) => ({
    id: l._id?.toString(),
    title: l.title,
    category: l.category,
    subcategory: l.subcategory,
    price: l.price,
    currency: "ETB",
    city: l.location?.city ?? "N/A",
    rating: l.averageRating,
    ratingCount: l.ratingCount,
    views: l.views,
    seller: (l.owner as unknown as { name?: string })?.name ?? "Unknown",
  }));

  return { results: formatted, count: formatted.length };
}
