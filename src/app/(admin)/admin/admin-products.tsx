"use client";

import { initialAdminActionState } from "./action-state";
import { performSync } from "./actions";
import { ActionMessage } from "./_components/action-message";
import { PendingSubmitButton } from "./_components/button";
import { TextInput } from "./_components/form-fields";
import { ProductPanel } from "./_components/product-panel";
import {
  getInventorySummary,
  SummaryStats,
} from "./_components/summary-stats";
import type { AdminProduct } from "./_components/types";
import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState, useActionState } from "react";

type AdminProductsProps = {
  initialQuery: string;
  initialStatusFilter: StatusFilter;
  products: AdminProduct[];
};

const statusFilters = ["all", "active", "inactive"] as const;
type StatusFilter = (typeof statusFilters)[number];

function updateFilterUrl(query: string, statusFilter: StatusFilter) {
  const params = new URLSearchParams(window.location.search);

  if (query.trim().length > 0) {
    params.set("q", query);
  } else {
    params.delete("q");
  }

  if (statusFilter === "all") {
    params.delete("status");
  } else {
    params.set("status", statusFilter);
  }

  const nextQuery = params.toString();
  const nextUrl = nextQuery
    ? `${window.location.pathname}?${nextQuery}`
    : window.location.pathname;

  window.history.replaceState(null, "", nextUrl);
}

export default function AdminProducts({
  initialQuery,
  initialStatusFilter,
  products,
}: AdminProductsProps) {
  const [syncState, syncAction] = useActionState(
    performSync,
    initialAdminActionState,
  );
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(initialStatusFilter);

  const summary = useMemo(() => getInventorySummary(products), [products]);
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

  function handleQueryChange(value: string) {
    setQuery(value);
    updateFilterUrl(value, statusFilter);
  }

  function handleStatusChange(status: StatusFilter) {
    setStatusFilter(status);
    updateFilterUrl(query, status);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-4 py-6 text-content-primary sm:px-6 lg:px-8">
      <section className="flex flex-col gap-5 border-b border-stone-400 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-700">
            Admin Inventory
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-wide text-wrap sm:text-4xl">
            Products & Stock
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
            Sync product details from Stripe, then manage the stock held in the
            shop database.
          </p>
        </div>

        <form
          action={syncAction}
          className="flex flex-col gap-3 sm:items-start md:items-end"
        >
          <PendingSubmitButton
            className="min-h-12 px-5 py-3 text-base transition-colors"
            icon={<RefreshCw aria-hidden="true" className="size-5" />}
            label="Sync from Stripe"
            pendingIcon={
              <RefreshCw aria-hidden="true" className="size-5 animate-spin" />
            }
            pendingLabel="Syncing…"
          />
          <ActionMessage state={syncState} />
        </form>
      </section>

      <SummaryStats summary={summary} />

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="flex w-full flex-col gap-2 text-sm font-medium text-stone-800 md:max-w-md">
          Search Products
          <span className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-stone-500"
            />
            <TextInput
              autoComplete="off"
              className="pl-10"
              name="productSearch"
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Name or Stripe ID…"
              type="search"
              value={query}
            />
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-stone-800">Status</legend>
          <div className="grid grid-cols-3 overflow-hidden rounded-xs border border-stone-400 bg-white">
            {statusFilters.map((status) => (
              <button
                key={status}
                aria-pressed={statusFilter === status}
                className={`touch-manipulation px-4 py-3 text-sm font-semibold capitalize tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-stone-900 ${
                  statusFilter === status
                    ? "bg-surface-secondary text-content-secondary"
                    : "text-stone-800 hover:bg-stone-100"
                }`}
                onClick={() => handleStatusChange(status)}
                type="button"
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
