import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--card-border)] px-2.5 py-1 text-xs font-medium text-[var(--text)]",
        className
      )}
      {...props}
    />
  );
}
