import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).lean();

    if (!user || user.isBanned) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const listings = await Listing.find({
      owner: id,
      status: "approved",
      $or: [{ availability: "active" }, { availability: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          profileImage: user.profileImage || null,
          isPremium: user.isPremium,
          isVerified: user.isVerified,
          memberSince: user.createdAt,
          phone:
            user.isPremium || user.showPhoneToNonPremium
              ? user.phone || null
              : null,
        },
        listings,
      },
    });
  } catch (error) {
    console.error("Error fetching public user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}