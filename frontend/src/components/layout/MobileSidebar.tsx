"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const items = [
  { href: "/bookings", label: "Bookings" },
  { href: "/resources", label: "Resources" },
  { href: "/users", label: "Users" },
  { href: "/institutions", label: "Institutions" },
];

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "transition-ui fixed inset-0 z-40 bg-black/50 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "transition-ui fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--card-border)] bg-[var(--surface)] p-4 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 text-base font-semibold text-[var(--text)]">CRMS</div>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "transition-ui block rounded-xl px-3 py-2 text-sm",
                pathname === item.href
                  ? "bg-[var(--bg)] text-[var(--text)]"
                  : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
