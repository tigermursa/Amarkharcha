// src/components/PeriodDocxButton.tsx
"use client";

import { useState } from "react";
import { FaFileWord } from "react-icons/fa";
import { toast } from "sonner";
import ReportPreviewModal from "./ReportPreviewModal";
import {
  generatePeriodDocx,
  downloadBlob,
  slugifyFilename,
} from "@/lib/generate-period-docx";
import { IPeriodSummaryReport } from "@/lib/docx/period-report";

export default function PeriodDocxButton({
  periodId,
  periodName,
}: {
  periodId: string;
  periodName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<IPeriodSummaryReport | null>(null);
  const [open, setOpen] = useState(false);

  // Step 1 — fetch + open preview
  const handlePreview = async () => {
    setLoading(true);
    const loadingId = toast.loading("Preparing report preview...");
    try {
      const res = await fetch(`/api/periods/${periodId}/summary`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      const summary: IPeriodSummaryReport = await res.json();

      setData(summary);
      setOpen(true);
      toast.success("Preview ready", { id: loadingId });
    } catch (err) {
      console.error(err);
      toast.error("Could not load report preview", { id: loadingId });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — download DOCX from preview
  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    const loadingId = toast.loading("Generating DOCX...");
    try {
      const blob = await generatePeriodDocx(data);
      const filename = `${slugifyFilename(periodName)}_report.docx`;
      downloadBlob(blob, filename);
      toast.success("Report downloaded", { id: loadingId });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate DOCX", { id: loadingId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePreview}
        disabled={loading}
        title="Preview & download report"
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition disabled:opacity-50 inline-flex items-center gap-1.5 active:scale-[0.97]"
      >
        <FaFileWord className="text-xs" />
        {loading ? "Loading..." : "Report"}
      </button>

      <ReportPreviewModal
        open={open}
        data={data}
        onClose={() => setOpen(false)}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </>
  );
}
