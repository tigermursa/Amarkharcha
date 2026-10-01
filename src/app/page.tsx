// app/page.tsx
"use client";

import {
  useGetDashboardStatsQuery,
  useGetTransactionsQuery,
  useGetPeriodsQuery,
} from "@/lib/services/api";
import { useSession } from "@/lib/auth-client";
import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";
import ExpenseForm from "./components/ExpenseForm";
import PeriodGate from "./components/PeriodGate";
import CountUp from "./components/CountUp";

export default function HomePage() {
  return (
    <PeriodGate>
      <HomeContent />
    </PeriodGate>
  );
}

function HomeContent() {
  const { data: session } = useSession();
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: periods } = useGetPeriodsQuery();
  const activePeriod = periods?.find((p) => p.isActive);

  // Show recent transactions from the active period
  const { data: transactionsData } = useGetTransactionsQuery(
    activePeriod ? { periodId: activePeriod._id, limit: 10 } : { limit: 10 },
  );

  const renderIcon = (name: string) => {
    const Icon = (FaIcons as any)[name] as IconType | undefined;
    return Icon ? <Icon className="text-lg" /> : null;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, {session?.user.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {activePeriod
              ? `Current period: ${activePeriod.name}`
              : "Your expense overview"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Current Period"
            value={stats?.currentPeriodExpense || 0}
            color="text-primary"
          />
          <StatCard
            title="Today"
            value={stats?.todayExpense || 0}
            color="text-orange-500"
          />
          <StatCard
            title="This Month"
            value={stats?.monthExpense || 0}
            color="text-blue-500"
          />
          <StatCard
            title="All Time"
            value={stats?.totalExpense || 0}
            color="text-red-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ExpenseForm />

          <div className="p-6 bg-card rounded-2xl border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Recent Transactions
              {activePeriod && (
                <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                  {activePeriod.name}
                </span>
              )}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {transactionsData?.transactions.map((t) => (
                <div
                  key={t._id as string}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {renderIcon(t.categoryIcon || "FaEllipsisH")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {t.item}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {t.categoryName} •{" "}
                        {new Date(t.date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-red-500">-৳{t.price}</p>
                    {t.quantity && t.unit && (
                      <p className="text-xs text-muted-foreground">
                        {t.quantity} {t.unit}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!transactionsData?.transactions ||
                transactionsData.transactions.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No transactions in this period yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">
        {title}
      </p>
      {/* <CountUp
        value={value}
        className={`text-lg md:text-2xl font-bold truncate ${color}`}
      /> */}
    </div>
  );
}
