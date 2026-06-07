import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { v2 as cloudinary } from "cloudinary";
import User from "@/models/User";
import {  DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export async function GET(req: Request, { params }: { params:Promise< { id: string } >}) {
  await connectDB();

  const listingId = (await params).id;
  const listing = await Listing.findById(listingId);

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }
  await Listing.findByIdAndUpdate(listingId, {
      $inc: { views: 1 },
    })

  return Response.json(listing);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string } >}
) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  const listingId = (await params).id;

  if (!ownerId) {
    return Response.json({ error: "Owner ID required" }, { status: 400 });
  }

  // 🔍 Find listing
  const listing = await Listing.findById(listingId);

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  // 🔐 SECURITY CHECK (VERY IMPORTANT)
  if (listing.owner.toString() !== ownerId) {
    return Response.json(
      { error: "Not authorized to delete this listing" },
      { status: 403 }
    );
  }
// 🗑 Delete associated images from Cloudinary
    if (listing.imageData?.length > 0) {
    await Promise.all(
      listing.imageData.map(async (img: any) =>

        await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: img,
      })
    )
      )
    );
  }

  // 🗑 Delete
  await Listing.findByIdAndDelete(listingId);

  return Response.json({ message: "Listing deleted successfully" });
}

export async function PUT(req: Request,
  {params}: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    const listingId = (await params).id;
    const body = await req.json();

    const {
      title,
      description,
      pricing,
      category,
      location,
      ownerId,
      specs,
      images,
      imagesToDelete,
    } = body;

    const user = await User.findById(ownerId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      return Response.json(
        { error: "You must be verified" },
        { status: 403 }
      );
    }
    for (const publicId of imagesToDelete) {
  await cloudinary.uploader.destroy(publicId);
}

    const listing = await Listing.findByIdAndUpdate(
      listingId,
      {
        title,
        description,
        pricing,
        category,
        location,
        specs,
        images, // ✅ already uploaded
        owner: ownerId,
        status: "pending",
      }
    );

    return Response.json(listing);
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}