import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { CreateSettlementSchema } from "@/lib/validators";
import { assertPersonUnlocked, withGuards } from "@/lib/middleware";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withGuards(async () => {
    const { id } = await params;
    await assertPersonUnlocked(id);

    const body = await req.json();
    const parsed = CreateSettlementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = await getDB();
    const personId = new ObjectId(id);

    // 1. Calculate the current net balance to snapshot it
    const balances = await db.collection(COLLECTIONS.transactions).aggregate([
      { $match: { personId, settlementId: null } },
      {
        $group: {
          _id: null,
          received: { $sum: { $cond: [{ $eq: ["$direction", "received"] }, "$amount", 0] } },
          sent: { $sum: { $cond: [{ $eq: ["$direction", "sent"] }, "$amount", 0] } },
        },
      },
    ]).toArray();

    const received = balances[0]?.received || 0;
    const sent = balances[0]?.sent || 0;
    const snapshotBalance = received - sent;

    // 2. Create the settlement record
    const settlementResult = await db.collection(COLLECTIONS.settlements).insertOne({
      personId,
      settledAt: parsed.data.settledAt,
      snapshotBalance,
      note: parsed.data.note,
      screenshots: parsed.data.screenshots,
      createdAt: new Date(),
    });

    const settlementId = settlementResult.insertedId;

    // 3. Tag all current transactions with this settlementId (archiving them)
    await db.collection(COLLECTIONS.transactions).updateMany(
      { personId, settlementId: null },
      { $set: { settlementId, updatedAt: new Date() } }
    );

    return NextResponse.json({
      ok: true,
      settlementId: settlementId.toString(),
      snapshotBalance,
    }, { status: 201 });
  });
}