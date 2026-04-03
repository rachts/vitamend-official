import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/backend/models/User";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });

    if (user && (await (user as any).matchPassword(password))) {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id.toString()),
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
