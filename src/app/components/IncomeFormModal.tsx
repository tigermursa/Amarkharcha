// src/components/IncomeFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import {
  useAddIncomeMutation,
  useUpdateIncomeMutation,
  useGetPeriodsQuery,
} from "@/lib/services/api";
import type { IIncome } from "@/types";

const initialForm = {
  date: new Date().toISOString().split("T")[0],
  source: "",
  amount: "",
  note: "",
  periodId: "",
};

export default function IncomeFormModal({
  open,
  onClose,
  editingIncome,
}: {
  open: boolean;
  onClose: () => void;
  editingIncome: IIncome | null;
}) {
  const [addIncome, { isLoading: adding }] = useAddIncomeMutation();
  const [updateIncome, { isLoading: updating }] = useUpdateIncomeMutation();
  const { data: periods } = useGetPeriodsQuery();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const activePeriod = periods?.find((p) => p.isActive);
  const isEditing = !!editingIncome;

  // Prefill when editing or opening
  useEffect(() => {
    if (!open) return;
    setError("");
    if (editingIncome) {
      setForm({
        date: new Date(editingIncome.date).toISOString().split("T")[0],
        source: editingIncome.source,
        amount: String(editingIncome.amount),
        note: editingIncome.note || "",
        periodId: editingIncome.periodId || activePeriod?._id || "",
      });
    } else {
      setForm({
        ...initialForm,
        periodId: activePeriod?._id || "",
      });
    }
  }, [open, editingIncome, activePeriod]);

  // Escape key + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !adding && !updating) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, adding, updating, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amt = Number(form.amount);
    if (!form.source.trim()) return setError("Source is required");
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("Amount must be positive");
    if (!form.periodId) return setError("Select a period");

    const payload = {
      date: form.date,
      source: form.source.trim(),
      amount: amt,
      note: form.note.trim(),
      periodId: form.periodId,
    };

    try {
      if (isEditing) {
        await updateIncome({
          id: editingIncome._id as string,
          body: payload as any,
        }).unwrap();
        toast.success("Income updated");
      } else {
        await addIncome(payload as any).unwrap();
        toast.success("Income added");
      }
      onClose();
    } catch (err: any) {
      const msg = err?.data?.error || "Something went wrong";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !adding && !updating && onClose()}
        aria-hidden
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold text-foreground">
            {isEditing ? "Edit Income" : "Add Income"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={adding || updating}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-40"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
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
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Period *
            </label>
            <select
              value={form.periodId}
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
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
          <button
            type="button"
            onClick={onClose}
            disabled={adding || updating}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={adding || updating}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {adding || updating ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
