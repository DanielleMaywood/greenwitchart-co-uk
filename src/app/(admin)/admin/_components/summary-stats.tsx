import type { AdminProduct } from "./types";

type InventorySummary = {
  activeCount: number;
  availableStock: number;
  productCount: number;
};

export function getInventorySummary(products: AdminProduct[]): InventorySummary {
  return products.reduce<InventorySummary>(
    (summary, product) => ({
      activeCount: summary.activeCount + (product.active ? 1 : 0),
      availableStock:
        summary.availableStock + product.stockCount - product.stockReserved,
      productCount: summary.productCount + 1,
    }),
    { activeCount: 0, availableStock: 0, productCount: 0 },
  );
}

export function SummaryStats({ summary }: { summary: InventorySummary }) {
  return (
    <section
      aria-label="Inventory summary"
      className="grid gap-3 sm:grid-cols-3"
    >
      <SummaryStat label="Products" value={summary.productCount.toString()} />
      <SummaryStat
        label="Active in Stripe"
        value={summary.activeCount.toString()}
      />
      <SummaryStat
        label="Available Stock"
        value={summary.availableStock.toString()}
      />
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xs border border-stone-300 bg-white p-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-stone-600">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold tracking-wide text-stone-950 tabular-nums">
        {value}
      </div>
    </div>
  );
}
