import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Ad from "@/models/Ad";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const ads = await Ad.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: ads });
  } catch (error) {
    console.error("Get all ads error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const body = await req.json();

    if (!body.title || !body.image) {
      return NextResponse.json(
        { success: false, error: "Title and image are required" },
        { status: 400 }
      );
    }

    const ad = await Ad.create({
      title: body.title,
      image: body.image,
      link: body.link || "",
      active: body.active !== false,
    });

    return NextResponse.json({ success: true, data: ad }, { status: 201 });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ad" },
      { status: 500 }
    );
  }
}
