import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return Response.json({ error: "Owner ID required" }, { status: 400 });
  }

  const listings = await Listing.find({ owner: ownerId })
    .sort({ createdAt: -1 });

  return Response.json(listings);
}