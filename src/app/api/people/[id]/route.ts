import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { UpdatePersonSchema } from "@/lib/validators";
import { withGuards } from "@/lib/middleware";

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
    const person = await db
      .collection(COLLECTIONS.people)
      .findOne({ _id: new ObjectId(id) });
    if (!person) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const channels = await db
      .collection(COLLECTIONS.channels)
      .find({ personId: new ObjectId(id), isActive: true })
      .toArray();

    const channelBalances = await db
      .collection(COLLECTIONS.transactions)
      .aggregate([
        { $match: { personId: new ObjectId(id), settlementId: null } },
        {
          $group: {
            _id: "$channelId",
            received: {
              $sum: {
                $cond: [{ $eq: ["$direction", "received"] }, "$amount", 0],
              },
            },
            sent: {
              $sum: { $cond: [{ $eq: ["$direction", "sent"] }, "$amount", 0] },
            },
          },
        },
      ])
      .toArray();

    const balMap = new Map(
      channelBalances.map((c) => [c._id.toString(), c.received - c.sent])
    );

    const channelsWithBalance = channels.map((c) => ({
      _id: (c._id as ObjectId).toString(),
      name: c.name,
      type: c.type,
      balance: balMap.get((c._id as ObjectId).toString()) ?? 0,
    }));

    const netBalance = channelsWithBalance.reduce(
      (s, c) => s + c.balance,
      0
    );

    return NextResponse.json({
      _id: (person._id as ObjectId).toString(),
      name: person.name,
      note: person.note,
      isLocked: person.isLocked,
      netBalance,
      channels: channelsWithBalance,
    });
  });
}

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
    const parsed = UpdatePersonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const db = await getDB();
    await db
      .collection(COLLECTIONS.people)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...parsed.data, updatedAt: new Date() } }
      );
    return NextResponse.json({ ok: true });
  });
}