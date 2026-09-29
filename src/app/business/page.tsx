// src/app/business/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

import { toast } from "sonner";
import {
  useGetBusinessesQuery,
  useAddBusinessMutation,
  useDeleteBusinessMutation,
} from "@/lib/services/api";
import {
  FaPlus,
  FaTrash,
  FaBriefcase,
  FaArrowRight,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import PeriodGate from "../components/PeriodGate";
import { useConfirm } from "../components/ConfirmDialog";

const initialForm = {
  name: "",
  personName: "",
  amount: "",
  investedDate: new Date().toISOString().split("T")[0],
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function BusinessPage() {
  return (
    <PeriodGate>
      <BusinessContent />
    </PeriodGate>
  );
}

function BusinessContent() {
  const { data: businesses, isFetching } = useGetBusinessesQuery();
  const [addBusiness, { isLoading: adding }] = useAddBusinessMutation();
  const [deleteBusiness] = useDeleteBusinessMutation();
  const confirmDialog = useConfirm();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const totalInvested = businesses?.reduce((s, b) => s + b.amount, 0) || 0;
  const totalProfit = businesses?.reduce((s, b) => s + b.totalProfit, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amt = Number(form.amount);
    if (!form.name.trim() || !form.personName.trim()) {
      setError("Business name and person name are required");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    try {
      await addBusiness({
        name: form.name.trim(),
        personName: form.personName.trim(),
        amount: amt,
        investedDate: form.investedDate,
      }).unwrap();
      toast.success(`Business "${form.name}" added`);
      setForm(initialForm);
      setShowForm(false);
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to add business";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirmDialog({
      title: "Delete business?",
      message: `Delete "${name}" and all its profit entries? This cannot be undone.`,
      confirmText: "Delete",
    });
    if (!ok) return;

    try {
      await deleteBusiness(id).unwrap();
      toast.success("Business deleted");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Business
            </h1>
            <p className="text-muted-foreground text-sm">
              Track investments and monthly profits
            </p>
          </div>
          <button
            onClick={() => {
              setForm(initialForm);
              setError("");
              setShowForm((s) => !s);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.98] transition"
          >
            <FaPlus className="text-xs" />
            New Business
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
            <p className="text-lg md:text-xl font-bold text-foreground">
              ৳{totalInvested.toLocaleString("en-US")}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
            <p className="text-lg md:text-xl font-bold text-green-600">
              ৳{totalProfit.toLocaleString("en-US")}
            </p>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="p-4 md:p-5 rounded-2xl bg-card border border-border space-y-3"
          >
            <p className="text-sm font-semibold text-foreground">
              Add new business
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
                placeholder="Business name"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={form.personName}
                onChange={(e) =>
                  setForm({ ...form, personName: e.target.value })
                }
                placeholder="Person name"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Invested amount (৳)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={form.investedDate}
                onChange={(e) =>
                  setForm({ ...form, investedDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Business"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  setError("");
                }}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {isFetching ? (
          <p className="p-8 text-center text-muted-foreground text-sm">
            Loading...
          </p>
        ) : !businesses?.length ? (
          <div className="p-10 rounded-2xl bg-card border border-dashed border-border text-center">
            <FaBriefcase className="mx-auto text-2xl text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              No businesses yet. Add your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {businesses.map((b) => (
              <Link
                key={b._id as string}
                href={`/business/${b._id}`}
                className="group block p-4 rounded-2xl bg-card border border-border hover:border-primary transition"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {b.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <FaUser className="text-[10px]" />
                      {b.personName}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, b._id as string, b.name)}
                    title="Delete"
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition shrink-0"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 border-t border-border">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground mb-0.5">
                      Invested
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      ৳{b.amount.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground mb-0.5">
                      Profit ({b.profitCount})
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      ৳{b.totalProfit.toLocaleString("en-US")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FaCalendarAlt className="text-[10px]" />
                    {formatDate(String(b.investedDate))}
                  </span>
                  <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    View <FaArrowRight className="text-[10px]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
