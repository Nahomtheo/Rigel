import { MetadataRoute } from "next";
import {connectDB} from "@/lib/db";
import Listing from "@/models/Listing";
import { slugify } from "@/lib/slugify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  // Change "title" to whatever your field is actually named in MongoDB (e.g., title, name, model)
  const listings = await Listing.find({}, "_id title updatedAt");

  return [
    {
      url: "https://rigelcars.com",
      lastModified: new Date(),
    },
    ...listings.map((listing) => ({
      // Wrap that fetched field inside your slugify helper function
      url: `https://rigelcars.com/listing/${slugify(listing.title)}-${listing._id}`,
      lastModified: listing.updatedAt,
    })),
  ];
}