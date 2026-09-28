// components/PeriodGate.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useGetPeriodsQuery } from "@/lib/services/api";

export default function PeriodGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const { data: periods, isLoading } = useGetPeriodsQuery();
  const router = useRouter();

  useEffect(() => {
    if (isPending || isLoading) return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (periods && periods.length === 0) {
      router.push("/onboarding");
      return;
    }
  }, [session, isPending, isLoading, periods, router]);

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!session || !periods || periods.length === 0) return null;

  return <>{children}</>;
}
