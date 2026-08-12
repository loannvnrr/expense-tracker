"use server";

import { db } from "@/db";
import { expenses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateExpenseCategory(expenseId: string, categoryId: string | null) {
  await db
    .update(expenses)
    .set({ categoryId, updatedAt: new Date() })
    .where(eq(expenses.id, expenseId));
  revalidatePath("/historique");
  revalidatePath("/");
}

export async function deleteExpense(expenseId: string) {
  await db.delete(expenses).where(eq(expenses.id, expenseId));
  revalidatePath("/historique");
  revalidatePath("/");
}
