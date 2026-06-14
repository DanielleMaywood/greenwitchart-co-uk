import Stripe from "stripe";

// NOTE(DanielleMaywood):
// We use an unrealistically large paging limit here. 
// It is highly unlikely the shop will ever exceed it.
const PAGING_LIMIT = 1_000;

export const stripeClient = new Stripe(process.env.STRIPE_API_KEY!);

// NOTE(DanielleMaywood):
// Unfortunately the API of stripe is poorly designed
// and types that unexpanded fields could be expanded,
// and vice-versa. We manually override here all of the
// expanded types into what they actually are.
export type Product = Omit<Stripe.Product, "default_price"> & {
  default_price?: Stripe.Price | null;
};

export async function getProducts(client: Stripe): Promise<Product[]> {
  return await client.products.list({ 
    active: true, 
    expand: ["data.default_price"],
   }).autoPagingToArray({ limit: PAGING_LIMIT }) as Product[];
}