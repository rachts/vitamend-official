import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import User from "@/backend/models/User";
import { hashToken } from "@/backend/utils/generateResetToken";

export async function POST(req: NextRequest) {
  try {
    await connectMongoose();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ success: false, message: "Token and new password are required" }, { status: 400 });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
