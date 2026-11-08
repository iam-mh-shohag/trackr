import { NextResponse } from "next/server";
import { ResetPinSchema } from "@/lib/validators";
import { verifyRecovery, updatePin } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ResetPinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const ok = await verifyRecovery(parsed.data.recovery);
  if (!ok) {
    return NextResponse.json({ error: "Invalid recovery" }, { status: 401 });
  }
  await updatePin(parsed.data.newPin);
  return NextResponse.json({ ok: true });
}