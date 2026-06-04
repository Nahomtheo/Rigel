import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Listing from "@/models/Listing";

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("featured");

    const query: Record<string, unknown> = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    if (featured === "true" || featured === "false") {
      query.isFeatured = featured === "true";
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("owner", "name email")
      .lean();

    return NextResponse.json({ listings });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
