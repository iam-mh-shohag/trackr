import { NextResponse } from "next/server";
import { ChangeRecoverySchema } from "@/lib/validators";
import { verifyPin, updateRecovery } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = ChangeRecoverySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const ok = await verifyPin(parsed.data.pin);
  if (!ok) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  await updateRecovery(parsed.data.newRecovery);
  return NextResponse.json({ ok: true });
}