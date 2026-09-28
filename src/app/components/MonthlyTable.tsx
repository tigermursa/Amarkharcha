// components/MonthlyTable.tsx
"use client";

import { useGetMonthlyReportQuery } from "@/lib/services/api";

export default function MonthlyTable() {
  const { data, isLoading } = useGetMonthlyReportQuery({ months: 12 });

  if (isLoading) {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm">Loading report...</p>
      </div>
    );
  }

  const grandTotal = data?.reduce((sum, m) => sum + m.total, 0) || 0;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Monthly Summary
        </h2>
        <p className="text-sm text-muted-foreground">
          12-month total:{" "}
          <span className="font-semibold text-foreground">
            ৳{grandTotal.toLocaleString("en-US")}
          </span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Month
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Transactions
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((m) => (
              <tr
                key={m.month}
                className="border-t border-border hover:bg-muted/30 transition"
              >
                <td className="px-4 py-3 text-foreground font-medium">
                  {m.label}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {m.count}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-red-500">
                  ৳{m.total.toLocaleString("en-US")}
                </td>
              </tr>
            ))}
            {data && data.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="px-4 py-3 text-foreground font-bold">
                  Grand Total
                </td>
                <td className="px-4 py-3 text-right text-foreground font-bold">
                  {data.reduce((s, m) => s + m.count, 0)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-500">
                  ৳{grandTotal.toLocaleString("en-US")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
