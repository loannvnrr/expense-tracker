import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { listCategories } from "@/lib/queries";

export async function GET() {
  const rows = await listCategories();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const [created] = await db
    .insert(categories)
    .values({
      name: body.name,
      color: body.color ?? "#6366f1",
      icon: body.icon ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
