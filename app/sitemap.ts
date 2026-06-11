import { MetadataRoute } from "next";
import {connectDB} from "@/lib/db";
import Listing from "@/models/Listing";
import { slugify } from "@/lib/slugify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const listings = await Listing.find({}, "_id updatedAt");

  return [
    {
      url: "https://rigelcars.com",
      lastModified: new Date(),
    },
    ...listings.map((listing) => ({
      url: `https://rigelcars.com/listing/${slugify(listing.slug)}-${listing._id}`,
      lastModified: listing.updatedAt,
    })),
  ];
}