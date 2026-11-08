import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDB();
    await db.command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      db: db.databaseName,
      message: "MongoDB connection works",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}