// components/ExpenseForm.tsx
"use client";

import { useState } from "react";
import {
  useAddTransactionMutation,
  useGetCategoriesQuery,
} from "@/lib/services/api";
import { UnitType } from "@/types";
import { IconType } from "react-icons";
import * as FaIcons from "react-icons/fa";
import { CATEGORY_ICONS } from "@/lib/default-categories";

const UNITS: { value: UnitType; label: string }[] = [
  { value: "kg", label: "কেজি" },
  { value: "gm", label: "গ্রাম" },
  { value: "ml", label: "মিলি" },
  { value: "l", label: "লিটার" },
  { value: "ps", label: "পিস" },
  { value: "pcs", label: "পিস (বহুবচন)" },
  { value: "packet", label: "প্যাকেট" },
  { value: "dozen", label: "ডজন" },
  { value: "meter", label: "মিটার" },
  { value: "bundle", label: "বান্ডেল" },
];

export default function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const { data: categories } = useGetCategoriesQuery();

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    item: "",
    quantity: "",
    unit: "" as UnitType | "",
    price: "",
    categoryId: "",
    type: "expense" as "income" | "expense",
    note: "",
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "FaEllipsisH",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      date: form.date,
      item: form.item,
      quantity: form.quantity ? parseFloat(form.quantity) : undefined,
      unit: form.unit || undefined,
      price: parseFloat(form.price),
      categoryId: form.categoryId,
      type: form.type,
      note: form.note,
    };

    try {
      await addTransaction(body).unwrap();
      setForm({
        ...form,
        item: "",
        quantity: "",
        unit: "",
        price: "",
        note: "",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  // আইকন রেন্ডার হেল্পার
  const renderIcon = (iconName: string) => {
    const Icon = (FaIcons as any)[iconName] as IconType;
    return Icon ? <Icon /> : null;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-card rounded-2xl border border-border"
    >
      <h2 className="text-xl font-bold text-foreground mb-4">
        নতুন খরচ যোগ করুন
      </h2>

      {/* ট্রানজ্যাকশন টাইপ */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, type: "expense" })}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            form.type === "expense"
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          খরচ
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, type: "income" })}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            form.type === "income"
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          আয়
        </button>
      </div>

      {/* তারিখ */}
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          তারিখ *
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* আইটেম (অবশ্যই লাগবে) */}
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          আইটেম *
        </label>
        <input
          type="text"
          value={form.item}
          onChange={(e) => setForm({ ...form, item: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="যেমন: চাল, ডাল, ঔষধ"
        />
      </div>

      {/* পরিমাণ + একক (অপশনাল) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">
            পরিমাণ
          </label>
          <input
            type="number"
            step="0.01"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="যেমন: 2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">
            একক
          </label>
          <select
            value={form.unit}
            onChange={(e) =>
              setForm({ ...form, unit: e.target.value as UnitType })
            }
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">নির্বাচন করুন</option>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* মূল্য */}
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          মূল্য (৳) *
        </label>
        <input
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="যেমন: 500"
        />
      </div>

      {/* ক্যাটাগরি */}
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          ক্যাটাগরি *
        </label>
        <div className="flex gap-2">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCategory(!showNewCategory)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            + নতুন
          </button>
        </div>
      </div>

      {/* নতুন ক্যাটাগরি তৈরি (টগল) */}
      {showNewCategory && (
        <div className="p-4 rounded-lg bg-muted border border-border space-y-3">
          <h3 className="font-medium text-foreground">নতুন ক্যাটাগরি</h3>
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            placeholder="ক্যাটাগরির নাম"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              আইকন নির্বাচন করুন
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
            onClick={async () => {
              if (!newCategory.name) return;
              await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
              });
              setNewCategory({ name: "", icon: "FaEllipsisH" });
              setShowNewCategory(false);
            }}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            ক্যাটাগরি তৈরি করুন
          </button>
        </div>
      )}

      {/* নোট */}
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">
          নোট (অপশনাল)
        </label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="অতিরিক্ত তথ্য..."
        />
      </div>

      {/* সাবমিট */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {isLoading ? "যোগ করা হচ্ছে..." : "খরচ যোগ করুন"}
      </button>
    </form>
  );
}
