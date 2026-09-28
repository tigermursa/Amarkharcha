// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useGetDashboardStatsQuery } from "@/lib/services/api";
import MonthlyTable from "../components/MonthlyTable";
import DailyChart from "../components/DailyChart";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { data: stats } = useGetDashboardStatsQuery();

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  if (isPending) return null;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Your personal expense reports
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatBox
            title="Total Expense"
            value={stats?.totalExpense || 0}
            color="text-red-500"
          />
          <StatBox
            title="Today"
            value={stats?.todayExpense || 0}
            color="text-orange-500"
          />
          <StatBox
            title="This Month"
            value={stats?.monthExpense || 0}
            color="text-blue-500"
          />
          <StatBox
            title="Transactions"
            value={stats?.transactionCount || 0}
            color="text-purple-500"
            isCurrency={false}
          />
        </div>

        {/* Daily bar chart */}
        <DailyChart />

        {/* Monthly table */}
        <MonthlyTable />
      </div>
    </div>
  );
}

function StatBox({
  title,
  value,
  color,
  isCurrency = true,
}: {
  title: string;
  value: number;
  color: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">
        {title}
      </p>
      <p className={`text-lg md:text-2xl font-bold truncate ${color}`}>
        {isCurrency ? "৳" : ""}
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
