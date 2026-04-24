"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "default" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-[var(--text)] text-[var(--bg)] hover:opacity-90",
  outline: "border border-[var(--card-border)] bg-transparent text-[var(--text)] hover:bg-[var(--surface)]",
  ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--surface)]",
  destructive: "border border-[var(--card-border)] bg-[var(--surface)] text-[var(--text)] hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  default: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-ui disabled:pointer-events-none disabled:opacity-50",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  )
);

Button.displayName = "Button";
