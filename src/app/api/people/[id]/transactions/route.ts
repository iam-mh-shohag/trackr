import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import { CreateTransactionSchema } from "@/lib/validators";
import { assertPersonUnlocked, withGuards } from "@/lib/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withGuards(async () => {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 100);
    const cursor = searchParams.get("cursor");

    const filter: any = {
      personId: new ObjectId(id),
      settlementId: null,
    };
    if (cursor && ObjectId.isValid(cursor)) {
      filter._id = { $lt: new ObjectId(cursor) };
    }

    const db = await getDB();
    const items = await db
      .collection(COLLECTIONS.transactions)
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      items: items.map((t) => ({
        _id: (t._id as ObjectId).toString(),
        channelId: (t.channelId as ObjectId).toString(),
        direction: t.direction,
        amount: t.amount,
        counterpartyName: t.counterpartyName,
        counterpartyRef: t.counterpartyRef,
        referenceNo: t.referenceNo,
        transactionDate: t.transactionDate,
        notes: t.notes,
        screenshots: t.screenshots,
      })),
      nextCursor:
        items.length === limit
          ? (items[items.length - 1]._id as ObjectId).toString()
          : null,
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
    const parsed = CreateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(parsed.data.channelId)) {
      return NextResponse.json(
        { error: "Invalid channel id" },
        { status: 400 }
      );
    }

    const db = await getDB();
    const channel = await db.collection(COLLECTIONS.channels).findOne({
      _id: new ObjectId(parsed.data.channelId),
      personId: new ObjectId(id),
    });
    if (!channel) {
      return NextResponse.json(
        { error: "Channel does not belong to this person" },
        { status: 400 }
      );
    }

    const now = new Date();
    const result = await db.collection(COLLECTIONS.transactions).insertOne({
      personId: new ObjectId(id),
      channelId: new ObjectId(parsed.data.channelId),
      direction: parsed.data.direction,
      amount: parsed.data.amount,
      counterpartyName: parsed.data.counterpartyName,
      counterpartyRef: parsed.data.counterpartyRef,
      referenceNo: parsed.data.referenceNo,
      transactionDate: parsed.data.transactionDate,
      notes: parsed.data.notes,
      screenshots: parsed.data.screenshots,
      settlementId: null,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json(
      { _id: result.insertedId.toString() },
      { status: 201 }
    );
  });
}