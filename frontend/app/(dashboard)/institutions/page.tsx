"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

type Institution = {
  id: string;
  name: string;
  domain: string | null;
};

type ListResponse<T> = {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number };
};

const limit = 10;

export default function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ListResponse<Institution>>("/institutions", {
        params: { page, limit },
      });
      setInstitutions(response.data.data);
      setTotal(response.data.meta?.total ?? 0);
    } catch (err) {
      const e = err as AxiosError<{ error?: { message?: string } }>;
      setError(e.response?.data?.error?.message ?? "Failed to fetch institutions");
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  const create = async () => {
    if (user?.role !== "SUPER_ADMIN") return;
    if (!name) return;
    setCreating(true);
    try {
      await api.post("/institutions", { name, domain: domain || undefined });
      setName("");
      setDomain("");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h1 className="mb-4 text-xl font-semibold text-[var(--text)]">Institutions</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Institution name" />
          <Input value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="Domain" />
          <Button loading={creating} onClick={create} disabled={user?.role !== "SUPER_ADMIN"}>
            Create
          </Button>
        </div>
        {user?.role !== "SUPER_ADMIN" ? (
          <p className="mt-3 text-xs text-[var(--muted)]">
            Institution creation is restricted to SUPER_ADMIN.
          </p>
        ) : null}
      </Card>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-[var(--text)]">{error}</div>
        ) : institutions.length === 0 ? (
          <div className="p-6 text-sm text-[var(--muted)]">No institutions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left text-xs text-[var(--muted)]">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Domain</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--text)]">{item.name}</td>
                    <td className="px-4 py-3 text-[var(--text)]">{item.domain ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          Prev
        </Button>
        <span className="text-sm text-[var(--muted)]">
          Page {page} / {totalPages}
        </span>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
