"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { AuthUser } from "@/types/auth";

type MeResponse = {
  success: boolean;
  data: AuthUser;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [approved, setApproved] = useState(true);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await api.get<MeResponse>("/auth/me");
        if (mounted) {
          const nextUser = response.data.data;
          const isApproved =
            nextUser.isApproved !== undefined
              ? nextUser.isApproved
              : nextUser.status
                ? nextUser.status === "APPROVED" || nextUser.status === "ACTIVE"
                : true;

          setUser(nextUser);
          setApproved(isApproved);

          if (!isApproved && !pathname.startsWith("/pending")) {
            router.replace("/pending");
          }
        }
      } catch (error) {
        if (!mounted) return;
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        if (status === 401 || status === 403) {
          setUser(null);
          setApproved(false);
          if (!pathname.startsWith("/login")) {
            router.replace("/login");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  return { user, loading, approved };
}
