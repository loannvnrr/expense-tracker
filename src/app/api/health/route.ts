import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (err) {
    return NextResponse.json(
      { status: "error", database: "unreachable", detail: String(err) },
      { status: 500 }
    );
  }
}
