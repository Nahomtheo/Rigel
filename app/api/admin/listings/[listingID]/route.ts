import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Listing from "@/models/Listing";

type ListingParams = {
  params: Promise<{ listingID: string }>;
};

export async function PATCH(req: Request, { params }: ListingParams) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const { listingID } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (["pending", "approved", "rejected"].includes(body.status)) {
      updates.status = body.status;
    }

    if (typeof body.isFeatured === "boolean") {
      updates.isFeatured = body.isFeatured;
    }

    const listing = await Listing.findByIdAndUpdate(listingID, updates, {
      new: true,
      runValidators: true,
    }).populate("owner", "name email");

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Listing updated", listing });
  } catch {
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: ListingParams) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const { listingID } = await params;
    const listing = await Listing.findByIdAndDelete(listingID);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Listing deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
