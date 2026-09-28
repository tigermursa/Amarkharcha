// components/DailyChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetDailyReportQuery } from "@/lib/services/api";

export default function DailyChart() {
  const { data, isLoading } = useGetDailyReportQuery({ days: 30 });

  if (isLoading) {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm">Loading chart...</p>
      </div>
    );
  }

  const total = data?.reduce((s, d) => s + d.total, 0) || 0;
  const avg = data && data.length ? total / data.length : 0;

  // Show every 3rd label on small screens by rotating; but we'll let recharts handle it.
  const chartData = data?.map((d) => ({
    name: d.label,
    total: d.total,
  }));

  return (
    <div className="p-5 bg-card rounded-2xl border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Daily Expense (Last 30 days)
          </h2>
          <p className="text-xs text-muted-foreground">
            Average per day:{" "}
            <span className="font-semibold text-foreground">
              ৳{avg.toFixed(0)}
            </span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          30-day total:{" "}
          <span className="font-semibold text-foreground">
            ৳{total.toLocaleString("en-US")}
          </span>
        </p>
      </div>

      <div className="w-full h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `৳${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`৳${value}`, "Expense"]}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
