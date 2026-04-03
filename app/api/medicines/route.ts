import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Medicine from "@/backend/models/Medicine";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    await connectDB();
    const medicines = await Medicine.find({ status: "approved" }).populate("donor", "name email");
    return NextResponse.json({ success: true, message: "Medicines fetched", data: medicines });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    
    // In backend/models/User.js, the user might have an id or _id
    // Typically next-auth sets user.id
    const medicine = await Medicine.create({
      ...body,
      donor: (session.user as any).id || (session.user as any)._id
    });

    return NextResponse.json({ 
      success: true, 
      message: "Medicine added successfully", 
      data: medicine 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
