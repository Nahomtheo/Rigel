import { SchemaType } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export const searchListingsDeclaration = {
  name: "search_listings",
  description:
    "Search for listings on Rigel Market. Returns matching items across cars, housing, rentals, and clothes. Use this when users want to find, browse, or discover listings.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description:
          "Free-text search query (e.g. 'Toyota', 'apartment in Addis', 'wedding car'). Supports English and Amharic.",
      },
      category: {
        type: SchemaType.STRING,
        description:
          "Filter by category: car, rental, housing, or clothes.",
      },
      subcategory: {
        type: SchemaType.STRING,
        description:
          "Filter by subcategory (e.g. sedan, suv, apartment, men, women, wedding_car, daily_rental).",
      },
      city: {
        type: SchemaType.STRING,
        description:
          "Filter by city name (e.g. Addis Ababa, Hawassa, Bahir Dar).",
      },
      region: {
        type: SchemaType.STRING,
        description:
          "Filter by Ethiopian region (e.g. Oromia, Amhara, Tigray).",
      },
      minPrice: {
        type: SchemaType.NUMBER,
        description: "Minimum price in Ethiopian Birr (ETB).",
      },
      maxPrice: {
        type: SchemaType.NUMBER,
        description: "Maximum price in Ethiopian Birr (ETB).",
      },
      isElectric: {
        type: SchemaType.BOOLEAN,
        description: "If true, only return electric vehicles.",
      },
      sort: {
        type: SchemaType.STRING,
        description:
          "Sort order: 'newest' (default), 'price-low', 'price-high', 'oldest'.",
      },
      limit: {
        type: SchemaType.NUMBER,
        description: "Max results to return (default 5, max 10).",
      },
    },
    required: [],
  },
};

interface SearchArgs {
  query?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  isElectric?: boolean;
  sort?: string;
  limit?: number;
}

export async function executeSearchListings(args: SearchArgs) {
  await connectDB();

  const filter: Record<string, unknown> = { status: "approved" };

  if (args.category) {
    filter.category = args.category;
  }
  if (args.subcategory) {
    filter.subcategory = args.subcategory;
  }
  if (args.city) {
    filter["location.city"] = { $regex: args.city, $options: "i" };
  }
  if (args.region) {
    filter["location.region"] = { $regex: args.region, $options: "i" };
  }
  if (args.isElectric) {
    filter.isElectric = true;
  }
  if (args.minPrice != null || args.maxPrice != null) {
    const priceFilter: Record<string, number> = {};
    if (args.minPrice != null) priceFilter.$gte = args.minPrice;
    if (args.maxPrice != null) priceFilter.$lte = args.maxPrice;
    filter.price = priceFilter;
  }

  if (args.query) {
    const escaped = args.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i"); 
    
    filter.$or = [
      { title: regex },
      { description: regex },
      { searchKeywords: regex },
      { "location.city": regex },
      { "location.subcity": regex },
      { "location.landmark": regex },
    ];
  }

  let sortOption: Record<string, 1 | -1> = { isFeatured: -1, createdAt: -1 };
  switch (args.sort) {
    case "price-low":
      sortOption = { isFeatured: -1, price: 1 };
      break;
    case "price-high":
      sortOption = { isFeatured: -1, price: -1 };
      break;
    case "oldest":
      sortOption = { isFeatured: -1, createdAt: 1 };
      break;
  }

  const limit = Math.min(args.limit ?? 5, 10);

  const listings = await Listing.find(filter)
    .sort(sortOption)
    .limit(limit)
    .populate("owner", "name")
    .lean();

  if (listings.length === 0) {
    return { results: [], message: "No listings found matching your criteria." };
  }

  const formatted = listings.map((l) => ({
    id: l._id?.toString(),
    title: l.title,
    category: l.category,
    subcategory: l.subcategory,
    price: l.price,
    currency: "ETB",
    city: l.location?.city ?? "N/A",
    region: l.location?.region ?? "N/A",
    isElectric: l.isElectric,
    seller: (l.owner as unknown as { name?: string })?.name ?? "Unknown",
    views: l.views,
    rating: l.averageRating ?? 0,
    ratingCount: l.ratingCount ?? 0,
    featured: l.isFeatured,
    createdAt: l.createdAt,
  }));

  return { results: formatted, count: formatted.length };
}
