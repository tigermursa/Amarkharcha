// src/components/EditTransactionModal.tsx
"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import {
  useUpdateTransactionMutation,
  useGetCategoriesQuery,
} from "@/lib/services/api";
import { UNITS } from "@/lib/default-categories";
import type { ITransaction } from "@/types";

export default function EditTransactionModal({
  open,
  transaction,
  onClose,
}: {
  open: boolean;
  transaction: ITransaction | null;
  onClose: () => void;
}) {
  const [updateTransaction, { isLoading }] = useUpdateTransactionMutation();
  const { data: categories } = useGetCategoriesQuery();

  const [form, setForm] = useState({
    date: "",
    item: "",
    quantity: "",
    unit: "",
    price: "",
    categoryId: "",
    note: "",
  });
  const [error, setError] = useState("");

  // Prefill when opening
  useEffect(() => {
    if (!open || !transaction) return;
    setError("");
    setForm({
      date: new Date(transaction.date).toISOString().split("T")[0],
      item: transaction.item,
      quantity:
        transaction.quantity != null ? String(transaction.quantity) : "",
      unit: transaction.unit || "",
      price: String(transaction.price),
      categoryId: transaction.categoryId,
      note: transaction.note || "",
    });
  }, [open, transaction]);

  // Escape key + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, isLoading, onClose]);

  if (!open || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amt = Number(form.price);
    if (!form.item.trim()) {
      setError("Item is required");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Price must be positive");
      return;
    }
    if (!form.categoryId) {
      setError("Category is required");
      return;
    }

    try {
      await updateTransaction({
        id: transaction._id as string,
        body: {
          date: form.date,
          item: form.item.trim(),
          quantity: form.quantity ? Number(form.quantity) : undefined,
          unit: form.unit || undefined,
          price: amt,
          categoryId: form.categoryId,
          note: form.note,
        } as any,
      }).unwrap();
      toast.success("Transaction updated");
      onClose();
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to update";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
        aria-hidden
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold text-foreground">Edit Transaction</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition disabled:opacity-40"
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

          {/* Date */}
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

          {/* Item */}
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Item *
            </label>
            <input
              type="text"
              value={form.item}
              onChange={(e) => setForm({ ...form, item: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None</option>
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Price (৳) *
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Category *
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c._id as string} value={c._id as string}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
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

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
