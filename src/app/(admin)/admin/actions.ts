"use server";

import { getDatabaseConnection } from "@/app/_lib/db";
import { getProducts, stripeClient } from "@/app/_lib/stripe";
import { and, eq, notInArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import * as schema from "../../../db/schema";
import type { AdminActionState } from "./action-state";

export async function performSync(
  _previousState?: AdminActionState,
  _formData?: FormData,
): Promise<AdminActionState> {
  const db = await getDatabaseConnection();
  const products = await getProducts(stripeClient);
  const now = new Date();
  const activeStripeProductIds: string[] = [];
  let syncedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    if (
      !product.default_price ||
      typeof product.default_price === "string" ||
      typeof product.default_price.unit_amount !== "number"
    ) {
      skippedCount += 1;
      continue;
    }

    activeStripeProductIds.push(product.id);

    const syncedProduct: typeof schema.productsTable.$inferInsert = {
      id: nanoid(),
      name: product.name,
      description: product.description,
      stripeProductId: product.id,
      stripePriceId: product.default_price.id,
      unitAmount: product.default_price.unit_amount,
      currency: product.default_price.currency.toLowerCase(),
      active: product.active,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .insert(schema.productsTable)
      .values(syncedProduct)
      .onConflictDoUpdate({
        target: schema.productsTable.stripeProductId,
        set: {
          name: syncedProduct.name,
          description: syncedProduct.description,
          stripePriceId: syncedProduct.stripePriceId,
          unitAmount: syncedProduct.unitAmount,
          currency: syncedProduct.currency,
          active: syncedProduct.active,
          updatedAt: now,
        },
      });
    syncedCount += 1;
  }

  if (activeStripeProductIds.length > 0) {
    await db
      .update(schema.productsTable)
      .set({ active: false, updatedAt: now })
      .where(notInArray(schema.productsTable.stripeProductId, activeStripeProductIds));
  } else {
    await db.update(schema.productsTable).set({ active: false, updatedAt: now });
  }

  revalidatePath("/admin");
  revalidatePath("/shop");

  const skippedMessage =
    skippedCount === 0 ? "" : ` ${skippedCount} product${skippedCount === 1 ? "" : "s"} skipped because they do not have a usable default price.`;

  return {
    status: "success",
    message: `Synced ${syncedCount} product${syncedCount === 1 ? "" : "s"} from Stripe.${skippedMessage}`,
  };
}

export async function adjustStock(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const productId = String(formData.get("productId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const quantityValue = Number(formData.get("quantity"));
  const noteValue = String(formData.get("note") ?? "").trim();

  if (!productId) {
    return { status: "error", message: "Choose a product before changing stock." };
  }

  if (direction !== "add" && direction !== "remove") {
    return { status: "error", message: "Choose whether to add or remove stock." };
  }

  if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
    return { status: "error", message: "Enter a whole number greater than zero." };
  }

  const db = await getDatabaseConnection();
  const [product] = await db
    .select()
    .from(schema.productsTable)
    .where(eq(schema.productsTable.id, productId))
    .limit(1);

  if (!product) {
    return { status: "error", message: "That product could not be found." };
  }

  const delta = direction === "add" ? quantityValue : -quantityValue;
  const newStockCount = product.stockCount + delta;

  if (newStockCount < 0) {
    return {
      status: "error",
      message: `${product.name} only has ${product.stockCount} in stock.`,
    };
  }

  if (newStockCount < product.stockReserved) {
    return {
      status: "error",
      message: `${product.name} has ${product.stockReserved} reserved, so stock cannot be reduced below that.`,
    };
  }

  const now = new Date();
  const updatedProducts = await db
    .update(schema.productsTable)
    .set({ stockCount: newStockCount, updatedAt: now })
    .where(
      and(
        eq(schema.productsTable.id, product.id),
        eq(schema.productsTable.stockCount, product.stockCount),
      ),
    )
    .returning();

  if (updatedProducts.length === 0) {
    return {
      status: "error",
      message: "Stock changed while this form was open. Refresh and try again.",
    };
  }

  await db.insert(schema.stockAdjustmentsTable).values({
    id: nanoid(),
    productId: product.id,
    delta,
    previousStockCount: product.stockCount,
    newStockCount,
    note: noteValue.length > 0 ? noteValue : null,
    createdAt: now,
  });

  revalidatePath("/admin");
  revalidatePath("/shop");

  return {
    status: "success",
    message: `${direction === "add" ? "Added" : "Removed"} ${quantityValue} stock ${direction === "add" ? "to" : "from"} ${product.name}.`,
  };
}
