import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { withGuards } from "@/lib/middleware";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withGuards(async () => {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const db = await getDB();
    await db
      .collection(COLLECTIONS.people)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { isLocked: true, updatedAt: new Date() } }
      );
    return NextResponse.json({ ok: true, isLocked: true });
  });
}