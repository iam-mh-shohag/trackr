import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/types";
import {
  UpdateTransactionSchema,
  DeleteTransactionSchema,
} from "@/lib/validators";
import {
  assertPersonUnlocked,
  assertPin,
  withGuards,
} from "@/lib/middleware";

async function loadTransaction(txId: string) {
  if (!ObjectId.isValid(txId)) return null;
  const db = await getDB();
  return db
    .collection(COLLECTIONS.transactions)
    .findOne({ _id: new ObjectId(txId) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ txId: string }> }
) {
  return withGuards(async () => {
    const { txId } = await params;
    const tx = await loadTransaction(txId);
    if (!tx) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await assertPersonUnlocked((tx.personId as ObjectId).toString());

    const body = await req.json();
    const parsed = UpdateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.channelId) {
      if (!ObjectId.isValid(parsed.data.channelId)) {
        return NextResponse.json(
          { error: "Invalid channel id" },
          { status: 400 }
        );
      }
      const db = await getDB();
      const channel = await db.collection(COLLECTIONS.channels).findOne({
        _id: new ObjectId(parsed.data.channelId),
        personId: tx.personId,
      });
      if (!channel) {
        return NextResponse.json(
          { error: "Channel does not belong to this person" },
          { status: 400 }
        );
      }
    }

    const update: any = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.channelId) {
      update.channelId = new ObjectId(parsed.data.channelId);
    }

    const db = await getDB();
    await db
      .collection(COLLECTIONS.transactions)
      .updateOne({ _id: new ObjectId(txId) }, { $set: update });

    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ txId: string }> }
) {
  return withGuards(async () => {
    const { txId } = await params;
    const tx = await loadTransaction(txId);
    if (!tx) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await assertPersonUnlocked((tx.personId as ObjectId).toString());

    const body = await req.json();
    const parsed = DeleteTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    await assertPin(parsed.data.pin);

    const db = await getDB();
    await db
      .collection(COLLECTIONS.transactions)
      .deleteOne({ _id: new ObjectId(txId) });

    return NextResponse.json({ ok: true });
  });
}