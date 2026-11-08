import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { UpdateChannelSchema } from "@/lib/validators";
import { assertPersonUnlocked, withGuards } from "@/lib/middleware";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  return withGuards(async () => {
    const { id, channelId } = await params;
    await assertPersonUnlocked(id);

    if (!ObjectId.isValid(channelId)) {
      return NextResponse.json(
        { error: "Invalid channel id" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const parsed = UpdateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = await getDB();
    const result = await db
      .collection(COLLECTIONS.channels)
      .updateOne(
        { _id: new ObjectId(channelId), personId: new ObjectId(id) },
        { $set: parsed.data }
      );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Channel not found for this person" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  });
}