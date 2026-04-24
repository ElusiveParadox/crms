import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none transition-ui focus:ring-1 focus:ring-[var(--text)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
