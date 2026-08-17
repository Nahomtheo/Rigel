import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    await connectDB();

    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find({ listing: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name profileImage")
        .lean(),
      Rating.countDocuments({ listing: id }),
    ]);

    const formatted = ratings.map((r) => ({
      _id: r._id?.toString(),
      rating: r.rating,
      comment: r.comment,
      userName: (r.user as unknown as { name?: string })?.name ?? "Anonymous",
      userImage:
        (r.user as unknown as { profileImage?: string })?.profileImage ?? null,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ratings: formatted,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
