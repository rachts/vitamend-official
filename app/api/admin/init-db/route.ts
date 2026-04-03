import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import Medicine from "@/backend/models/Medicine";
import User from "@/backend/models/User";
import Donation from "@/backend/models/Donation";
import Volunteer from "@/backend/models/Volunteer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    await connectMongoose();
    
    // Create indexes if necessary
    await Promise.all([
      Medicine.createIndexes(),
      User.createIndexes(),
      Donation.createIndexes(),
      Volunteer.createIndexes(),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Database initialized with Mongoose indexes",
    }, { status: 200 });
  } catch (error: any) {
    console.error("Init DB Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
