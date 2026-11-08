import { NextResponse } from "next/server";
import { ChangePinSchema } from "@/lib/validators";
import { verifyPin, updatePin } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ChangePinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const ok = await verifyPin(parsed.data.currentPin);
  if (!ok) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  await updatePin(parsed.data.newPin);
  return NextResponse.json({ ok: true });
}