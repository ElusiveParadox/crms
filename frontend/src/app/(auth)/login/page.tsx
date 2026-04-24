"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

type LoginResponse = {
  token: string;
  user: Record<string, unknown>;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("crms-token", data.token);
      router.replace("/bookings");
    } catch (err) {
      const errorResponse = err as AxiosError<{ error?: { message?: string } }>;
      const message = errorResponse.response?.data?.error?.message ?? "Invalid credentials";
      setError(message.includes("approval") ? "Waiting for approval" : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Sign in to manage campus resources.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text)]">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@university.edu"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text)]">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error ? (
            <p className="rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/register")}>
            Register
          </Button>
          <p className="text-center text-xs text-[var(--muted)]">
            New user?{" "}
            <Link href="/register" className="text-[var(--text)] underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
