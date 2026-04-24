import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "hover-scale rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-6 shadow-sm shadow-black/20 transition-ui",
        className
      )}
      {...props}
    />
  );
}
