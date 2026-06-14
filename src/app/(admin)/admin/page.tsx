import { getDatabaseConnection } from "@/app/_lib/db";
import { productsTable } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import AdminProducts from "./admin-products";

export default async function AdminPage() {
  const db = await getDatabaseConnection();

  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.active), asc(productsTable.name));

  return (
    <AdminProducts
      products={products.map((product) => ({
        ...product,
        active: product.active,
        updatedAt: product.updatedAt.toISOString(),
      }))}
    />
  );
}
