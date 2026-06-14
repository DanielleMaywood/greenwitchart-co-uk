import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const productsTable = sqliteTable("products", {
  id: text().primaryKey(),

  stripeProductId: text().notNull().unique(),
  stripePriceId: text().notNull(),

  name: text().notNull(),
  description: text(),
  unitAmount: integer().notNull(),
  currency: text().notNull(),
  active: integer({ mode: "boolean" }),

  stockCount: integer().notNull().default(0),
  stockReserved: integer().notNull().default(0),

  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
}, (table) => [
  check("unitAmountPositive", sql`${table.unitAmount} >= 0`),
  check("stockCountPositive", sql`${table.stockCount} >= 0`),
  check("stockReservedPositive", sql`${table.stockReserved} >= 0`),
  check("stockReservedLessThanStockCount", sql`${table.stockReserved} <= ${table.stockCount}`),
  check("currencyNormalised", sql`${table.currency} = lower(${table.currency})`),
]);