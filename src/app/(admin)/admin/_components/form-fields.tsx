"use client";

import { cva } from "cva";
import type { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input">;
type TextareaProps = ComponentPropsWithoutRef<"textarea">;

const fieldStyles = cva({
  base: "w-full rounded-xs border border-stone-400 bg-white px-3 py-3 text-base outline-none transition-colors focus-visible:border-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900/15",
  variants: {
    multiline: {
      false: "",
      true: "min-h-20",
    },
  },
  defaultVariants: {
    multiline: false,
  },
});

export function TextInput({ className = "", ...props }: InputProps) {
  return <input className={fieldStyles({ className })} {...props} />;
}

export function TextArea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={fieldStyles({ className, multiline: true })}
      {...props}
    />
  );
}
