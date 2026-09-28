// app/page.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  useGetDashboardStatsQuery,
  useGetTransactionsQuery,
  useGetCategoriesQuery,
} from "@/lib/services/api";

import { IconType } from "react-icons";
import * as FaIcons from "react-icons/fa";
import ExpenseForm from "./components/ExpenseForm";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const { data: stats } = useGetDashboardStatsQuery();
  const { data: transactionsData } = useGetTransactionsQuery({ limit: 10 });
  const { data: categories } = useGetCategoriesQuery();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!session) return null;

  const renderIcon = (iconName: string) => {
    const Icon = (FaIcons as any)[iconName] as IconType;
    return Icon ? <Icon className="text-lg" /> : null;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* হেডার */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              স্বাগতম, {session.user.name}
            </h1>
            <p className="text-muted-foreground">আপনার খরচের সারসংক্ষেপ</p>
          </div>
        </div>

        {/* স্ট্যাটিস্টিক কার্ড */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="ব্যালেন্স"
            value={stats?.balance || 0}
            color="text-blue-500"
          />
          <StatCard
            title="আয়"
            value={stats?.totalIncome || 0}
            color="text-green-500"
          />
          <StatCard
            title="ব্যয়"
            value={stats?.totalExpense || 0}
            color="text-red-500"
          />
          <StatCard
            title="লেনদেন"
            value={stats?.transactionCount || 0}
            color="text-purple-500"
            isCurrency={false}
          />
        </div>

        {/* মূল কন্টেন্ট */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* খরচ যোগ ফর্ম */}
          <ExpenseForm />

          {/* সাম্প্রতিক লেনদেন */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">
              সাম্প্রতিক লেনদেন
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
                        {new Date(t.date).toLocaleDateString("bn-BD")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        t.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}৳{t.price}
                    </p>
                    {t.quantity && (
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
                  এখনো কোনো লেনদেন নেই
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// স্ট্যাট কার্ড কম্পোনেন্ট
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
        {value.toLocaleString("bn-BD")}
      </p>
    </div>
  );
}
