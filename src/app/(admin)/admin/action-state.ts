import type { AdminActionState } from "./_components/types";

export type { AdminActionState };

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
};
