"use client";

import { adjustStock } from "../actions";
import { initialAdminActionState } from "../action-state";
import { ActionMessage } from "./action-message";
import { PendingSubmitButton } from "./button";
import { TextArea, TextInput } from "./form-fields";
import type { AdminProduct } from "./types";
import { cva, type VariantProps } from "cva";
import {
  CheckCircle2,
  CircleAlert,
  Minus,
  PackageCheck,
  Plus,
} from "lucide-react";
import { useActionState, type ReactNode } from "react";

const currencyFormatters = new Map<string, Intl.NumberFormat>();

const badgeStyles = cva({
  base: "inline-flex items-center gap-2 rounded-xs border px-2.5 py-1 text-xs font-semibold tracking-wide",
  variants: {
    tone: {
      amber: "border-amber-700 bg-amber-50 text-amber-950",
      orange: "border-orange-700 bg-orange-50 text-orange-950",
      rose: "border-rose-800 bg-rose-50 text-rose-950",
      stone: "border-stone-500 bg-white text-stone-900",
    },
  },
  defaultVariants: {
    tone: "stone",
  },
});

function priceFormatter(currency: string, amount: number) {
  const normalizedCurrency = currency.toUpperCase();
  const cachedFormatter = currencyFormatters.get(normalizedCurrency);

  if (cachedFormatter) {
    return cachedFormatter.format(amount / 100);
  }

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: normalizedCurrency,
  });
  currencyFormatters.set(normalizedCurrency, formatter);

  return formatter.format(amount / 100);
}

export function ProductPanel({ product }: { product: AdminProduct }) {
  const availableStock = product.stockCount - product.stockReserved;
  const stockStatus =
    availableStock <= 0
      ? "Out of Stock"
      : availableStock <= 2
        ? "Low Stock"
        : "In Stock";

  return (
    <article className="rounded-xs border border-stone-300 bg-white [contain-intrinsic-size:1px_260px] [content-visibility:auto]">
      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="wrap-break-word text-xl font-semibold tracking-wide text-stone-950 text-wrap">
                {product.name}
              </h2>
              <p className="mt-1 break-all text-sm text-stone-600">
                Stripe product{" "}
                <span translate="no">{product.stripeProductId}</span>
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
            <p className="mt-4 text-sm italic text-stone-600">
              No Stripe description.
            </p>
          )}

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <ProductFact
              label="Price"
              value={priceFormatter(product.currency, product.unitAmount)}
            />
            <ProductFact
              label="Total Stock"
              value={product.stockCount.toString()}
            />
            <ProductFact
              label="Reserved"
              value={product.stockReserved.toString()}
            />
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
      <dd className="mt-1 wrap-break-word text-base font-semibold text-stone-950 tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "stone" : "amber"}>
      {active ? (
        <CheckCircle2 aria-hidden="true" className="size-4" />
      ) : (
        <CircleAlert aria-hidden="true" className="size-4" />
      )}
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

function StockBadge({ status }: { status: string }) {
  const tone =
    status === "In Stock"
      ? "stone"
      : status === "Low Stock"
        ? "orange"
        : "rose";

  return (
    <Badge tone={tone}>
      <PackageCheck aria-hidden="true" className="size-4" />
      {status}
    </Badge>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: VariantProps<typeof badgeStyles>["tone"];
}) {
  return <span className={badgeStyles({ tone })}>{children}</span>;
}

function StockAdjustmentForm({ product }: { product: AdminProduct }) {
  const [state, formAction] = useActionState(
    adjustStock,
    initialAdminActionState,
  );

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-xs border border-stone-300 bg-stone-50 p-4"
    >
      <input type="hidden" name="productId" value={product.id} />
      <h3 className="text-base font-semibold tracking-wide text-stone-950">
        Adjust Stock
      </h3>
      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label={`Choose stock action for ${product.name}`}
      >
        <StockSubmitButton direction="add" productName={product.name} />
        <StockSubmitButton direction="remove" productName={product.name} />
      </div>
      <label className="grid gap-2 text-sm font-medium text-stone-800">
        Quantity
        <TextInput
          autoComplete="off"
          inputMode="numeric"
          min="1"
          name="quantity"
          required
          step="1"
          type="number"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-stone-800">
        Note
        <TextArea
          autoComplete="off"
          className="min-h-20"
          maxLength={240}
          name="note"
          placeholder="Optional reason…"
        />
      </label>
      <ActionMessage state={state} />
    </form>
  );
}

function StockSubmitButton({
  direction,
  productName,
}: {
  direction: "add" | "remove";
  productName: string;
}) {
  const Icon = direction === "add" ? Plus : Minus;

  return (
    <PendingSubmitButton
      className="min-h-11 px-3 py-2 text-sm transition-colors"
      icon={<Icon aria-hidden="true" className="size-4" />}
      label={direction === "add" ? "Add" : "Remove"}
      name="direction"
      onClick={(event) => {
        if (
          direction === "remove" &&
          !window.confirm(`Remove stock from ${productName}?`)
        ) {
          event.preventDefault();
        }
      }}
      value={direction}
      variant={direction === "add" ? "primary" : "secondary"}
    />
  );
}
