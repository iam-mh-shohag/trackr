import { NextResponse } from "next/server";
import { uploadToImgbb } from "@/lib/imgbb";
import { withGuards } from "@/lib/middleware";

export async function POST(req: Request) {
  return withGuards(async () => {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const result = await uploadToImgbb(base64, file.name, file.size);

    return NextResponse.json(result, { status: 201 });
  });
}