"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { Role } from "@/types/auth";

type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type Booking = {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  resourceId: string;
  userId: string;
  user?: { id: string; email: string; role: Role };
  resource?: { id: string; name: string; type: string };
};

type Resource = { id: string; name: string };

type ListResponse<T> = {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number };
};

type MeResponse = { success: boolean; data: { role: Role } };

const limit = 10;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [role, setRole] = useState<Role>("STUDENT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [status, setStatus] = useState("");
  const [resource, setResource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [createResource, setCreateResource] = useState("");
  const [createStart, setCreateStart] = useState("");
  const [createEnd, setCreateEnd] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: bookingsRes }, { data: resourcesRes }, { data: meRes }] = await Promise.all([
        api.get<ListResponse<Booking>>("/bookings", {
          params: {
            page,
            limit,
            status: status || undefined,
            resourceId: resource || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        }),
        api.get<ListResponse<Resource>>("/resources", { params: { page: 1, limit: 100 } }),
        api.get<MeResponse>("/auth/me"),
      ]);

      setBookings(bookingsRes.data);
      setTotal(bookingsRes.meta?.total ?? 0);
      setResources(resourcesRes.data);
      setRole(meRes.data.role);
    } catch (err) {
      const e = err as AxiosError<{ error?: { message?: string } }>;
      setError(e.response?.data?.error?.message ?? "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, status, resource, startDate, endDate]);

  const createBooking = async () => {
    if (!createResource || !createStart || !createEnd) return;
    if (!(role === "STUDENT" || role === "FACULTY" || role === "ADMIN" || role === "SUPER_ADMIN")) return;
    setCreating(true);
    try {
      await api.post("/bookings", {
        resourceId: createResource,
        startTime: createStart,
        endTime: createEnd,
      });
      setCreateResource("");
      setCreateStart("");
      setCreateEnd("");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const runAction = async (id: string, action: "approve" | "reject" | "cancel") => {
    setActionId(id);
    try {
      await api.patch(`/bookings/${id}/${action}`);
      await load();
    } finally {
      setActionId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-[var(--text)]">Bookings</h1>
          <Badge>Total {total}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Select value={resource} onChange={(event) => setResource(event.target.value)}>
            <option value="">All resources</option>
            {resources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <Button
            variant="outline"
            onClick={() => {
              setStatus("");
              setResource("");
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-4 text-base font-semibold text-[var(--text)]">Create Booking</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={createResource} onChange={(event) => setCreateResource(event.target.value)}>
            <option value="">Select resource</option>
            {resources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Input type="datetime-local" value={createStart} onChange={(event) => setCreateStart(event.target.value)} />
          <Input type="datetime-local" value={createEnd} onChange={(event) => setCreateEnd(event.target.value)} />
          <Button
            loading={creating}
            disabled={!(role === "STUDENT" || role === "FACULTY" || role === "ADMIN" || role === "SUPER_ADMIN")}
            onClick={createBooking}
          >
            Create
          </Button>
        </div>
        {role === "FACULTY" ? (
          <p className="mt-3 text-xs text-[var(--muted)]">Faculty bookings are submitted with priority by backend rules.</p>
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
        ) : bookings.length === 0 ? (
          <div className="p-6 text-sm text-[var(--muted)]">No bookings found.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-left text-xs text-[var(--muted)]">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="px-4 py-3 text-[var(--text)]">{item.user?.email ?? item.userId}</td>
                      <td className="px-4 py-3 text-[var(--text)]">{item.resource?.name ?? item.resourceId}</td>
                      <td className="px-4 py-3 text-[var(--text)]">
                        {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{item.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={item.status !== "PENDING" || actionId === item.id}
                                onClick={() => runAction(item.id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={item.status !== "PENDING" || actionId === item.id}
                                onClick={() => runAction(item.id, "reject")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={item.status === "CANCELLED" || actionId === item.id}
                            onClick={() => runAction(item.id, "cancel")}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 lg:hidden">
              {bookings.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="space-y-1 text-sm text-[var(--text)]">
                    <p>{item.user?.email ?? item.userId}</p>
                    <p>{item.resource?.name ?? item.resourceId}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
                    </p>
                    <Badge>{item.status}</Badge>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={item.status !== "PENDING" || actionId === item.id}
                            onClick={() => runAction(item.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={item.status !== "PENDING" || actionId === item.id}
                            onClick={() => runAction(item.id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={item.status === "CANCELLED" || actionId === item.id}
                        onClick={() => runAction(item.id, "cancel")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
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
