import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--surface)]",
        className
      )}
    />
  );
}
