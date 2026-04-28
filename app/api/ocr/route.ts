import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Forward the file to the Python OCR service
    const pythonServiceUrl = process.env.OCR_SERVICE_URL || "http://localhost:8001/api/ocr-check";
    
    const forwardData = new FormData();
    forwardData.append("file", file);

    const response = await fetch(pythonServiceUrl, {
      method: "POST",
      body: forwardData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python OCR Service Error:", errorText);
      return NextResponse.json({ error: "OCR service failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OCR API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
