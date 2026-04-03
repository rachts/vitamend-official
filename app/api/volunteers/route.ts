import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Volunteer from "@/backend/models/Volunteer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    await connectDB();
    
    // Logic from volunteerController.js
    const { email } = body;
    const userQuery = session?.user ? { user: (session.user as any).id } : { email: email };
    
    let volunteer = await Volunteer.findOne(userQuery);
    if (volunteer) {
      return NextResponse.json(
        { success: false, message: 'Volunteer already registered with this ' + (session?.user ? 'account' : 'email') },
        { status: 400 }
      );
    }
    
    volunteer = await Volunteer.create({
      user: session?.user ? (session.user as any).id : undefined,
      ...body
    });
    
    return NextResponse.json({ success: true, message: 'Volunteer application submitted successfully!', data: volunteer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const volunteers = await Volunteer.find({}).populate('user', 'name email phone');
    return NextResponse.json({ success: true, message: 'Volunteers fetched', data: volunteers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
