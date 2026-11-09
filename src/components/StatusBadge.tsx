"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface StatusBadgeProps {
  isActive?: boolean;
  isLiquidating?: boolean;
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  className?: string;
  compact?: boolean;
}

export function StatusBadge({
  isActive,
  isLiquidating,
  liquidationStartDate,
  liquidationEndDate,
  className = "",
  compact = false,
}: StatusBadgeProps) {
  const { t, formatDate, locale } = useTranslation();

  if (compact) {
    if (isLiquidating) {
      const tooltip = liquidationStartDate
        ? `${t.common.inLiquidation} ${t.common.since} ${formatDate(liquidationStartDate)}${liquidationEndDate ? ` - ${formatDate(liquidationEndDate)}` : ""}`
        : t.common.inLiquidation;
      const shortLabel = locale === "en" ? "Liq." : "Likwid.";
      return (
        <span
          data-component="status-badge"
          title={tooltip}
          className={`inline-flex flex-col items-center justify-center text-center ${className}`}
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          </span>
          <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 leading-tight mt-0.5 whitespace-nowrap">
            {shortLabel}
          </span>
        </span>
      );
    }

    if (isActive === false) {
      const shortLabel = locale === "en" ? "Inactive" : "Nieaktywny";
      return (
        <span
          data-component="status-badge"
          title={t.common.inactive}
          className={`inline-flex flex-col items-center justify-center text-center ${className}`}
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shrink-0">
            <XCircle className="w-3 h-3 text-slate-500 shrink-0" />
          </span>
          <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 leading-tight mt-0.5 whitespace-nowrap">
            {shortLabel}
          </span>
        </span>
      );
    }

    const activeLabel = locale === "en" ? "Active" : "Aktywny";
    return (
      <span
        data-component="status-badge"
        title={t.common.active}
        className={`inline-flex flex-col items-center justify-center text-center ${className}`}
      >
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </span>
        <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 leading-tight mt-0.5 whitespace-nowrap">
          {activeLabel}
        </span>
      </span>
    );
  }

  if (isLiquidating) {
    return (
      <span
        data-component="status-badge"
        title={
          liquidationStartDate
            ? `${t.common.inLiquidation} ${t.common.since} ${formatDate(liquidationStartDate)}${liquidationEndDate ? ` - ${formatDate(liquidationEndDate)}` : ""}`
            : t.common.inLiquidation
        }
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        {t.common.inLiquidation}
      </span>
    );
  }

  if (isActive === false) {
    return (
      <span
        data-component="status-badge"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 ${className}`}
      >
        <XCircle className="w-3 h-3 text-slate-500" />
        {t.common.inactive}
      </span>
    );
  }

  return (
    <span
      data-component="status-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      {t.common.active}
    </span>
  );
}

