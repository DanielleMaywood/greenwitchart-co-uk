import { getDatabaseConnection } from "@/app/_lib/db";
import Price from "../../_components/price";
import { productsTable } from "@/db/schema";
import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";

export default async function ShopPage() {
  const db = await getDatabaseConnection();
  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.active, true),
        sql`${productsTable.stockCount} > ${productsTable.stockReserved}`,
      ),
    );

  return (
    <div>
      {products.map((product) => (
        <ProductListing key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductListing({
  product,
}: {
  product: typeof productsTable.$inferSelect;
}) {
  return (
    <Link href={`/shop/${product.id}`}>
      {/* <img src={product.images[0]} /> */}
      {product.name} /{" "}
      <Price currency={product.currency} amount={product.unitAmount} />
    </Link>
  );
}
