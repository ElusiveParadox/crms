"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Role } from "@/types/auth";

type RegisterResponse = {
  id: string;
  email: string;
  role: string;
  institutionId: string | null;
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [institutionName, setInstitutionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post<RegisterResponse>("/auth/register", {
        email,
        password,
        role,
        institutionName: institutionName.trim() || undefined,
      });

      const loginRes = await api.post<{ token: string }>("/auth/login", { email, password });
      localStorage.setItem("crms-token", loginRes.data.token);

      if (role === "STUDENT" || role === "FACULTY" || role === "ADMIN") {
        setPending(true);
        setMessage("Account created. Waiting for institution approval.");
        return;
      }

      router.replace("/bookings");
    } catch (err) {
      const responseError = err as AxiosError<{ error?: { message?: string } }>;
      const errMessage = responseError.response?.data?.error?.message ?? "Registration failed";
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Create account</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Register and connect to your institution.
          </p>
        </div>
        {pending ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)]">
              Waiting for approval
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.replace("/login")}>
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text)]">Email</label>
              <Input
                type="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text)]">Password</label>
              <Input
                type="password"
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text)]">Role</label>
              <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option value="STUDENT">STUDENT</option>
                <option value="FACULTY">FACULTY</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text)]">Institution Name</label>
              <Input
                value={institutionName}
                required
                onChange={(event) => setInstitutionName(event.target.value)}
              />
            </div>
            {error ? (
              <p className="rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-xl border border-[var(--card-border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
                {message}
              </p>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Register
            </Button>
            <p className="text-center text-xs text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--text)] underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
