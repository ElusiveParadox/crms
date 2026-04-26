"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Eye, EyeOff, Loader2, UserCircle, Mail, Building2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

const ROLES = [
  { id: "STUDENT", label: "Student" },
  { id: "FACULTY", label: "Faculty" },
  { id: "ADMIN", label: "Admin" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [institutionName, setInstitutionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
        role,
        ...(institutionName && { institutionName }),
      };

      await api.post("/auth/register", payload);
      
      toast.success("Registration successful! Please log in.");
      router.push("/login"); // Redirect to login
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-dark flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel rounded-2xl p-8 sm:p-10 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5">
          {/* Subtle glow effect behind the form */}
          <div className="absolute top-0 right-0 w-3/4 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-primary rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            >
              <UserCircle className="text-white w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Join the platform to access your dashboard</p>
          </div>

          <form onSubmit={handleRegister} className="relative z-10 space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass block w-full pl-11 pr-4 py-3 rounded-xl text-sm placeholder-gray-500 relative z-20 pointer-events-auto focus:ring-2 focus:ring-primary"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass block w-full pl-11 pr-4 py-3 rounded-xl text-sm placeholder-gray-500 relative z-20 pointer-events-auto focus:ring-2 focus:ring-primary"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      role === r.id 
                        ? 'bg-primary/20 border-primary text-primary border' 
                        : 'bg-white/5 border-transparent text-gray-400 border hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {role !== "SUPER_ADMIN" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="text-sm font-medium text-gray-300 ml-1">Institution Name (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="input-glass block w-full pl-11 pr-4 py-3 rounded-xl text-sm placeholder-gray-500"
                      placeholder="e.g. Acme University"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-primary text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            <div className="relative z-10 mt-8 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:text-primary-light hover:underline transition-all">
                Sign in instead
              </Link>
            </div>
          </div>
      </motion.div>
    </div>
  );
}
