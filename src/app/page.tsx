// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  useGetDashboardStatsQuery,
  useGetTransactionsQuery,
} from "@/lib/services/api";

import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";
import ExpenseForm from "./components/ExpenseForm";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const { data: stats } = useGetDashboardStatsQuery();
  const { data: transactionsData } = useGetTransactionsQuery({ limit: 10 });

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const renderIcon = (name: string) => {
    const Icon = (FaIcons as any)[name] as IconType | undefined;
    return Icon ? <Icon className="text-lg" /> : null;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, {session.user.name}
          </h1>
          <p className="text-muted-foreground">Your expense overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Expense"
            value={stats?.totalExpense || 0}
            color="text-red-500"
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
            title="Transactions"
            value={stats?.transactionCount || 0}
            color="text-purple-500"
            isCurrency={false}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ExpenseForm />

          <div className="p-6 bg-card rounded-2xl border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Recent Transactions
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {transactionsData?.transactions.map((t) => (
                <div
                  key={t._id as string}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {renderIcon(t.categoryIcon || "FaEllipsisH")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t.item}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.categoryName} •{" "}
                        {new Date(t.date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
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
                  No transactions yet
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
  isCurrency = true,
}: {
  title: string;
  value: number;
  color: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={`text-xl md:text-2xl font-bold ${color}`}>
        {isCurrency ? "৳" : ""}
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
