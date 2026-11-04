"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";

interface RiskBadgeProps {
  level: number | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, showLabel = true, size = "md" }: RiskBadgeProps) {
  const { t } = useTranslation();

  if (level === null || level === undefined || level < 1 || level > 7) {
    return (
      <span
        data-component="risk-badge-na"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 bg-transparent dark:bg-[#030a16] border border-slate-300 dark:border-[#0e274d]"
      >
        {t.common.riskLevels.na}
      </span>
    );
  }

  // SRI styling: completely transparent background in light mode with crisp colored border and high-contrast text
  const getColor = (sri: number) => {
    switch (sri) {
      case 1:
        return {
          bg: "bg-transparent dark:bg-emerald-950/70 border-emerald-600 dark:border-emerald-600/40 text-emerald-800 dark:text-emerald-300",
          desc: t.common.riskLevels.veryLow,
          dot: "bg-emerald-600 dark:bg-emerald-400",
        };
      case 2:
        return {
          bg: "bg-transparent dark:bg-teal-950/70 border-teal-600 dark:border-teal-600/40 text-teal-800 dark:text-teal-300",
          desc: t.common.riskLevels.low,
          dot: "bg-teal-600 dark:bg-teal-400",
        };
      case 3:
        return {
          bg: "bg-transparent dark:bg-cyan-950/70 border-cyan-600 dark:border-cyan-600/40 text-cyan-800 dark:text-cyan-300",
          desc: t.common.riskLevels.mediumLow,
          dot: "bg-cyan-600 dark:bg-cyan-400",
        };
      case 4:
        return {
          bg: "bg-transparent dark:bg-amber-950/70 border-amber-600 dark:border-amber-600/40 text-amber-800 dark:text-amber-300",
          desc: t.common.riskLevels.moderate,
          dot: "bg-amber-600 dark:bg-amber-400",
        };
      case 5:
        return {
          bg: "bg-transparent dark:bg-orange-950/70 border-orange-600 dark:border-orange-600/40 text-orange-800 dark:text-orange-300",
          desc: t.common.riskLevels.mediumHigh,
          dot: "bg-orange-600 dark:bg-orange-400",
        };
      case 6:
        return {
          bg: "bg-transparent dark:bg-rose-950/70 border-rose-600 dark:border-rose-600/40 text-rose-800 dark:text-rose-300",
          desc: t.common.riskLevels.high,
          dot: "bg-rose-600 dark:bg-rose-400",
        };
      case 7:
        return {
          bg: "bg-transparent dark:bg-red-950/80 border-red-600 dark:border-red-500/50 text-red-800 dark:text-red-300",
          desc: t.common.riskLevels.veryHigh,
          dot: "bg-red-600 dark:bg-red-500",
        };
      default:
        return {
          bg: "bg-transparent dark:bg-[#030a16] border-slate-300 dark:border-[#0e274d] text-slate-700 dark:text-slate-300",
          desc: t.common.riskLevels.unknown,
          dot: "bg-slate-400",
        };
    }
  };

  const info = getColor(level);
  const tooltipText = t.common.riskLevels.tooltip
    .replace("{level}", String(level))
    .replace("{desc}", info.desc);

  return (
    <div
      data-component="risk-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-semibold ${info.bg} ${
        size === "sm" ? "text-xs" : size === "lg" ? "text-sm py-1.5 px-3" : "text-xs"
      }`}
      title={tooltipText}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <span
            key={num}
            data-active={num <= level ? "true" : "false"}
            className={`w-1.5 h-3 rounded-xs ${
              num <= level ? info.dot : "bg-slate-200 dark:bg-slate-800 border border-slate-300/40 dark:border-transparent"
            }`}
          />
        ))}
      </div>
      <span className="font-extrabold ml-1 tracking-tight">SRI {level}/7</span>
      {showLabel && <span className="opacity-90 text-[10px] hidden sm:inline">({info.desc})</span>}
    </div>
  );
}
