"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Search, Plus, Loader2, X } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", type: "CLASSROOM", capacity: 30 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchInstitutionResources = async () => {
    try {
      // Use institution search to find resources indirectly
      // The backend doesn't have a direct "get resources" endpoint,
      // but we can search institutions which returns institution data
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const u = JSON.parse(stored);
      
      const res = await api.get(`/resources`);
      setResources(res.data?.data || res.data || []);
    } catch {
      // handle gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutionResources();
  }, []);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/resources", formData);
      toast.success("Resource created!");
      setShowCreateModal(false);
      setFormData({ name: "", type: "CLASSROOM", capacity: 30 });
      fetchInstitutionResources();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to create resource");
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const resourceTypes = [
    { value: "CLASSROOM", label: "Classroom", emoji: "🏫" },
    { value: "LAB", label: "Lab", emoji: "🔬" },
    { value: "AUDITORIUM", label: "Auditorium", emoji: "🎭" },
  ];

  const filteredResources = resources.filter((r: any) =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resources</h1>
          <p className="text-gray-400 text-sm mt-1">Browse and manage campus resources</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass pl-10 pr-4 py-2.5 rounded-xl text-sm w-64"
              placeholder="Search resources..."
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Resources grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <Box className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No resources found</p>
          <p className="text-sm text-gray-500 mt-1">
            Create your first resource to get started.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredResources.map((r: any, i: number) => {
            const typeInfo = resourceTypes.find((t) => t.value === r.type) || { emoji: "📦", label: r.type };
            return (
              <motion.div
                key={r.id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                  <div className="glass-panel rounded-2xl p-6 hover:bg-surface-hover hover:border-primary/30 transition-all duration-300 group shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-white/[0.08]">
                    <div className="text-3xl mb-3">{typeInfo.emoji}</div>
                    <h3 className="text-lg font-semibold text-white mb-1">{r.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{typeInfo.label}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Capacity: {r.capacity}</span>
                      <span className={`px-2 py-0.5 rounded-full ${r.isActive !== false ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {r.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create Resource Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-panel rounded-2xl p-8 relative"
          >
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Add Resource</h2>
            <form onSubmit={handleCreateResource} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="e.g. Room 101"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {resourceTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.value })}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        formData.type === t.value
                          ? "bg-primary/20 border-primary text-primary border"
                          : "bg-white/5 border-transparent text-gray-400 border hover:bg-white/10"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Capacity</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={formData.capacity || ""}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : ("" as any) })}
                  className="input-glass w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Resource"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
