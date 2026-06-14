"use client";

import { initialAdminActionState, type AdminActionState } from "./action-state";
import { adjustStock, performSync } from "./actions";
import {
  CheckCircle2,
  CircleAlert,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";

type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  stripeProductId: string;
  stripePriceId: string;
  unitAmount: number;
  currency: string;
  active: boolean | null;
  stockCount: number;
  stockReserved: number;
  updatedAt: string;
};

type AdminProductsProps = {
  products: AdminProduct[];
};

const buttonBase =
  "inline-flex items-center justify-center gap-4 rounded-xs text-center font-semibold tracking-wide hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55";
const secondaryButton =
  `${buttonBase} bg-surface-secondary text-content-secondary hover:bg-stone-900`;
const ghostButton = `${buttonBase} bg-inherit text-inherit hover:bg-stone-200`;
const fieldClassName =
  "w-full rounded-xs border border-stone-400 bg-white px-3 py-3 text-base outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/15";

const priceFormatter = (currency: string, amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

export default function AdminProducts({ products }: AdminProductsProps) {
  const [syncState, syncAction] = useActionState(performSync, initialAdminActionState);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.stripeProductId.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.active) ||
        (statusFilter === "inactive" && !product.active);

      return matchesQuery && matchesStatus;
    });
  }, [products, query, statusFilter]);

  const activeCount = products.filter((product) => product.active).length;
  const totalStock = products.reduce((total, product) => total + product.stockCount, 0);
  const reservedStock = products.reduce((total, product) => total + product.stockReserved, 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-4 py-6 text-content-primary sm:px-6 lg:px-8">
      <section className="flex flex-col gap-5 border-b border-stone-400 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-700">
            Admin inventory
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-wide sm:text-4xl">
            Products and stock
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
            Sync product details from Stripe, then manage the stock held in the shop database.
          </p>
        </div>

        <form action={syncAction} className="flex flex-col gap-3 sm:items-start md:items-end">
          <SyncButton />
          <ActionMessage state={syncState} />
        </form>
      </section>

      <section aria-label="Inventory summary" className="grid gap-3 sm:grid-cols-3">
        <SummaryStat label="Products" value={products.length.toString()} />
        <SummaryStat label="Active in Stripe" value={activeCount.toString()} />
        <SummaryStat label="Available stock" value={(totalStock - reservedStock).toString()} />
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-stone-800 md:max-w-md">
          Search products
          <span className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${fieldClassName} pl-10`}
              placeholder="Name or Stripe ID"
              type="search"
            />
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-stone-800">Status</legend>
          <div className="grid grid-cols-3 overflow-hidden rounded-xs border border-stone-400 bg-white">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-3 text-sm font-semibold capitalize tracking-wide transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-stone-900 ${
                  statusFilter === status
                    ? "bg-surface-secondary text-content-secondary"
                    : "text-stone-800 hover:bg-stone-100"
                }`}
                aria-pressed={statusFilter === status}
              >
                {status}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section aria-live="polite" className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <div className="rounded-xs border border-stone-300 bg-white p-6 text-stone-700">
            No products match the current filters.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductPanel key={product.id} product={product} />
          ))
        )}
      </section>
    </main>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xs border border-stone-300 bg-white p-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-stone-600">{label}</div>
      <div className="mt-1 text-3xl font-semibold tracking-wide text-stone-950">{value}</div>
    </div>
  );
}

function ProductPanel({ product }: { product: AdminProduct }) {
  const availableStock = product.stockCount - product.stockReserved;
  const stockStatus =
    availableStock <= 0 ? "Out of stock" : availableStock <= 2 ? "Low stock" : "In stock";

  return (
    <article className="rounded-xs border border-stone-300 bg-white">
      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold tracking-wide text-stone-950">
                {product.name}
              </h2>
              <p className="mt-1 break-all text-sm text-stone-600">
                Stripe product {product.stripeProductId}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge active={Boolean(product.active)} />
              <StockBadge status={stockStatus} />
            </div>
          </div>

          {product.description ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-700">
              {product.description}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-stone-600">No Stripe description.</p>
          )}

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <ProductFact label="Price" value={priceFormatter(product.currency, product.unitAmount)} />
            <ProductFact label="Total stock" value={product.stockCount.toString()} />
            <ProductFact label="Reserved" value={product.stockReserved.toString()} />
            <ProductFact label="Available" value={availableStock.toString()} />
          </dl>
        </div>

        <StockAdjustmentForm product={product} />
      </div>
    </article>
  );
}

function ProductFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-stone-600">{label}</dt>
      <dd className="mt-1 break-words text-base font-semibold text-stone-950">{value}</dd>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xs border px-2.5 py-1 text-xs font-semibold tracking-wide ${
        active
          ? "border-stone-500 bg-white text-stone-900"
          : "border-amber-700 bg-amber-50 text-amber-950"
      }`}
    >
      {active ? (
        <CheckCircle2 aria-hidden="true" className="size-4" />
      ) : (
        <CircleAlert aria-hidden="true" className="size-4" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function StockBadge({ status }: { status: string }) {
  const className =
    status === "In stock"
      ? "border-stone-500 bg-white text-stone-900"
      : status === "Low stock"
        ? "border-orange-700 bg-orange-50 text-orange-950"
        : "border-rose-800 bg-rose-50 text-rose-950";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xs border px-2.5 py-1 text-xs font-semibold tracking-wide ${className}`}
    >
      <PackageCheck aria-hidden="true" className="size-4" />
      {status}
    </span>
  );
}

function StockAdjustmentForm({ product }: { product: AdminProduct }) {
  const [state, formAction] = useActionState(adjustStock, initialAdminActionState);

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-xs border border-stone-300 bg-stone-50 p-4"
    >
      <input type="hidden" name="productId" value={product.id} />
      <h3 className="text-base font-semibold tracking-wide text-stone-950">Adjust stock</h3>
      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label={`Choose stock action for ${product.name}`}
      >
        <StockSubmitButton direction="add" />
        <StockSubmitButton direction="remove" />
      </div>
      <label className="grid gap-2 text-sm font-medium text-stone-800">
        Quantity
        <input
          className={fieldClassName}
          min="1"
          name="quantity"
          required
          step="1"
          type="number"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-stone-800">
        Note
        <textarea
          className={`${fieldClassName} min-h-20`}
          maxLength={240}
          name="note"
          placeholder="Optional reason"
        />
      </label>
      <ActionMessage state={state} />
    </form>
  );
}

function SyncButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${secondaryButton} min-h-12 px-5 py-3 text-base transition`}
      disabled={pending}
      type="submit"
    >
      <RefreshCw aria-hidden="true" className={`size-5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Syncing" : "Sync from Stripe"}
    </button>
  );
}

function StockSubmitButton({ direction }: { direction: "add" | "remove" }) {
  const { pending } = useFormStatus();
  const Icon = direction === "add" ? Plus : Minus;

  return (
    <button
      className={`min-h-11 px-3 py-2 text-sm transition ${
        direction === "add"
          ? secondaryButton
          : `${ghostButton} border border-stone-400 hover:bg-stone-100`
      }`}
      disabled={pending}
      name="direction"
      type="submit"
      value={direction}
    >
      <Icon aria-hidden="true" className="size-4" />
      {direction === "add" ? "Add" : "Remove"}
    </button>
  );
}

function ActionMessage({ state }: { state: AdminActionState }) {
  if (state.status === "idle" || state.message.length === 0) {
    return null;
  }

  return (
    <p
      className={`text-sm font-medium ${
        state.status === "success" ? "text-stone-900" : "text-rose-800"
      }`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
