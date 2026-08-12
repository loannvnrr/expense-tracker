import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6366f1"),
  icon: text("icon"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  alertThresholdPercent: integer("alert_threshold_percent").notNull().default(80),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    merchant: text("merchant"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    paymentMethod: text("payment_method").notNull().default("apple_pay"),
    note: text("note"),
    source: text("source").notNull().default("manuel"),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    occurredAtIdx: index("expenses_occurred_at_idx").on(table.occurredAt),
    categoryIdx: index("expenses_category_idx").on(table.categoryId),
    dedupIdx: index("expenses_dedup_idx").on(table.amount, table.merchant, table.occurredAt),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  expenses: many(expenses),
  budgets: many(budgets),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));
