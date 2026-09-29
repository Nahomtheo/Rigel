import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import User from '@/models/User';

const VALID = ['active', 'sold', 'rented'] as const;

export async function PATCH(
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

    const { id } = await params;
    const body = await request.json();
    const availability = body?.availability;

    if (!VALID.includes(availability)) {
      return NextResponse.json(
        { success: false, error: 'Invalid availability value' },
        { status: 400 }
      );
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = (session.user as { role?: string }).role === 'admin';
    if (!listing.owner.equals(user._id) && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    listing.availability = availability;
    listing.availabilityChangedAt = new Date();
    await listing.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: listing._id,
        availability: listing.availability,
        availabilityChangedAt: listing.availabilityChangedAt,
      },
    });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
