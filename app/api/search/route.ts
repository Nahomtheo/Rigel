import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const city = searchParams.get('city') || '';
    const region = searchParams.get('region') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isElectric = searchParams.get('isElectric');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    const filter: any = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Location filter (Ethiopian regions and cities)
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    if (region) {
      filter['location.region'] = { $regex: region, $options: 'i' };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Electric vehicle filter
    if (isElectric === 'true') {
      filter.isElectric = true;
    }

    // Text search (Amharic and English support)
    if (query) {
      const searchRegex = new RegExp(query, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.city': searchRegex },
        { 'location.region': searchRegex },
        { 'location.subcity': searchRegex },
        { 'location.landmark': searchRegex },
        { searchKeywords: searchRegex },
      ];
      
      // Special Ethiopian search terms
      const ethiopianTerms = {
        'መኪና': 'car',
        'ቤት': 'housing',
        'ሰፈር': 'rental',
        'ልብስ': 'clothes',
        'ኤሌክትሪክ': 'electric',
        'ሃይብሪድ': 'hybrid',
        'የጋብቻ': 'wedding',
        'የግንባታ': 'construction',
      };
      
      // Add translated terms to search
      for (const [amharic, english] of Object.entries(ethiopianTerms)) {
        if (query.includes(amharic)) {
          filter.$or.push({ category: new RegExp(english, 'i') });
          filter.$or.push({ searchKeywords: new RegExp(english, 'i') });
        }
      }
    }

    // Sorting
    let sortOption: any  = { createdAt: -1 }; // Default: newest first
    switch (sort) {
      case 'price-low':
        sortOption = { price: 1 };
        break;
      case 'price-high':
        sortOption = { price: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email phone isPremium profileImage')
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search listings' },
      { status: 500 }
    );
  }
}