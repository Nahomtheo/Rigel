import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const listingid=await params
    
    const listing = await Listing.findById(listingid.id)
      .populate('owner', 'name email phone isPremium profileImage showPhoneToNonPremium')
      .lean();

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    await Listing.findByIdAndUpdate(listingid.id, {
      $inc: { views: 1 },
    });

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const listingid=await params
    
    const listing = await Listing.findById(listingid.id)
      .populate('owner', 'name email phone isPremium profileImage showPhoneToNonPremium')
      .lean();

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }
    const owner = listing.owner as { email?: string; _id?: unknown };

    if (owner.email !== session.user.email && (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
     for (const image of listing.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Increment view count
    await Listing.findByIdAndDelete(listingid.id);

    return NextResponse.json({message: 'Listing deleted successfully'});
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
