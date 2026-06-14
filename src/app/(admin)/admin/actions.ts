"use server";

import { getProducts, stripeClient } from "@/app/_lib/stripe";
import { getDatabaseConnection } from "@/app/_lib/db";
import { nanoid } from "nanoid";
import * as schema from "../../../db/schema";

export async function performSync() {
  const db = await getDatabaseConnection();
  const products = await getProducts(stripeClient);

  for (const product of products) {
    if (!product.default_price || !product.default_price.unit_amount) {
      continue;
    }

    const newProduct: typeof schema.productsTable.$inferInsert = {
      id: nanoid(),
      name: product.name,
      stripeProductId: product.id,
      stripePriceId: product.default_price.id,
      unitAmount: product.default_price.unit_amount,
      currency: product.default_price.currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedProduct = await db
      .insert(schema.productsTable)
      .values(newProduct)
      .returning();

    console.log({ insertedProduct });
  }
}
