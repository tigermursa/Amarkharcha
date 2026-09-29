// src/app/transactions/page.tsx
"use client";

import { useState, useMemo } from "react";

import {
  useGetTransactionsQuery,
  useGetCategoriesQuery,
} from "@/lib/services/api";
import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";
import PeriodGate from "../components/PeriodGate";

type SortOption = "date_desc" | "date_asc" | "price_desc" | "price_asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
];

export default function TransactionsPage() {
  return (
    <PeriodGate>
      <TransactionsContent />
    </PeriodGate>
  );
}

function TransactionsContent() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("date_desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      sort,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(categoryId && { categoryId }),
    }),
    [page, sort, startDate, endDate, categoryId],
  );

  const { data, isFetching } = useGetTransactionsQuery(queryParams);
  const { data: categories } = useGetCategoriesQuery();

  const renderIcon = (name: string) => {
    const Icon = (FaIcons as any)[name] as IconType | undefined;
    return Icon ? <Icon className="text-lg" /> : null;
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryId("");
    setSort("date_desc");
    setPage(1);
  };

  const hasFilters = startDate || endDate || categoryId || sort !== "date_desc";

  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              All Transactions
            </h1>
            <p className="text-muted-foreground text-sm">
              {total.toLocaleString("en-US")} total transaction
              {total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Sort */}
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Sort by
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All categories</option>
                {categories?.map((c) => (
                  <option key={c._id as string} value={c._id as string}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {hasFilters && (
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {isFetching ? (
            <p className="p-8 text-center text-muted-foreground text-sm">
              Loading...
            </p>
          ) : !data?.transactions.length ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No transactions found</p>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.transactions.map((t) => (
                <div
                  key={t._id as string}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {renderIcon(t.categoryIcon || "FaEllipsisH")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {t.item}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.categoryName} •{" "}
                        {new Date(t.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        {t.periodName && ` • ${t.periodName}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-red-500">
                      -৳{t.price.toLocaleString("en-US")}
                    </p>
                    {t.quantity && t.unit && (
                      <p className="text-xs text-muted-foreground">
                        {t.quantity} {t.unit}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dots-${i}`}
                      className="px-2 text-muted-foreground text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[36px] px-2 py-1.5 text-sm rounded-lg border transition ${
                        page === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Returns a compact page list like: [1, "...", 4, 5, 6, "...", 20]
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  const first = 1;
  const last = total;
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  pages.push(first);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(last);

  return pages;
}
