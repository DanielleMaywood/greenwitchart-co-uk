export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  stripeProductId: string;
  unitAmount: number;
  currency: string;
  active: boolean | null;
  stockCount: number;
  stockReserved: number;
};

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};
