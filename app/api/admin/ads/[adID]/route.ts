import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Ad from "@/models/Ad";

type AdParams = {
  params: Promise<{ adID: string }>;
};

export async function PATCH(req: Request, { params }: AdParams) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const { adID } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.image === "string") updates.image = body.image;
    if (typeof body.link === "string") updates.link = body.link;
    if (typeof body.active === "boolean") updates.active = body.active;

    const ad = await Ad.findByIdAndUpdate(adID, updates, {
      new: true,
      runValidators: true,
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ad updated", ad });
  } catch {
    return NextResponse.json(
      { error: "Failed to update ad" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: AdParams) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const { adID } = await params;
    const ad = await Ad.findByIdAndDelete(adID);

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ad deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete ad" },
      { status: 500 }
    );
  }
}
