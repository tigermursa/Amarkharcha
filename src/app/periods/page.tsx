// app/periods/page.tsx
"use client";

import { useState } from "react";

import {
  useGetPeriodsQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
  useSetActivePeriodMutation,
} from "@/lib/services/api";
import type { IPeriodSummary } from "@/types";
import PeriodGate from "../components/PeriodGate";

const toInputDate = (d: string) => new Date(d).toISOString().split("T")[0];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function PeriodsPage() {
  return (
    <PeriodGate>
      <PeriodsContent />
    </PeriodGate>
  );
}

function PeriodsContent() {
  const { data: periods, isLoading } = useGetPeriodsQuery();
  const [createPeriod, { isLoading: creating }] = useCreatePeriodMutation();
  const [updatePeriod, { isLoading: updating }] = useUpdatePeriodMutation();
  const [deletePeriod] = useDeletePeriodMutation();
  const [setActive] = useSetActivePeriodMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IPeriodSummary | null>(null);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    setActive: false,
  });
  const [error, setError] = useState("");

  const resetForm = () => {
    setForm({ name: "", startDate: "", endDate: "", setActive: false });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const openNew = () => {
    const today = new Date();
    const end = new Date(today);
    end.setMonth(end.getMonth() + 1);
    setForm({
      name: "",
      startDate: today.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      setActive: !periods?.some((p) => p.isActive),
    });
    setEditing(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (p: IPeriodSummary) => {
    setEditing(p);
    setForm({
      name: p.name,
      startDate: toInputDate(p.startDate),
      endDate: toInputDate(p.endDate),
      setActive: p.isActive,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date must be after start date");
      return;
    }

    try {
      if (editing) {
        await updatePeriod({
          id: editing._id,
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
        }).unwrap();
      } else {
        await createPeriod({
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          setActive: form.setActive,
        }).unwrap();
      }
      resetForm();
    } catch (err: any) {
      setError(err?.data?.error || "Something went wrong");
    }
  };

  const handleDelete = async (p: IPeriodSummary) => {
    if (!confirm(`Delete period "${p.name}"?`)) return;
    try {
      await deletePeriod(p._id).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to delete");
    }
  };

  const handleActivate = async (p: IPeriodSummary) => {
    try {
      await setActive(p._id).unwrap();
    } catch (err: any) {
      alert(err?.data?.error || "Failed to activate");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Periods
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your expense cycles
            </p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            + New Period
          </button>
        </div>

        {showForm && (
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {editing ? "Edit Period" : "New Period"}
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Period name (e.g. October Salary Cycle)"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {!editing && (
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.setActive}
                  onChange={(e) =>
                    setForm({ ...form, setActive: e.target.checked })
                  }
                  className="accent-primary"
                />
                Set as active period (new expenses go here)
              </label>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={creating || updating}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {creating || updating
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Create"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:opacity-90 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {periods?.map((p) => (
            <PeriodCard
              key={p._id}
              period={p}
              onEdit={() => openEdit(p)}
              onDelete={() => handleDelete(p)}
              onActivate={() => handleActivate(p)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PeriodCard({
  period,
  onEdit,
  onDelete,
  onActivate,
}: {
  period: IPeriodSummary;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-2xl bg-card border transition ${
        period.isActive ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">
              {period.name}
            </h3>
            {period.isActive && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(period.startDate)} → {formatDate(period.endDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 py-2 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-red-500">
            ৳{period.total.toLocaleString("en-US")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-lg font-bold text-foreground">{period.count}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 pt-2 border-t border-border">
        {!period.isActive && (
          <button
            onClick={onActivate}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            Set Active
          </button>
        )}
        <button
          onClick={onEdit}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition ml-auto"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
