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

function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
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
    return Icon ? <Icon className="text-base" /> : null;
  };

  const transactions = transactionsData?.transactions ?? [];

  // Group by day for the ledger
  const groups: {
    key: string;
    label: string;
    total: number;
    items: typeof transactions;
  }[] = [];
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = d.toDateString();
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label: dayLabel(d), total: 0, items: [] };
      groups.push(g);
    }
    g.total += Number(t.price) || 0;
    g.items.push(t);
  });

  let rowIndex = 0;

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes ledger-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        .ledger-row { animation: ledger-in .5s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .ledger-row { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
          <div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Hi, {session?.user.name?.split(" ")[0]}
            </h1>
          </div>
          {activePeriod && (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {activePeriod.name}
            </span>
          )}
        </header>

        {/* Hero: the one bold moment */}
        <section className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <p className="text-sm text-background/60">
              Spent {activePeriod ? "this period" : "so far"}
            </p>
            <CountUp
              value={stats?.currentPeriodExpense || 0}
              className="mt-2 block text-5xl font-semibold leading-none tracking-tighter tabular-nums sm:text-6xl md:text-8xl"
            />

            <dl className="mt-8 grid grid-cols-3 border-t border-background/15 pt-5 md:mt-12">
              {[
                { label: "Today", value: stats?.todayExpense || 0 },
                { label: "This month", value: stats?.monthExpense || 0 },
                { label: "All time", value: stats?.totalExpense || 0 },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`min-w-0 ${i > 0 ? "border-l border-background/15 pl-4 md:pl-8" : ""}`}
                >
                  <dt className="truncate text-xs text-background/60 md:text-sm">
                    {s.label}
                  </dt>
                  <dd>
                    <CountUp
                      value={s.value}
                      className="mt-1 block truncate text-base font-medium tabular-nums md:text-2xl"
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Form + Ledger */}
        <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              <ExpenseForm />
            </div>
          </div>

          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card">
              <div className="flex items-baseline justify-between px-5 pb-4 pt-5 md:px-7 md:pt-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent spending
                </h2>
                {transactions.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Last {transactions.length}
                  </span>
                )}
              </div>

              <div className="max-h-[560px] overflow-y-auto px-5 pb-5 md:px-7 md:pb-6">
                {groups.map((g) => (
                  <div key={g.key} className="mb-2 last:mb-0">
                    <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between border-b border-dashed border-border bg-card/95 px-1 py-2 backdrop-blur">
                      <span className="text-sm font-medium text-foreground">
                        {g.label}
                      </span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        ৳{g.total.toLocaleString("en-US")}
                      </span>
                    </div>

                    <ul>
                      {g.items.map((t) => (
                        <li
                          key={t._id as string}
                          className="ledger-row flex items-center justify-between gap-3 py-3"
                          style={{ animationDelay: `${rowIndex++ * 45}ms` }}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {renderIcon(t.categoryIcon || "FaEllipsisH")}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {t.item}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {t.categoryName}
                                {t.quantity && t.unit
                                  ? ` · ${t.quantity} ${t.unit}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <p className="shrink-0 font-semibold tabular-nums text-foreground">
                            −৳{t.price}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="py-14 text-center">
                    <p className="font-medium text-foreground">
                      Nothing logged yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add your first expense and it will show up here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
