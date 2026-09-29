// src/components/ReportPreviewModal.tsx
"use client";

import { IPeriodSummaryReport } from "@/lib/docx/period-report";
import { useEffect } from "react";
import { FaTimes, FaFileWord, FaDownload } from "react-icons/fa";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ReportPreviewModal({
  open,
  data,
  onClose,
  onDownload,
  downloading,
}: {
  open: boolean;
  data: IPeriodSummaryReport | null;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !downloading) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, downloading, onClose]);

  if (!open || !data) return null;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isEmpty = data.breakdown.length === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !downloading && onClose()}
        aria-hidden
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Report preview"
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2 min-w-0">
            <FaFileWord className="text-blue-500 text-lg shrink-0" />
            <h2 className="font-semibold text-foreground truncate">
              Report Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={downloading}
            aria-label="Close"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition disabled:opacity-40"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable body — grey canvas with a white "paper" */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/40">
          <div className="bg-white text-neutral-900 rounded-lg shadow-md p-6 md:p-8 mx-auto max-w-xl text-[13px] leading-relaxed">
            {/* Title */}
            <h1 className="text-center text-2xl font-bold text-green-700 mb-1">
              Amar Kharcha
            </h1>
            <p className="text-center text-xs text-neutral-500 mb-6 uppercase tracking-wider">
              Expense Report
            </p>

            {/* Meta */}
            <div className="space-y-1 mb-6">
              <p>
                <span className="font-semibold">Period:</span>{" "}
                {data.period.name}
              </p>
              <p>
                <span className="font-semibold">Date Range:</span>{" "}
                {formatDate(data.period.startDate)} –{" "}
                {formatDate(data.period.endDate)}
              </p>
              <p>
                <span className="font-semibold">Generated:</span> {today}
              </p>
            </div>

            {/* Table */}
            {isEmpty ? (
              <p className="text-center text-neutral-500 py-6 italic">
                No expenses in this period.
              </p>
            ) : (
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-green-50 text-green-800">
                    <th className="text-left px-3 py-2 border border-neutral-200 font-semibold">
                      Category
                    </th>
                    <th className="text-center px-3 py-2 border border-neutral-200 font-semibold">
                      Items
                    </th>
                    <th className="text-right px-3 py-2 border border-neutral-200 font-semibold">
                      Amount (BDT)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.breakdown.map((b) => (
                    <tr key={b.categoryId} className="even:bg-neutral-50">
                      <td className="px-3 py-2 border border-neutral-200">
                        {b.categoryName}
                      </td>
                      <td className="px-3 py-2 border border-neutral-200 text-center">
                        {b.count}
                      </td>
                      <td className="px-3 py-2 border border-neutral-200 text-right">
                        ৳{b.total.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-100 font-bold">
                    <td className="px-3 py-2 border border-neutral-200">
                      TOTAL
                    </td>
                    <td className="px-3 py-2 border border-neutral-200 text-center">
                      {data.totalCount}
                    </td>
                    <td className="px-3 py-2 border border-neutral-200 text-right text-red-700">
                      ৳{data.totalAmount.toLocaleString("en-US")}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* Signature */}
            <div className="mt-16 flex justify-end">
              <div className="text-right">
                <div className="border-t border-neutral-400 pt-1.5 w-48">
                  <p className="font-semibold text-sm">Mursalin Hossain</p>
                  <p className="text-xs text-neutral-500">Date: {today}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-card">
          <button
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50 active:scale-[0.98]"
          >
            <FaDownload className="text-xs" />
            {downloading ? "Preparing..." : "Download DOCX"}
          </button>
        </div>
      </div>
    </div>
  );
}
