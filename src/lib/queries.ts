import { db } from "@/db";
import { expenses, categories, budgets } from "@/db/schema";
import { and, gte, lte, eq, desc, ilike, sql, type SQL } from "drizzle-orm";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // lundi = 0
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

export async function getDashboardData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  async function sumSince(date: Date) {
    const rows = await db
      .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(gte(expenses.occurredAt, date));
    return Number(rows[0]?.total ?? 0);
  }

  const [today, week, month, year] = await Promise.all([
    sumSince(todayStart),
    sumSince(weekStart),
    sumSince(monthStart),
    sumSince(yearStart),
  ]);

  const byCategoryRows = await db
    .select({
      categoryId: expenses.categoryId,
      name: categories.name,
      color: categories.color,
      total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(gte(expenses.occurredAt, monthStart))
    .groupBy(expenses.categoryId, categories.name, categories.color);

  const byCategory = byCategoryRows
    .map((r) => ({
      categoryId: r.categoryId,
      name: r.name ?? "Non catégorisé",
      color: r.color ?? "#94a3b8",
      total: Number(r.total),
    }))
    .sort((a, b) => b.total - a.total);

  const trendSince = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
  const trendRows = await db
    .select({
      day: sql<string>`to_char(${expenses.occurredAt}, 'YYYY-MM-DD')`,
      total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(gte(expenses.occurredAt, trendSince))
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const trend = trendRows.map((r) => ({ date: r.day, total: Number(r.total) }));

  const topExpensesRows = await db
    .select({
      id: expenses.id,
      merchant: expenses.merchant,
      amount: expenses.amount,
      occurredAt: expenses.occurredAt,
    })
    .from(expenses)
    .where(gte(expenses.occurredAt, monthStart))
    .orderBy(desc(expenses.amount))
    .limit(5);

  const globalBudgetRows = await db
    .select()
    .from(budgets)
    .where(sql`${budgets.categoryId} IS NULL`)
    .limit(1);
  const globalBudget = globalBudgetRows[0] ? Number(globalBudgetRows[0].amount) : null;
  const budgetRemaining = globalBudget !== null ? globalBudget - month : null;

  return { today, week, month, year, byCategory, trend, topExpenses: topExpensesRows, globalBudget, budgetRemaining };
}

export async function listExpenses(filters: {
  from?: string;
  to?: string;
  categoryId?: string;
  merchant?: string;
  page?: number;
}) {
  const conditions: SQL[] = [];
  if (filters.from) conditions.push(gte(expenses.occurredAt, new Date(filters.from)));
  if (filters.to) conditions.push(lte(expenses.occurredAt, new Date(filters.to)));
  if (filters.merchant) conditions.push(ilike(expenses.merchant, `%${filters.merchant}%`));
  if (filters.categoryId) conditions.push(eq(expenses.categoryId, filters.categoryId));

  const page = filters.page ?? 1;
  const pageSize = 30;

  const rows = await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      currency: expenses.currency,
      merchant: expenses.merchant,
      occurredAt: expenses.occurredAt,
      categoryId: expenses.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      source: expenses.source,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(expenses.occurredAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return rows;
}

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.name);
}
