import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password." },
        { status: 400 }
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      "otp.code": hashedToken,
      "otp.expiresAt": { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = undefined; // Invalidate the OTP/reset token
    await user.save();

    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
