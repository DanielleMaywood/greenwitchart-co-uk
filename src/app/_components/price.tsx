type PriceProps = {
  currency: string;
  amount: number;
};

export default function Price({ currency, amount }: PriceProps) {
  const numberFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  });

  return <div>{numberFormatter.format(amount / 100)}</div>;
}
