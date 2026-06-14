import Stripe from "stripe";

type PriceProps = {
  price: Stripe.Price;
};

export default function Price({ price }: PriceProps) {
  const numberFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: price.currency.toUpperCase(),
  });

  // NOTE(DanielleMaywood):
  // It is safe to perform `!` here as it will always be non-null
  // for our use-case considering we only do per_unit billing.
  const unitAmount = price.unit_amount!;

  return <div>{numberFormatter.format(unitAmount / 100)}</div>;
}
