import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import User from "@/backend/models/User";
import { generateResetToken } from "@/backend/utils/generateResetToken";
import emailService from "@/backend/services/emailService";

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // ALWAYS return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    const { resetToken, hashedToken } = generateResetToken() as any;

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error("Failed to send reset email:", emailError);
      return NextResponse.json({ success: false, message: "Failed to send reset email" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
