import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { CreatePersonSchema } from "@/lib/validators";
import { withGuards } from "@/lib/middleware";

export async function GET() {
  return withGuards(async () => {
    const db = await getDB();

    const people = await db
      .collection(COLLECTIONS.people)
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    const personIds = people.map((p) => p._id as ObjectId);

    const balances = await db
      .collection(COLLECTIONS.transactions)
      .aggregate([
        { $match: { personId: { $in: personIds }, settlementId: null } },
        {
          $group: {
            _id: "$personId",
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

    const channelCounts = await db
      .collection(COLLECTIONS.channels)
      .aggregate([
        { $match: { personId: { $in: personIds } } },
        { $group: { _id: "$personId", count: { $sum: 1 } } },
      ])
      .toArray();

    const lastActivity = await db
      .collection(COLLECTIONS.transactions)
      .aggregate([
        { $match: { personId: { $in: personIds } } },
        { $group: { _id: "$personId", last: { $max: "$transactionDate" } } },
      ])
      .toArray();

    const balanceMap = new Map(
      balances.map((b) => [b._id.toString(), b.received - b.sent])
    );
    const countMap = new Map(
      channelCounts.map((c) => [c._id.toString(), c.count])
    );
    const lastMap = new Map(
      lastActivity.map((l) => [l._id.toString(), l.last])
    );

    const result = people.map((p) => {
      const key = (p._id as ObjectId).toString();
      return {
        _id: key,
        name: p.name,
        note: p.note,
        isLocked: p.isLocked,
        netBalance: balanceMap.get(key) ?? 0,
        channelCount: countMap.get(key) ?? 0,
        lastActivity: lastMap.get(key) ?? null,
      };
    });

    return NextResponse.json({ items: result });
  });
}

export async function POST(req: Request) {
  return withGuards(async () => {
    const body = await req.json();
    const parsed = CreatePersonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const db = await getDB();
    const now = new Date();
    try {
      const result = await db.collection(COLLECTIONS.people).insertOne({
        name: parsed.data.name,
        note: parsed.data.note ?? "",
        isLocked: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return NextResponse.json(
        { _id: result.insertedId.toString(), name: parsed.data.name },
        { status: 201 }
      );
    } catch (e: any) {
      if (e?.code === 11000) {
        return NextResponse.json(
          { error: "A person with this name already exists" },
          { status: 409 }
        );
      }
      throw e;
    }
  });
}