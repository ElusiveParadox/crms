"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Box, Users, Clock, TrendingUp, Calendar } from "lucide-react";
import api from "@/lib/axios";

interface StatsCard {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const fetchData = async () => {
      try {
        const res = await api.get("/bookings/me");
        setBookings(res.data);
      } catch {
        // User might not have bookings yet
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const approved = bookings.filter((b) => b.status === "APPROVED").length;
  const rejected = bookings.filter((b) => b.status === "REJECTED").length;
  const total = bookings.length;

  const stats: StatsCard[] = [
    { label: "Total Bookings", value: total, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Approved", value: approved, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Rejected", value: rejected, icon: Calendar, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15, mass: 0.8 }
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back{user ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s an overview of your campus activity.</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={cardVariants} className="h-full">
            <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {loading ? (
                  <span className="inline-block w-10 h-8 bg-white/5 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Bookings */}
      <div>
        <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
              <p className="text-sm text-gray-400 mt-1">Your latest booking requests</p>
            </div>
            <button className="text-sm text-primary hover:text-primary-light font-medium transition-colors">
              View all
            </button>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No bookings yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first booking to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">End Time</th>
                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map((booking, i) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 100, damping: 15 }}
                      className="border-b border-white/5 hover:bg-white/[0.04] transition-all cursor-default"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Box className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {booking.resource?.name || "Resource"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(booking.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(booking.endTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : booking.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400"
                              : booking.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
