import Price from "../_components/price";
import { getProducts, Product, stripeClient } from "../_lib/stripe";

export default async function ShopPage() {
  const products = await getProducts(stripeClient);

  return (
    <div>
      {products.map((product) => (
        <ProductListing key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductListing({ product }: { product: Product }) {
  console.log({ product });

  return (
    <div>
      <img src={product.images[0]} />
      {product.name} /{" "}
      {product.default_price && <Price price={product.default_price} />}
    </div>
  );
}
