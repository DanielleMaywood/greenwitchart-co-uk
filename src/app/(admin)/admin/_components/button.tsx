"use client";

import { cva, type VariantProps } from "cva";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";

const buttonStyles = cva({
  base: "inline-flex touch-manipulation items-center justify-center gap-4 rounded-xs text-center font-semibold tracking-wide hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
  variants: {
    variant: {
      primary:
        "bg-surface-secondary text-content-secondary hover:bg-stone-900",
      secondary:
        "border border-stone-400 bg-inherit text-inherit hover:bg-stone-100",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonStyles>;

export function Button({
  className = "",
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ className, variant })}
      {...props}
    />
  );
}

type PendingSubmitButtonProps = ButtonProps & {
  icon: ReactNode;
  label: string;
  pendingIcon?: ReactNode;
  pendingLabel?: string;
};

export function PendingSubmitButton({
  icon,
  label,
  pendingIcon,
  pendingLabel,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || props.disabled} type="submit" {...props}>
      {pending && pendingIcon ? pendingIcon : icon}
      {pending && pendingLabel ? pendingLabel : label}
    </Button>
  );
}
