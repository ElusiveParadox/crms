"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Box,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: BookOpen },
  { href: "/dashboard/resources", label: "Resources", icon: Box },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored || !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null; // Wait for auth check

  return (
    <div className="min-h-screen bg-mesh-dark flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full glass-panel border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">CRMS</h1>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest">Campus Resources</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-300"}`} />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary/60" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User card */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white text-sm font-bold">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-panel border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            Online
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, z: -100, rotateY: 10, scale: 0.95 }}
              animate={{ opacity: 1, z: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, z: 100, rotateY: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, damping: 25, mass: 0.8 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}