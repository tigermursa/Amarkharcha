// app/dashboard/page.tsx
"use client";

import {
  useGetDashboardStatsQuery,
  useGetPeriodsQuery,
} from "@/lib/services/api";
import PeriodGate from "../components/PeriodGate";
import DailyChart from "../components/DailyChart";

export default function DashboardPage() {
  return (
    <PeriodGate>
      <DashboardContent />
    </PeriodGate>
  );
}

function DashboardContent() {
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: periods, isLoading } = useGetPeriodsQuery();

  const grandTotal = periods?.reduce((s, p) => s + p.total, 0) || 0;
  const grandCount = periods?.reduce((s, p) => s + p.count, 0) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Period-wise expense report
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatBox
            title="Current Period"
            value={stats?.currentPeriodExpense || 0}
            color="text-primary"
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
            title="All Time"
            value={stats?.totalExpense || 0}
            color="text-red-500"
          />
        </div>

        <DailyChart />

        {/* Period summary table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Period Summary
            </h2>
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                ৳{grandTotal.toLocaleString("en-US")}
              </span>
            </p>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground p-6">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Period
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                      Date Range
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Txns
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periods?.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t border-border hover:bg-muted/30 transition"
                    >
                      <td className="px-4 py-3 text-foreground font-medium">
                        <div className="flex items-center gap-2">
                          {p.name}
                          {p.isActive && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(p.startDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}{" "}
                        →{" "}
                        {new Date(p.endDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {p.count}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-500">
                        ৳{p.total.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                  {periods && periods.length > 0 && (
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td className="px-4 py-3 text-foreground font-bold">
                        Grand Total
                      </td>
                      <td />
                      <td className="px-4 py-3 text-right text-foreground font-bold">
                        {grandCount}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-red-500">
                        ৳{grandTotal.toLocaleString("en-US")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
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
      <p className={`text-lg md:text-2xl font-bold truncate ${color}`}>
        ৳{value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
