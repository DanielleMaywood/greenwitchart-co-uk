import { getDatabaseConnection } from "@/app/_lib/db";
import Price from "../../_components/price";
import { productsTable } from "@/db/schema";

export default async function ShopPage() {
  const db = await getDatabaseConnection();
  const products = await db.select().from(productsTable);

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
  console.log({ product });

  return (
    <div>
      {/* <img src={product.images[0]} /> */}
      {product.name} /{" "}
      <Price currency={product.currency} amount={product.unitAmount} />
    </div>
  );
}
