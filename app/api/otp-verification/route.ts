
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(request: Request) {

  try {
    const { userid ,otp ,shouldResend } = await request.json();
    await connectDB();

    const user = await User.findById(userid);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("Should resend:", shouldResend);

    if(shouldResend==true){
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a new 6-digit OTP
       await resend.emails.send({
                from: "onboarding@resend.dev",
                to: [user.email],
                subject: "Your OTP Code",
                html: `<p>Your OTP code is: <strong>${newOtp}</strong></p>`
              });
      user.otp = {
        code: newOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP exnpires in 10 minutes
      };
      await user.save();
      return NextResponse.json({data:newOtp, message: "OTP resent successfully" });
    }

    else {
      console.log("Received OTP:", otp);
      console.log("User's OTP:", user.otp?.code);
      if (user.otp?.code !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }
    

    if (new Date() > user.otp.expiresAt) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    return NextResponse.json({ message: "OTP verified successfully" });
  }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}