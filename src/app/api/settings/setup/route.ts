import { NextResponse } from "next/server";
import { SetupPinSchema } from "@/lib/validators";
import { createSettings, getSettings } from "@/lib/auth";
import { withGuards } from "@/lib/middleware";

export async function POST(req: Request) {
  return withGuards(async () => {
    const existing = await getSettings();
    if (existing) {
      return NextResponse.json(
        { error: "Settings already exist. Use change flow." },
        { status: 409 }
      );
    }
    const body = await req.json();
    const parsed = SetupPinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await createSettings(parsed.data.pin, parsed.data.recovery);
    return NextResponse.json({ ok: true }, { status: 201 });
  });
}