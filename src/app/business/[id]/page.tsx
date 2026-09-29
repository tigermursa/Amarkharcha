// src/app/business/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";
import {
  useGetBusinessQuery,
  useAddProfitMutation,
  useDeleteProfitMutation,
} from "@/lib/services/api";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import type { IProfit } from "@/types";
import PeriodGate from "@/app/components/PeriodGate";
import { useConfirm } from "@/app/components/ConfirmDialog";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatMonth = (ym: string) => {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

export default function BusinessDetailPage() {
  return (
    <PeriodGate>
      <BusinessDetailContent />
    </PeriodGate>
  );
}

function BusinessDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const businessId = params.id;

  const { data, isFetching } = useGetBusinessQuery(businessId);
  const [addProfit, { isLoading: adding }] = useAddProfitMutation();
  const [deleteProfit] = useDeleteProfitMutation();
  const confirmDialog = useConfirm();

  const [form, setForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: "",
  });
  const [error, setError] = useState("");

  const business = data?.business;
  const profits = data?.profits || [];
  const totalProfit = data?.totalProfit || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amt = Number(form.amount);
    if (!form.month) {
      setError("Month is required");
      return;
    }
    if (!Number.isFinite(amt) || amt === 0) {
      setError("Amount must be a non-zero number");
      return;
    }

    try {
      await addProfit({
        businessId,
        month: form.month,
        amount: amt,
      }).unwrap();
      toast.success(`Profit added for ${formatMonth(form.month)}`);
      setForm({ month: new Date().toISOString().slice(0, 7), amount: "" });
    } catch (err: any) {
      const msg = err?.data?.error || "Failed to add profit";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (p: IProfit) => {
    const ok = await confirmDialog({
      title: "Delete profit entry?",
      message: `Remove ৳${p.amount.toLocaleString("en-US")} for ${formatMonth(
        p.month,
      )}?`,
      confirmText: "Delete",
    });
    if (!ok) return;

    try {
      await deleteProfit({
        businessId,
        profitId: p._id as string,
      }).unwrap();
      toast.success("Profit removed");
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to delete");
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <p className="text-center text-muted-foreground py-20">Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto text-center py-20">
          <p className="text-muted-foreground">Business not found</p>
          <button
            onClick={() => router.push("/business")}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Back to Businesses
          </button>
        </div>
      </div>
    );
  }

  const totalInvested = business.amount;
  const netReturn = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push("/business")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <FaArrowLeft className="text-xs" />
          Back to Businesses
        </button>

        {/* Business header card */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {business.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
            <span className="inline-flex items-center gap-1.5">
              <FaUser className="text-xs" />
              {business.personName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FaCalendarAlt className="text-xs" />
              Invested {formatDate(String(business.investedDate))}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                Invested
              </p>
              <p className="text-base md:text-lg font-bold text-foreground">
                ৳{totalInvested.toLocaleString("en-US")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                Total Profit
              </p>
              <p className="text-base md:text-lg font-bold text-green-600">
                ৳{totalProfit.toLocaleString("en-US")}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                Return
              </p>
              <p
                className={`text-base md:text-lg font-bold ${
                  netReturn >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {netReturn.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Add profit form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-5 rounded-2xl bg-card border border-border space-y-3"
        >
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FaChartLine className="text-xs text-primary" />
            Add monthly profit
          </p>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              type="month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Profit amount (৳)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 whitespace-nowrap"
            >
              <FaPlus className="text-xs" />
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </form>

        {/* Profit table */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">
              Profit History
            </h2>
            <span className="text-xs text-muted-foreground">
              {profits.length} {profits.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {profits.length === 0 ? (
            <p className="p-10 text-center text-muted-foreground text-sm">
              No profit entries yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Month
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                      Profit
                    </th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {profits.map((p) => (
                    <tr
                      key={p._id as string}
                      className="border-t border-border hover:bg-muted/30 transition"
                    >
                      <td className="px-4 py-3 text-foreground font-medium">
                        {formatMonth(p.month)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          p.amount >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        ৳{p.amount.toLocaleString("en-US")}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => handleDelete(p)}
                          title="Delete"
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/40">
                    <td className="px-4 py-3 font-bold text-foreground">
                      TOTAL
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        totalProfit >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      ৳{totalProfit.toLocaleString("en-US")}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
