import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { resend } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, phone, password, showPhoneToNonPremium } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
     
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    
        // Send the OTP email using Resend
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: [email],
          subject: "Your OTP Code",
          html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
        });

    // Create user
    const user = await User.create({
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      showPhoneToNonPremium: showPhoneToNonPremium !== undefined ? showPhoneToNonPremium : true,
      isPremium: false,
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + 6 * 60 * 1000), // OTP expires in 6npm run  minutes
      },
    });

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}