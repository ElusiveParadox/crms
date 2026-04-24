"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PendingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold text-[var(--text)]">Waiting for approval</h1>
        <p className="text-sm text-[var(--muted)]">
          Your account is pending institution admin approval.
        </p>
        <Button variant="outline" className="w-full" onClick={() => router.replace("/login")}>
          Back to Login
        </Button>
      </Card>
    </div>
  );
}
