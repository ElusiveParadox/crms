"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Role } from "@/types/auth";

type User = {
  id: string;
  email: string;
  role: Role;
};

type ListResponse<T> = {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number };
};

const limit = 10;

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRoles, setPendingRoles] = useState<Record<string, Role>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ListResponse<User>>("/users", {
        params: { page, limit },
      });
      setUsers(response.data.data);
      setPendingRoles(
        response.data.data.reduce<Record<string, Role>>((acc, user) => {
          acc[user.id] = user.role;
          return acc;
        }, {})
      );
      setTotal(response.data.meta?.total ?? 0);
    } catch (err) {
      const e = err as AxiosError<{ error?: { message?: string } }>;
      setError(e.response?.data?.error?.message ?? "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page]);

  const saveRole = async (id: string) => {
    if (!(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) return;
    setActionId(id);
    try {
      await api.patch(`/users/${id}`, { role: pendingRoles[id] });
      await load();
    } finally {
      setActionId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h1 className="text-xl font-semibold text-[var(--text)]">Users</h1>
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
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-[var(--muted)]">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left text-xs text-[var(--muted)]">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--text)]">{user.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={pendingRoles[user.id] ?? user.role}
                        onChange={(event) =>
                          setPendingRoles((prev) => ({
                            ...prev,
                            [user.id]: event.target.value as Role,
                          }))
                        }
                        disabled={actionId === user.id}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveRole(user.id)}
                        disabled={
                          pendingRoles[user.id] === user.role ||
                          !(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")
                        }
                        loading={actionId === user.id}
                      >
                        Save
                      </Button>
                    </td>
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
