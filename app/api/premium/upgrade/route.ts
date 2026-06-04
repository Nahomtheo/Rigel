import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

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

    await request.json();

    // In production, integrate with payment gateway (e.g., Chapa, Yenepay for Ethiopia)
    // For now, we'll simulate a premium upgrade
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Set premium status (30 days from now)
    const premiumExpiry = new Date();
    premiumExpiry.setDate(premiumExpiry.getDate() + 30);

    user.isPremium = true;
    user.premiumExpiry = premiumExpiry;
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        isPremium: true,
        premiumExpiry: premiumExpiry,
        message: 'Successfully upgraded to premium!',
      },
    });
  } catch (error) {
    console.error('Premium upgrade error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upgrade to premium' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      user.isPremium = false;
      user.premiumExpiry = undefined;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry,
        showPhoneToNonPremium: user.showPhoneToNonPremium,
      },
    });
  } catch (error) {
    console.error('Get premium status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get premium status' },
      { status: 500 }
    );
  }
}