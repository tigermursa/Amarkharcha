// src/components/CategoryPieChart.tsx
"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGetCategoryBreakdownQuery } from "@/lib/services/api";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#a855f7",
  "#84cc16",
  "#eab308",
  "#6366f1",
  "#f43f5e",
  "#10b981",
  "#0ea5e9",
  "#d946ef",
  "#64748b",
];

export default function CategoryPieChart({ periodId }: { periodId?: string }) {
  const { data, isFetching } = useGetCategoryBreakdownQuery(
    periodId ? { periodId } : undefined,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data?.total || 0;

  const chartData = useMemo(() => {
    if (!data?.categories) return [];
    const top = data.categories.slice(0, 8);
    const rest = data.categories.slice(8);
    const restTotal = rest.reduce((s, c) => s + c.total, 0);

    const result = top.map((c) => ({
      name: c.name,
      value: c.total,
      count: c.count,
    }));

    if (restTotal > 0) {
      result.push({
        name: `Other (${rest.length})`,
        value: restTotal,
        count: rest.reduce((s, c) => s + c.count, 0),
      });
    }
    return result;
  }, [data]);

  if (isFetching) {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm">Loading chart...</p>
      </div>
    );
  }

  if (!chartData.length || total === 0) {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Category Breakdown
        </h2>
        <p className="text-muted-foreground text-sm py-8 text-center">
          No expenses to display
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-card rounded-2xl border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Category Breakdown
          </h2>
          <p className="text-xs text-muted-foreground">Where your money went</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-red-500">
            ৳{total.toLocaleString("en-US")}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_1fr] gap-4 items-center">
        <div className="w-full h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="50%"
                paddingAngle={2}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                stroke="hsl(var(--card))"
                strokeWidth={2}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={
                      activeIndex === null || activeIndex === i ? 1 : 0.4
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value, name) => [
                  `৳${Number(value ?? 0).toLocaleString("en-US")}`,
                  String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 max-h-64 md:max-h-72 overflow-y-auto pr-1">
          {chartData.map((c, i) => {
            const pct = total > 0 ? (c.value / total) * 100 : 0;
            const isDim = activeIndex !== null && activeIndex !== i;
            return (
              <div
                key={c.name}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition cursor-default ${
                  isDim ? "opacity-50" : "opacity-100"
                } ${activeIndex === i ? "bg-muted" : ""}`}
              >
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.count} {c.count === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">
                    ৳{c.value.toLocaleString("en-US")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pct.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
