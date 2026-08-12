import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { expenses, categories } from "@/db/schema";
import { and, eq, gte, lte, ilike } from "drizzle-orm";
import { listExpenses } from "@/lib/queries";

const DEDUP_WINDOW_MS = 2 * 60 * 1000; // +/- 2 minutes

const payloadSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
  merchant: z.string().nullable().optional(),
  occurredAt: z.string().min(1),
  category: z.string().optional(),
  paymentMethod: z.string().default("apple_pay"),
  source: z.enum(["auto", "manuel"]).default("auto"),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rows = await listExpenses({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    merchant: searchParams.get("merchant") ?? undefined,
    categoryId: searchParams.get("category") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  // 1. Auth par clé API (le raccourci ne peut pas faire de login interactif)
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.EXPENSES_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: "server misconfigured: EXPENSES_API_KEY missing" },
      { status: 500 }
    );
  }
  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Parsing + validation du payload
  const json = await req.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid payload" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const occurredAt = new Date(data.occurredAt);
  if (isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: "invalid occurredAt date" }, { status: 400 });
  }

  // 3. Dédup : pas d'ID de transaction fiable côté Apple Pay (voir étape 1),
  // donc on compare montant + commerçant dans une fenêtre de +/- 2 min.
  const windowStart = new Date(occurredAt.getTime() - DEDUP_WINDOW_MS);
  const windowEnd = new Date(occurredAt.getTime() + DEDUP_WINDOW_MS);

  const dedupConditions = [
    eq(expenses.amount, data.amount.toFixed(2)),
    gte(expenses.occurredAt, windowStart),
    lte(expenses.occurredAt, windowEnd),
  ];
  if (data.merchant) {
    dedupConditions.push(eq(expenses.merchant, data.merchant));
  }

  const existing = await db
    .select({ id: expenses.id })
    .from(expenses)
    .where(and(...dedupConditions))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { status: "duplicate", existingId: existing[0].id },
      { status: 409 }
    );
  }

  // 4. Résolution de la catégorie envoyée par le raccourci (texte -> id)
  let categoryId: string | null = null;
  if (data.category) {
    const match = await db
      .select({ id: categories.id })
      .from(categories)
      .where(ilike(categories.name, data.category))
      .limit(1);
    categoryId = match[0]?.id ?? null;
  }

  // 5. Insertion
  const [created] = await db
    .insert(expenses)
    .values({
      amount: data.amount.toFixed(2),
      currency: data.currency,
      occurredAt,
      merchant: data.merchant ?? null,
      categoryId,
      paymentMethod: data.paymentMethod,
      note: data.note ?? null,
      source: data.source,
      rawPayload: json,
    })
    .returning({ id: expenses.id });

  return NextResponse.json({ id: created.id, status: "created" }, { status: 201 });
}
