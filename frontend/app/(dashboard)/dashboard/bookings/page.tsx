"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Box, Clock, Plus, X, Loader2, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function BookingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"ME" | "ALL">("ME");
  const [bookings, setBookings] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ resourceId: "", date: "", startTime: "", endTime: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoint = "/bookings" + (viewMode === "ME" && isAdmin ? "?userId=" + user.id : "");
      const bookingsRes = await api.get(endpoint);
      if (bookingsRes.data) setBookings(bookingsRes.data.data || bookingsRes.data);
    } catch {
      console.error("No bookings found or failed to fetch");
    }

    try {
      const resourcesRes = await api.get("/resources");
      if (resourcesRes.data) setResources(resourcesRes.data.data || resourcesRes.data);
    } catch {
      console.error("No resources found or failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setIsAdmin(parsed.role === "ADMIN" || parsed.role === "SUPER_ADMIN");
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [viewMode, isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      await api.post("/bookings", {
        resourceId: formData.resourceId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });
      toast.success("Booking created!");
      setShowModal(false);
      setFormData({ resourceId: "", date: "", startTime: "", endTime: "" });
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (bookingId: string, action: "cancel" | "approve" | "reject") => {
    try {
      await api.patch(`/bookings/${bookingId}/${action}`);
      toast.success(`Booking ${action}ed`);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || `Could not ${action}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage resource reservations</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="bg-white/5 border border-white/5 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode("ME")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === "ME" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setViewMode("ALL")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === "ALL" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                All Bookings
              </button>
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Bookings list */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No bookings found</p>
            <p className="text-sm text-gray-500 mt-1">Create a new booking to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Start</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">End</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {bookings.map((b, i) => (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0, x: -20, rotateX: -15 }}
                      animate={{ opacity: 1, x: 0, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                      className="border-b border-white/5 hover:bg-white/[0.04] transition-all group cursor-default"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                            <Box className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{b.resource?.name || "—"}</p>
                            <p className="text-xs text-gray-500">{b.resource?.type || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(b.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(b.endTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            b.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : b.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400"
                              : b.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            b.status === "APPROVED" ? "bg-emerald-400" :
                            b.status === "PENDING" ? "bg-amber-400" :
                            b.status === "REJECTED" ? "bg-rose-400" : "bg-gray-400"
                          }`} />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(b.status === "PENDING" || b.status === "APPROVED") && (
                            <button
                              onClick={() => handleAction(b.id, "cancel")}
                              className="text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline transition-colors hover:bg-rose-500/10 px-3 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          )}
                          {isAdmin && viewMode === "ALL" && b.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleAction(b.id, "approve")}
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors hover:bg-emerald-500/10 px-3 py-2 rounded-lg"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(b.id, "reject")}
                                className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors hover:bg-amber-500/10 px-3 py-2 rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-panel rounded-2xl p-8 relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-6">Create Booking</h2>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Resource</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Box className="h-5 w-5 text-gray-500" />
                      </div>
                      <select
                        required
                        value={formData.resourceId}
                        onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                        className={`input-glass w-full pl-11 pr-10 py-3 rounded-xl text-sm appearance-none outline-none ${
                          formData.resourceId ? "text-white" : "text-gray-400"
                        }`}
                      >
                        <option value="" disabled className="bg-[#111116] text-gray-400">
                          {resources.length === 0 ? "No resources available (Create one first!)" : "Select a resource..."}
                        </option>
                        {resources.map(r => (
                          <option key={r.id} value={r.id} className="bg-[#111116] text-white">
                            {r.name} ({r.type}) - Cap: {r.capacity}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Booking Date</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                      </div>
                      <input
                        required
                        type={formData.date ? "date" : "text"}
                        placeholder="Select date"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => {
                          if (!formData.date) e.target.type = "text";
                        }}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:border-primary/50 cursor-pointer ${
                          formData.date ? "text-white" : "text-gray-400"
                        } [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">Start Time</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <input
                          required
                          type={formData.startTime ? "time" : "text"}
                          placeholder="Select start"
                          onFocus={(e) => (e.target.type = "time")}
                          onBlur={(e) => {
                            if (!formData.startTime) e.target.type = "text";
                          }}
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className={`input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:border-primary/50 cursor-pointer ${
                            formData.startTime ? "text-white" : "text-gray-400"
                          } [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-time-picker-indicator]:opacity-0 [&::-webkit-time-picker-indicator]:absolute [&::-webkit-time-picker-indicator]:w-full`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-300">End Time</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-500 group-hover:text-rose-400 transition-colors" />
                        </div>
                        <input
                          required
                          type={formData.endTime ? "time" : "text"}
                          placeholder="Select end"
                          onFocus={(e) => (e.target.type = "time")}
                          onBlur={(e) => {
                            if (!formData.endTime) e.target.type = "text";
                          }}
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className={`input-glass w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:border-primary/50 cursor-pointer ${
                            formData.endTime ? "text-white" : "text-gray-400"
                          } [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-time-picker-indicator]:opacity-0 [&::-webkit-time-picker-indicator]:absolute [&::-webkit-time-picker-indicator]:w-full`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Booking"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
