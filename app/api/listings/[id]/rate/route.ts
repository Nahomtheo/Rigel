import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";
import Listing from "@/models/Listing";

async function recalculateRating(listingId: string) {
  const stats = await Rating.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
  const count = stats.length > 0 ? stats[0].count : 0;

  await Listing.findByIdAndUpdate(listingId, {
    averageRating: avg,
    ratingCount: count,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await connectDB();

    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.owner.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, error: "You cannot rate your own listing" },
        { status: 400 }
      );
    }

    const existing = await Rating.findOne({
      user: user._id,
      listing: id,
    });

    let ratingDoc;
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || "";
      ratingDoc = await existing.save();
    } else {
      ratingDoc = await Rating.create({
        user: user._id,
        listing: id,
        rating,
        comment: comment || "",
      });
    }

    await recalculateRating(id);

    return NextResponse.json({
      success: true,
      data: {
        _id: ratingDoc._id,
        rating: ratingDoc.rating,
        comment: ratingDoc.comment,
        createdAt: ratingDoc.createdAt,
      },
    });
  } catch (error) {
    console.error("Rate listing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to rate listing" },
      { status: 500 }
    );
  }
}
