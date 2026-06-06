import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User with that email does not exist." },
        { status: 404 }
      );
    }

    // Generate a secure, URL-safe token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = Date.now() + 3600000; // 1 hour from now

    user.otp = {
      code: passwordResetToken,
      expiresAt: passwordResetExpires,
    };
    await user.save();

    const resetUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified Resend email
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json(
      { message: "Password reset email sent successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
