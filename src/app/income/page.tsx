// src/app/income/page.tsx
"use client";

import { useState } from "react";

import { toast } from "sonner";
import {
  useGetIncomesQuery,
  useDeleteIncomeMutation,
} from "@/lib/services/api";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import type { IIncome } from "@/types";
import PeriodGate from "@/app/components/PeriodGate";
import { useConfirm } from "@/app/components/ConfirmDialog";
import IncomeFormModal from "@/app/components/IncomeFormModal";

export default function IncomePage() {
  return (
    <PeriodGate>
      <IncomeContent />
    </PeriodGate>
  );
}

function IncomeContent() {
  const { data, isFetching } = useGetIncomesQuery({ limit: 100 });
  const [deleteIncome] = useDeleteIncomeMutation();
  const confirmDialog = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IIncome | null>(null);

  // Group by Month logic
  const groupedIncomes = data?.incomes.reduce(
    (acc, income) => {
      const d = new Date(income.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          label: d.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          }),
          total: 0,
          items: [],
        };
      }
      acc[monthKey].total += income.amount;
      acc[monthKey].items.push(income);
      return acc;
    },
    {} as Record<string, { label: string; total: number; items: IIncome[] }>,
  );

  const sortedMonths = Object.keys(groupedIncomes || {})
    .sort()
    .reverse();

  const handleEdit = (income: IIncome) => {
    setEditingIncome(income);
    setIsModalOpen(true);
  };

  const handleDelete = async (income: IIncome) => {
    const ok = await confirmDialog({
      title: "Delete income?",
      message: `Remove "${income.source}" (৳${income.amount})? This cannot be undone.`,
      confirmText: "Delete",
    });
    if (!ok) return;

    try {
      await deleteIncome(income._id as string).unwrap();
      toast.success("Income deleted");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Income Manager
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your monthly income sources
            </p>
          </div>
          <button
            onClick={() => {
              setEditingIncome(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition active:scale-[0.98]"
          >
            <FaPlus className="text-xs" />
            Add Income
          </button>
        </div>

        {isFetching ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : !data?.incomes.length ? (
          <div className="p-12 rounded-2xl bg-card border border-dashed border-border text-center">
            <FaMoneyBillWave className="mx-auto text-3xl text-muted-foreground mb-3 opacity-50" />
            <p className="text-foreground font-medium">No income records yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Click "Add Income" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMonths.map((monthKey) => {
              const group = groupedIncomes![monthKey];
              return (
                <div key={monthKey} className="space-y-3">
                  {/* Month Header */}
                  <div className="flex items-end justify-between border-b border-border pb-2">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <FaCalendarAlt className="text-primary text-sm" />
                      {group.label}
                    </h2>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                        Total Income
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ৳{group.total.toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>

                  {/* Income List */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                    {group.items.map((income) => (
                      <div
                        key={income._id as string}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                            <FaMoneyBillWave />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {income.source}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(income.date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                              {income.periodName && ` • ${income.periodName}`}
                            </p>
                            {income.note && (
                              <p className="text-xs text-muted-foreground/80 italic truncate mt-0.5">
                                {income.note}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <p className="font-bold text-green-600">
                            +৳{income.amount.toLocaleString("en-US")}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(income)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleDelete(income)}
                              className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <IncomeFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingIncome={editingIncome}
      />
    </div>
  );
}
