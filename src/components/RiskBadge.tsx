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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 bg-[#030a16] border border-[#0e274d]">
        {t.common.riskLevels.na}
      </span>
    );
  }

  // SRI styling
  const getColor = (sri: number) => {
    switch (sri) {
      case 1:
        return {
          bg: "bg-emerald-950/70 border-emerald-600/40 text-emerald-300",
          desc: t.common.riskLevels.veryLow,
          dot: "bg-emerald-400",
        };
      case 2:
        return {
          bg: "bg-teal-950/70 border-teal-600/40 text-teal-300",
          desc: t.common.riskLevels.low,
          dot: "bg-teal-400",
        };
      case 3:
        return {
          bg: "bg-cyan-950/70 border-cyan-600/40 text-cyan-300",
          desc: t.common.riskLevels.mediumLow,
          dot: "bg-cyan-400",
        };
      case 4:
        return {
          bg: "bg-amber-950/70 border-amber-600/40 text-amber-300",
          desc: t.common.riskLevels.moderate,
          dot: "bg-amber-400",
        };
      case 5:
        return {
          bg: "bg-orange-950/70 border-orange-600/40 text-orange-300",
          desc: t.common.riskLevels.mediumHigh,
          dot: "bg-orange-400",
        };
      case 6:
        return {
          bg: "bg-rose-950/70 border-rose-600/40 text-rose-300",
          desc: t.common.riskLevels.high,
          dot: "bg-rose-400",
        };
      case 7:
        return {
          bg: "bg-red-950/80 border-red-500/50 text-red-300",
          desc: t.common.riskLevels.veryHigh,
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-[#030a16] border-[#0e274d] text-slate-300",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${info.bg} ${
        size === "sm" ? "text-xs" : size === "lg" ? "text-sm py-1.5 px-3" : "text-xs"
      }`}
      title={tooltipText}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <span
            key={num}
            className={`w-1.5 h-3 rounded-xs ${
              num <= level ? info.dot : "bg-slate-800"
            }`}
          />
        ))}
      </div>
      <span className="font-bold ml-1">SRI {level}/7</span>
      {showLabel && <span className="opacity-80 text-[10px] hidden sm:inline">({info.desc})</span>}
    </div>
  );
}
