import { NextRequest, NextResponse } from "next/server";
import { processImageWithNodeOCR } from "@/lib/ai/node-ocr-pipeline";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the File object to a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the image locally using the new native Node.js pipeline
    const data = await processImageWithNodeOCR(buffer);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Node OCR Pipeline Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
