import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "./mongodb";
import { COLLECTIONS, PersonDoc } from "./types";
import { verifyPin } from "./auth";

export async function assertPersonUnlocked(personId: string): Promise<PersonDoc> {
  if (!ObjectId.isValid(personId)) {
    throw NextResponse.json({ error: "Invalid person id" }, { status: 400 });
  }
  const db = await getDB();
  const person = await db
    .collection<PersonDoc>(COLLECTIONS.people)
    .findOne({ _id: new ObjectId(personId) });

  if (!person) {
    throw NextResponse.json({ error: "Person not found" }, { status: 404 });
  }
  if (person.isLocked) {
    throw NextResponse.json(
      { error: "Person is locked. Unlock to modify." },
      { status: 403 }
    );
  }
  return person;
}

export async function assertPin(pin: string | undefined | null) {
  if (!pin) {
    throw NextResponse.json({ error: "PIN required" }, { status: 401 });
  }
  const ok = await verifyPin(pin);
  if (!ok) {
    throw NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
}

export function withGuards<T>(handler: () => Promise<T>) {
  return handler().catch((err) => {
    if (err instanceof NextResponse) return err;
    console.error("Route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  });
}