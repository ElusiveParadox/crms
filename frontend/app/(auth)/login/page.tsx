"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Eye, EyeOff, Loader2, UserCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel rounded-2xl p-8 sm:p-10 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/5">
          {/* Subtle glow effect behind the form */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-tr from-primary to-primary-dark rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <Lock className="text-white w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to manage your campus resources</p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <UserCircle className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass block w-full pl-11 pr-4 py-3 rounded-xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-xs text-primary hover:text-primary-light transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass block w-full pl-11 pr-12 py-3 rounded-xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-primary text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="relative z-10 mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:text-primary-light hover:underline transition-all">
              Create one now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
