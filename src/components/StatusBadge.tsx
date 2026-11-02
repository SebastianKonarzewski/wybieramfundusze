import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StatusBadgeProps {
  isActive?: boolean;
  isLiquidating?: boolean;
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  className?: string;
}

export function StatusBadge({
  isActive,
  isLiquidating,
  liquidationStartDate,
  liquidationEndDate,
  className = "",
}: StatusBadgeProps) {
  if (isLiquidating) {
    return (
      <span
        title={
          liquidationStartDate
            ? `Likwidacja od ${formatDate(liquidationStartDate)}${liquidationEndDate ? ` do ${formatDate(liquidationEndDate)}` : ""}`
            : "Fundusz w trakcie likwidacji"
        }
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        W likwidacji
      </span>
    );
  }

  if (isActive === false) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 ${className}`}
      >
        <XCircle className="w-3 h-3 text-slate-500" />
        Nieaktywny
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      Aktywny
    </span>
  );
}

