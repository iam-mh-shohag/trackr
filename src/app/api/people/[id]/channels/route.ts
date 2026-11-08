import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { CreateChannelSchema } from "@/lib/validators";
import { assertPersonUnlocked, withGuards } from "@/lib/middleware";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withGuards(async () => {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const db = await getDB();
    const items = await db
      .collection(COLLECTIONS.channels)
      .find({ personId: new ObjectId(id) })
      .sort({ createdAt: 1 })
      .toArray();
    return NextResponse.json({
      items: items.map((c) => ({
        _id: (c._id as ObjectId).toString(),
        name: c.name,
        type: c.type,
        isActive: c.isActive,
      })),
    });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withGuards(async () => {
    const { id } = await params;
    await assertPersonUnlocked(id);

    const body = await req.json();
    const parsed = CreateChannelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = await getDB();
    try {
      const result = await db.collection(COLLECTIONS.channels).insertOne({
        personId: new ObjectId(id),
        name: parsed.data.name,
        type: parsed.data.type,
        isActive: true,
        createdAt: new Date(),
      });
      return NextResponse.json(
        { _id: result.insertedId.toString(), name: parsed.data.name },
        { status: 201 }
      );
    } catch (e: any) {
      if (e?.code === 11000) {
        return NextResponse.json(
          { error: "Channel with this name already exists for this person" },
          { status: 409 }
        );
      }
      throw e;
    }
  });
}