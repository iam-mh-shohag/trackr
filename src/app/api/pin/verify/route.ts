import { NextResponse } from "next/server";
import { VerifyPinSchema } from "@/lib/validators";
import { verifyPin } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = VerifyPinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  const valid = await verifyPin(parsed.data.pin);
  return NextResponse.json({ valid });
}