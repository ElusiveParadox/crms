"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const STORAGE_KEY = "crms-sidebar-collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, approved } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletMode, setTabletMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const setMode = () => {
      const width = window.innerWidth;
      setTabletMode(width >= 768 && width < 1024);
      if (width >= 768) {
        setMobileOpen(false);
      }
    };
    setMode();
    window.addEventListener("resize", setMode);
    return () => window.removeEventListener("resize", setMode);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("crms-token");
      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6">
        <div className="grid gap-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  if (!approved) {
    return null;
  }

  const compact = sidebarCollapsed || tabletMode;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Sidebar collapsed={sidebarCollapsed} tabletMode={tabletMode} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={compact ? "md:ml-20" : "md:ml-64"}>
        <Navbar
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onOpenMobile={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
