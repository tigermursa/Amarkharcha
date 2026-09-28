// components/PeriodSelector.tsx
"use client";

import { useEffect, useState } from "react";
import {
  useGetPeriodsQuery,
  useSetActivePeriodMutation,
} from "@/lib/services/api";

export default function PeriodSelector() {
  const { data: periods } = useGetPeriodsQuery();
  const [setActive] = useSetActivePeriodMutation();
  const [open, setOpen] = useState(false);

  const active = periods?.find((p) => p.isActive);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (!periods || periods.length === 0) return null;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition max-w-[180px]"
      >
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span className="truncate">{active?.name || "No active period"}</span>
        <span className="text-muted-foreground text-[10px]">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50">
          <p className="px-3 py-2 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
            Switch Period
          </p>
          {periods.map((p) => (
            <button
              key={p._id}
              onClick={async () => {
                if (!p.isActive) await setActive(p._id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-muted transition border-b border-border last:border-b-0 ${
                p.isActive ? "bg-muted/50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {p.name}
                </span>
                {p.isActive && (
                  <span className="text-[9px] uppercase font-bold text-primary">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                <span>
                  {new Date(p.startDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  →{" "}
                  {new Date(p.endDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span className="font-semibold text-red-500">
                  ৳{p.total.toLocaleString("en-US")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
