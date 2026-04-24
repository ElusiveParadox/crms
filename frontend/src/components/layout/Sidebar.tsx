"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type SidebarProps = {
  collapsed: boolean;
  tabletMode: boolean;
};

const items = [
  { href: "/bookings", label: "Bookings", icon: "BK" },
  { href: "/resources", label: "Resources", icon: "RS" },
  { href: "/users", label: "Users", icon: "US" },
  { href: "/institutions", label: "Institutions", icon: "IN" },
];

export function Sidebar({ collapsed, tabletMode }: SidebarProps) {
  const pathname = usePathname();
  const isCompact = collapsed || tabletMode;

  return (
    <aside
      className={cn(
        "transition-ui fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--card-border)] bg-[var(--surface)] md:flex",
        isCompact ? "w-20" : "w-64"
      )}
    >
      <div className="flex w-full flex-col p-4">
        <div className={cn("mb-8 font-semibold text-[var(--text)]", isCompact ? "text-center text-xs" : "text-base")}>
          CRMS
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "transition-ui flex items-center rounded-xl px-3 py-2 text-sm",
                    active ? "bg-[var(--bg)] text-[var(--text)]" : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
                    isCompact ? "justify-center" : "gap-3"
                  )}
                >
                  <span className="text-[10px] font-semibold">{item.icon}</span>
                  {!isCompact ? <span>{item.label}</span> : null}
                </Link>
                {isCompact ? (
                  <span className="pointer-events-none absolute left-16 top-1/2 z-40 hidden -translate-y-1/2 rounded-md border border-[var(--card-border)] bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text)] group-hover:block">
                    {item.label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
