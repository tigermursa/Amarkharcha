// src/components/MonthlyIncomeTable.tsx
"use client";

import { useGetMonthlyIncomeQuery } from "@/lib/services/api";

export default function MonthlyIncomeTable() {
  const { data, isFetching } = useGetMonthlyIncomeQuery({ months: 12 });

  if (isFetching) {
    return (
      <div className="p-6 bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground text-sm">Loading report...</p>
      </div>
    );
  }

  const grandIncome = data?.reduce((s, m) => s + m.income, 0) || 0;
  const grandExpense = data?.reduce((s, m) => s + m.expense, 0) || 0;
  const grandNet = grandIncome - grandExpense;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Monthly Income & Expense
        </h2>
        <p className="text-xs text-muted-foreground">
          12-month net:{" "}
          <span
            className={`font-semibold ${grandNet >= 0 ? "text-green-600" : "text-red-500"}`}
          >
            ৳{grandNet.toLocaleString("en-US")}
          </span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Month
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Income
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Expense
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Net
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
                <td className="px-4 py-3 text-right text-green-600 font-semibold">
                  ৳{m.income.toLocaleString("en-US")}
                </td>
                <td className="px-4 py-3 text-right text-red-500 font-semibold">
                  ৳{m.expense.toLocaleString("en-US")}
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${m.net >= 0 ? "text-green-600" : "text-red-500"}`}
                >
                  ৳{m.net.toLocaleString("en-US")}
                </td>
              </tr>
            ))}
            {data && data.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/40">
                <td className="px-4 py-3 font-bold text-foreground">
                  Grand Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600">
                  ৳{grandIncome.toLocaleString("en-US")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-500">
                  ৳{grandExpense.toLocaleString("en-US")}
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold ${grandNet >= 0 ? "text-green-600" : "text-red-500"}`}
                >
                  ৳{grandNet.toLocaleString("en-US")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
