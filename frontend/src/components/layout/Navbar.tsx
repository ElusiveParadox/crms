"use client";

import { Button } from "@/components/ui/button";
import { AuthUser } from "@/types/auth";

type NavbarProps = {
  user: AuthUser | null;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  onLogout: () => Promise<void>;
  sidebarCollapsed: boolean;
};

export function Navbar({
  user,
  onToggleSidebar,
  onOpenMobile,
  onLogout,
  sidebarCollapsed,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--card-border)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="md:hidden" onClick={onOpenMobile}>
            Menu
          </Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={onToggleSidebar}>
            {sidebarCollapsed ? "Expand" : "Collapse"}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs text-[var(--muted)]">Signed in</p>
            <p className="text-sm font-medium text-[var(--text)]">{user?.email ?? "Unknown"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
