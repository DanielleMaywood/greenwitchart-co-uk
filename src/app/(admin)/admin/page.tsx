import { getDatabaseConnection } from "@/app/_lib/db";
import { productsTable } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import AdminProducts from "./admin-products";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusFilters = ["all", "active", "inactive"] as const;
type StatusFilter = (typeof statusFilters)[number];

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusFilter(value: string | string[] | undefined): StatusFilter {
  const status = getFirstSearchParam(value);

  return statusFilters.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : "all";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = searchParams ? await searchParams : {};
  const db = await getDatabaseConnection();

  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.active), asc(productsTable.name));

  return (
    <AdminProducts
      initialQuery={getFirstSearchParam(params.q) ?? ""}
      initialStatusFilter={getStatusFilter(params.status)}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        stripeProductId: product.stripeProductId,
        unitAmount: product.unitAmount,
        currency: product.currency,
        active: product.active,
        stockCount: product.stockCount,
        stockReserved: product.stockReserved,
      }))}
    />
  );
}
