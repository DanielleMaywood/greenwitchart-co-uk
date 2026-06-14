import type { AdminActionState } from "./types";

export function ActionMessage({ state }: { state: AdminActionState }) {
  if (state.status === "idle" || state.message.length === 0) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`text-sm font-medium ${
        state.status === "success" ? "text-stone-900" : "text-rose-800"
      }`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
