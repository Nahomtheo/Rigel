import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    await connectDB();

    const userCount = await User.countDocuments();

    const listingCount = await Listing.countDocuments();
    const stats=[
        {title:"Users",value:userCount},
        {title:"Listings",value:listingCount}
    ] 
    return NextResponse.json(stats);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
