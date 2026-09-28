// components/ExpenseForm.tsx
"use client";

import { useState } from "react";
import {
  useAddTransactionMutation,
  useAddCategoryMutation,
  useGetCategoriesQuery,
  useGetPeriodsQuery,
} from "@/lib/services/api";
import { CATEGORY_ICONS, UNITS } from "@/lib/default-categories";
import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";

const initialForm = {
  date: new Date().toISOString().split("T")[0],
  item: "",
  quantity: "",
  unit: "",
  price: "",
  categoryId: "",
  note: "",
};

export default function ExpenseForm() {
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const [addCategory, { isLoading: addingCategory }] = useAddCategoryMutation();
  const { data: categories } = useGetCategoriesQuery();
  const { data: periods } = useGetPeriodsQuery();

  const activePeriod = periods?.find((p) => p.isActive);

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "FaEllipsisH",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await addTransaction({
        date: form.date,
        item: form.item,
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        unit: form.unit || undefined,
        price: parseFloat(form.price),
        categoryId: form.categoryId,
        note: form.note,
        // periodId omitted → server uses active period
      } as any).unwrap();

      setForm(initialForm);
    } catch (err: any) {
      setError(err?.data?.error || "Failed to add expense");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const created = await addCategory(newCategory).unwrap();
      setForm((f) => ({ ...f, categoryId: created._id as string }));
      setNewCategory({ name: "", icon: "FaEllipsisH" });
      setShowNewCategory(false);
    } catch (err: any) {
      alert(err?.data?.error || "Failed to create category");
    }
  };

  const renderIcon = (name: string) => {
    const Icon = (FaIcons as any)[name] as IconType | undefined;
    return Icon ? <Icon /> : null;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-card rounded-2xl border border-border"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-foreground">Add Expense</h2>
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
          Item *
        </label>
        <input
          type="text"
          value={form.item}
          onChange={(e) => setForm({ ...form, item: e.target.value })}
          required
          placeholder="e.g. Rice, Medicine"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

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
            placeholder="e.g. 2"
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
            <option value="">Select unit</option>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          placeholder="e.g. 500"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Category *
        </label>
        <div className="flex gap-2">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select category</option>
            {categories?.map((cat) => (
              <option key={cat._id as string} value={cat._id as string}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCategory((s) => !s)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            + New
          </button>
        </div>
      </div>

      {showNewCategory && (
        <div className="p-4 rounded-lg bg-muted border border-border space-y-3">
          <h3 className="font-medium text-foreground">New Category</h3>
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            placeholder="Category name"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Choose Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 border border-border rounded-lg">
              {CATEGORY_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() =>
                    setNewCategory({ ...newCategory, icon: iconName })
                  }
                  className={`p-2 rounded-lg flex items-center justify-center text-xl transition ${
                    newCategory.icon === iconName
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {renderIcon(iconName)}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateCategory}
            disabled={addingCategory || !newCategory.name.trim()}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {addingCategory ? "Creating..." : "Create Category"}
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          Note (optional)
        </label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
          placeholder="Additional details..."
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !activePeriod}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {isLoading ? "Adding..." : "Add Expense"}
      </button>

      {!activePeriod && (
        <p className="text-xs text-center text-muted-foreground">
          No active period — pick or create one first.
        </p>
      )}
    </form>
  );
}
