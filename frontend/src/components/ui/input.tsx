import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-ui focus:ring-1 focus:ring-[var(--text)]",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
