// app/onboarding/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  useCreatePeriodMutation,
  useGetPeriodsQuery,
} from "@/lib/services/api";

const getDefaultRange = () => {
  const today = new Date();
  const end = new Date(today);
  end.setMonth(end.getMonth() + 1);
  return {
    start: today.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: periods, isLoading } = useGetPeriodsQuery();
  const [createPeriod, { isLoading: creating }] = useCreatePeriodMutation();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(getDefaultRange().start);
  const [endDate, setEndDate] = useState(getDefaultRange().end);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending || isLoading) return;
    if (!session) {
      router.push("/login");
      return;
    }
    // Already has periods → go home
    if (periods && periods.length > 0) {
      router.push("/");
    }
  }, [session, isPending, isLoading, periods, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createPeriod({
        name: name.trim(),
        startDate,
        endDate,
        setActive: true,
      }).unwrap();
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err?.data?.error || "Failed to create period");
    }
  };

  if (isPending || isLoading) return null;
  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg p-6 md:p-8 rounded-2xl bg-card border border-border">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to Amar Kharcha!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first period to start tracking. A period is your expense
            cycle, e.g. <strong>28 Sep → 28 Oct</strong>.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Period Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. October Salary Cycle"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Period & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
