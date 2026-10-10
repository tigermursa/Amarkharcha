// src/components/IncomeForm.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAddIncomeMutation, useGetPeriodsQuery } from "@/lib/services/api";

const initialForm = {
  date: new Date().toISOString().split("T")[0],
  source: "",
  amount: "",
  note: "",
  periodId: "",
};

export default function IncomeForm() {
  const [addIncome, { isLoading }] = useAddIncomeMutation();
  const { data: periods } = useGetPeriodsQuery();

  const activePeriod = periods?.find((p) => p.isActive);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const selectedPeriodId = form.periodId || activePeriod?._id || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amt = Number(form.amount);
    if (!form.source.trim()) {
      setError("Source is required");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be positive");
      return;
    }
    if (!selectedPeriodId) {
      setError("Select a period");
      return;
    }

    try {
      await addIncome({
        date: form.date,
        source: form.source.trim(),
        amount: amt,
        note: form.note.trim(),
        periodId: selectedPeriodId,
      } as any).unwrap();
      setForm(initialForm);
      toast.success("Income added");
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to add income";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-card rounded-2xl border border-border"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-foreground">Add Income</h2>
        {activePeriod && (
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Active Period
            </p>
            <p className="text-xs font-medium text-primary truncate max-w-[180px]">
              {activePeriod.name}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Date *
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Source *
        </label>
        <input
          type="text"
          value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}
          required
          placeholder="e.g. Salary, Freelance"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Amount (৳) *
        </label>
        <input
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          placeholder="e.g. 20000"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Period *
        </label>
        <select
          value={selectedPeriodId}
          onChange={(e) => setForm({ ...form, periodId: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select period</option>
          {periods?.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} {p.isActive ? "(active)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Note
        </label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
          placeholder="Optional"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium active:scale-[0.98] transition disabled:opacity-50"
      >
        {isLoading ? "Adding..." : "Add Income"}
      </button>
    </form>
  );
}
