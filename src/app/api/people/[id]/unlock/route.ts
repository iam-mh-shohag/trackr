import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { UnlockPersonSchema } from "@/lib/validators";
import { assertPin, withGuards } from "@/lib/middleware";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withGuards(async () => {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await req.json();
    const parsed = UnlockPersonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await assertPin(parsed.data.pin);

    const db = await getDB();
    await db
      .collection(COLLECTIONS.people)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { isLocked: false, updatedAt: new Date() } }
      );
    return NextResponse.json({ ok: true, isLocked: false });
  });
}