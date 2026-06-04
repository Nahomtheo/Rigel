import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      subcategory,
      isElectric,
      location,
      images,
      searchKeywords,
    } = body;
    console.log('Received images:', images)

    // Validation
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Get user from database to get the user ID
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create listing
    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      subcategory,
      isElectric: isElectric || false,
      location: {
        city: location.city,
        region: location.region,
        subcity: location.subcity,
        woreda: location.woreda,
        landmark: location.landmark,
        country: 'Ethiopia',
      },
      images: images,
      owner: user._id,
      searchKeywords: searchKeywords || [],
    });

    await listing.save();

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    
    const filter: Record<string, unknown> = {};
    if (category) {
      filter.category = category;
    }

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('owner', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      id,
      title,
      description,
      price,
      category,
      subcategory,
      isElectric,
      location,
      images,
      searchKeywords,
    } = body;
    console.log('Received images:', images)

    // Validation
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
  

  

    // Get user from database to get the user ID
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.user.email });
    const listing = await Listing.findById(id);
       for (const image of listing.images) {
          if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
          }
        }
    
     if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create listing
    const Updatelisting = await Listing.findByIdAndUpdate(id, {
      title,
      description,
      price,
      category,
      subcategory,
      isElectric: isElectric || false,
      location: {
        city: location.city,
        region: location.region,
        subcity: location.subcity,
        woreda: location.woreda,
        landmark: location.landmark,
        country: 'Ethiopia',
      },
      images: images,
      owner: user._id,
      searchKeywords: searchKeywords || [],
    });

    await Updatelisting.save();

    return NextResponse.json({
      success: true,
      data: Updatelisting,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}