import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import Donation from "@/backend/models/Donation";
// Since Donation form has its own fields, we might need a dedicated model or just use existing.
// Let's assume the backend model matches or we adapt.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectMongoose();
    
    // Create donation from the request body
    const donation = await Donation.create({
      medicineName: body.medicineName,
      brand: body.brand,
      genericName: body.genericName,
      dosage: body.dosage,
      quantity: body.quantity,
      expiryDate: body.expiryDate,
      condition: body.condition,
      category: body.category,
      donorName: body.donorName,
      donorEmail: body.donorEmail,
      donorPhone: body.donorPhone,
      donorAddress: body.donorAddress,
      notes: body.notes,
      imageUrls: body.imageUrls || [],
      status: "pending",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Donation submitted successfully!", 
      data: { id: (donation as any)._id } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Donation API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongoose();
    const donations = await Donation.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: donations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
