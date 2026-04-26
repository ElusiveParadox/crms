"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Box } from "lucide-react";
import api from "@/lib/axios";

export default function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/me");
        setBookings(res.data);
      } catch {
        // handle gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Generate calendar days for current month
  const now = new Date(selectedDate);
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Group bookings by date
  const bookingsByDate: Record<string, any[]> = {};
  bookings.forEach((b) => {
    const dateKey = new Date(b.startTime).toISOString().split("T")[0];
    if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
    bookingsByDate[dateKey].push(b);
  });

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const selectedDayBookings = bookingsByDate[selectedDate] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <p className="text-gray-400 text-sm mt-1">View your bookings schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              ←
            </button>
            <h2 className="text-lg font-semibold text-white">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasBookings = bookingsByDate[dateStr]?.length > 0;
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : isToday
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  <span className={`${isToday && !isSelected ? "font-bold" : ""}`}>{day}</span>
                  {hasBookings && (
                    <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day details */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedDayBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No bookings on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayBookings.map((b: any, i: number) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-white">{b.resource?.name || "Resource"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      b.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : b.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
