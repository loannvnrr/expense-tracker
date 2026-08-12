import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  amount: z.number().positive().optional(),
  merchant: z.string().nullable().optional(),
  card: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  note: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid payload" },
      { status: 400 }
    );
  }

  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.amount !== undefined) values.amount = parsed.data.amount.toFixed(2);
  if (parsed.data.merchant !== undefined) values.merchant = parsed.data.merchant;
  if (parsed.data.card !== undefined) values.card = parsed.data.card;
  if (parsed.data.categoryId !== undefined) values.categoryId = parsed.data.categoryId;
  if (parsed.data.note !== undefined) values.note = parsed.data.note;

  const [updated] = await db
    .update(expenses)
    .set(values)
    .where(eq(expenses.id, id))
    .returning({ id: expenses.id });

  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ id: updated.id, status: "updated" });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deleted] = await db.delete(expenses).where(eq(expenses.id, id)).returning({ id: expenses.id });

  if (!deleted) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ status: "deleted" });
}
