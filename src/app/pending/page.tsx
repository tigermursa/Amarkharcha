// src/app/pending/page.tsx
"use client";

import { useState } from "react";

import { toast } from "sonner";
import {
  useGetPendingsQuery,
  useAddPendingMutation,
  useDeletePendingMutation,
} from "@/lib/services/api";
import {
  FaPlus,
  FaTrash,
  FaUserFriends,
  FaHandHoldingUsd,
} from "react-icons/fa";
import type { IPending, PendingType } from "@/types";
import PeriodGate from "../components/PeriodGate";

type Tab = "receivable" | "payable";

const TABS: { value: Tab; label: string; type: PendingType }[] = [
  { value: "receivable", label: "They Owe Me", type: "they_owe_me" },
  { value: "payable", label: "I Owe Them", type: "i_owe_them" },
];

const initialForm = { name: "", amount: "", note: "" };

export default function PendingPage() {
  return (
    <PeriodGate>
      <PendingContent />
    </PeriodGate>
  );
}

function PendingContent() {
  const [tab, setTab] = useState<Tab>("receivable");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const { data, isFetching } = useGetPendingsQuery();
  const [addPending, { isLoading: adding }] = useAddPendingMutation();
  const [deletePending] = useDeletePendingMutation();

  const activeTab = TABS.find((t) => t.value === tab)!;

  const list: IPending[] =
    tab === "receivable" ? data?.receivables || [] : data?.payables || [];

  const total =
    tab === "receivable"
      ? data?.receivablesTotal || 0
      : data?.payablesTotal || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amount = Number(form.amount);
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    try {
      await addPending({
        type: activeTab.type,
        name: form.name.trim(),
        amount,
        note: form.note.trim(),
      }).unwrap();

      setForm(initialForm);
      toast.success(
        tab === "receivable"
          ? `Added: ${form.name} owes you ৳${amount}`
          : `Added: you owe ${form.name} ৳${amount}`,
      );
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to add entry";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (entry: IPending) => {
    if (!confirm(`Delete "${entry.name}" from the list?`)) return;
    try {
      await deletePending(entry._id as string).unwrap();
      toast.success("Removed");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Pending
          </h1>
          <p className="text-muted-foreground text-sm">
            Track who owes you and whom you owe
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted border border-border">
          {TABS.map((t) => {
            const isActive = tab === t.value;
            const tabTotal =
              t.value === "receivable"
                ? data?.receivablesTotal || 0
                : data?.payablesTotal || 0;
            const Icon =
              t.value === "receivable" ? FaUserFriends : FaHandHoldingUsd;

            return (
              <button
                key={t.value}
                onClick={() => {
                  setTab(t.value);
                  setError("");
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`text-xs ${
                      isActive
                        ? t.value === "receivable"
                          ? "text-green-500"
                          : "text-red-500"
                        : ""
                    }`}
                  />
                  <span>{t.label}</span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    tabTotal > 0
                      ? t.value === "receivable"
                        ? "text-green-600"
                        : "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  ৳{tabTotal.toLocaleString("en-US")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-5 rounded-2xl bg-card border border-border space-y-3"
        >
          <p className="text-sm font-semibold text-foreground">
            {tab === "receivable"
              ? "Add someone who owes you"
              : "Add someone you owe"}
          </p>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Person name"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount (৳)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Note (optional)"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={adding}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
          >
            <FaPlus className="text-xs" />
            {adding ? "Adding..." : "Add"}
          </button>
        </form>

        {/* List */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {isFetching ? (
            <p className="p-8 text-center text-muted-foreground text-sm">
              Loading...
            </p>
          ) : list.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground text-sm">
              No entries yet
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((entry) => (
                <li
                  key={entry._id as string}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {entry.name}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p
                      className={`font-bold ${
                        tab === "receivable" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      ৳{entry.amount.toLocaleString("en-US")}
                    </p>
                    <button
                      onClick={() => handleDelete(entry)}
                      title="Delete"
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Footer total */}
          {list.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t-2 border-border bg-muted/40">
              <p className="text-sm font-semibold text-foreground">
                Total Pending
              </p>
              <p
                className={`text-lg font-bold ${
                  tab === "receivable" ? "text-green-600" : "text-red-500"
                }`}
              >
                ৳{total.toLocaleString("en-US")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
