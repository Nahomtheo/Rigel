import { SchemaType } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";
import Listing from "@/models/Listing";

export const topUsersDeclaration = {
  name: "get_top_rated_users",
  description:
    "Get the highest-rated sellers on Rigel Market based on ratings received across their listings. Use this when users ask for best sellers, trusted sellers, top-rated sellers, or recommended sellers.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      category: {
        type: SchemaType.STRING,
        description:
          "Filter sellers by their listing category: car, rental, housing, or clothes.",
      },
      minRating: {
        type: SchemaType.NUMBER,
        description:
          "Minimum average rating threshold (1-5). Default is 4.",
      },
      limit: {
        type: SchemaType.NUMBER,
        description: "Max results to return (default 5, max 10).",
      },
    },
    required: [],
  },
};

interface TopUsersArgs {
  category?: string;
  minRating?: number;
  limit?: number;
}

export async function executeTopUsers(args: TopUsersArgs) {
  await connectDB();

  const minRating = args.minRating ?? 4;
  const limit = Math.min(args.limit ?? 5, 10);

  // Get listing IDs filtered by category if provided
  const listingFilter: Record<string, unknown> = { status: "approved" };
  if (args.category) {
    listingFilter.category = args.category;
  }
  const validListings = await Listing.find(listingFilter)
    .select("_id owner")
    .lean();

  const listingIds = validListings.map((l) => l._id);

  if (listingIds.length === 0) {
    return { results: [], message: "No listings found for this category." };
  }

  // Aggregate ratings per seller
  const sellerStats = await Rating.aggregate([
    { $match: { listing: { $in: listingIds } } },
    {
      $lookup: {
        from: "listings",
        localField: "listing",
        foreignField: "_id",
        as: "listingDoc",
      },
    },
    { $unwind: "$listingDoc" },
    {
      $group: {
        _id: "$listingDoc.owner",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
    { $match: { avgRating: { $gte: minRating }, totalRatings: { $gte: 2 } } },
    { $sort: { avgRating: -1, totalRatings: -1 } },
    { $limit: limit },
  ]);

  if (sellerStats.length === 0) {
    return {
      results: [],
      message: `No sellers found with rating ${minRating} or higher.`,
    };
  }

  // Fetch user details
  const User = (await import("@/models/User")).default;
  const sellerIds = sellerStats.map((s) => s._id);
  const users = await User.find({ _id: { $in: sellerIds } })
    .select("name profileImage isPremium isVerified")
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const formatted = sellerStats.map((s) => {
    const user = userMap.get(s._id.toString());
    return {
      userId: s._id.toString(),
      name: user?.name ?? "Unknown",
      isPremium: user?.isPremium ?? false,
      isVerified: user?.isVerified ?? false,
      averageRating: Math.round(s.avgRating * 10) / 10,
      totalRatings: s.totalRatings,
    };
  });

  return { results: formatted, count: formatted.length };
}
