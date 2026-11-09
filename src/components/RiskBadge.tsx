"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";

interface RiskBadgeProps {
  level: number | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  showSriPrefix?: boolean;
  stacked?: boolean;
  align?: "start" | "center";
}

export function RiskBadge({
  level,
  showLabel = true,
  size = "md",
  showSriPrefix = true,
  stacked = false,
  align = "center",
}: RiskBadgeProps) {
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

  // SRI styling: smooth green -> yellow -> red transition
  const getColor = (sri: number) => {
    switch (sri) {
      case 1:
        return {
          textColor: "text-emerald-700 dark:text-emerald-400",
          dotColor: "bg-emerald-600 dark:bg-emerald-500",
          desc: t.common.riskLevels.veryLow,
        };
      case 2:
        return {
          textColor: "text-green-700 dark:text-green-400",
          dotColor: "bg-green-600 dark:bg-green-500",
          desc: t.common.riskLevels.low,
        };
      case 3:
        return {
          textColor: "text-lime-700 dark:text-lime-400",
          dotColor: "bg-lime-600 dark:bg-lime-500",
          desc: t.common.riskLevels.mediumLow,
        };
      case 4:
        return {
          textColor: "text-yellow-700 dark:text-yellow-400",
          dotColor: "bg-yellow-500 dark:bg-yellow-400",
          desc: t.common.riskLevels.moderate,
        };
      case 5:
        return {
          textColor: "text-amber-700 dark:text-amber-400",
          dotColor: "bg-amber-500 dark:bg-amber-400",
          desc: t.common.riskLevels.mediumHigh,
        };
      case 6:
        return {
          textColor: "text-orange-700 dark:text-orange-400",
          dotColor: "bg-orange-600 dark:bg-orange-500",
          desc: t.common.riskLevels.high,
        };
      case 7:
        return {
          textColor: "text-red-700 dark:text-red-400",
          dotColor: "bg-red-600 dark:bg-red-500",
          desc: t.common.riskLevels.veryHigh,
        };
      default:
        return {
          textColor: "text-slate-600 dark:text-slate-400",
          dotColor: "bg-slate-400 dark:bg-slate-500",
          desc: t.common.riskLevels.unknown,
        };
    }
  };

  const info = getColor(level);
  const tooltipText = t.common.riskLevels.tooltip
    .replace("{level}", String(level))
    .replace("{desc}", info.desc);

  if (stacked) {
    const isStart = align === "start";
    return (
      <div
        data-component="risk-badge"
        className={`inline-flex flex-col ${
          isStart ? "items-start justify-start" : "items-center justify-center"
        } cursor-default select-none py-0.5`}
        title={tooltipText}
      >
        <div className="flex items-baseline gap-0.5 leading-none">
          <span className={`text-[15px] font-black tracking-tight ${info.textColor}`}>
            {showSriPrefix ? "SRI " : ""}{level}
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            /7
          </span>
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <span
              key={num}
              data-active={num <= level ? "true" : "false"}
              className={`w-1.5 h-1.5 rounded-full ${
                num <= level ? info.dotColor : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-component="risk-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold bg-white dark:bg-[#030a16] border-slate-200 dark:border-[#0e274d] shadow-2xs ${
        size === "sm" ? "text-xs py-0.5 px-2" : size === "lg" ? "text-sm py-1.5 px-3" : "text-xs"
      }`}
      title={tooltipText}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <span
            key={num}
            data-active={num <= level ? "true" : "false"}
            className={`w-1.5 h-3 rounded-xs ${
              num <= level ? info.dotColor : "bg-slate-200 dark:bg-slate-800"
            }`}
          />
        ))}
      </div>
      <span className={`font-black ml-1 tracking-tight ${info.textColor}`}>
        {showSriPrefix ? "SRI " : ""}{level}/7
      </span>
      {showLabel && <span className="opacity-80 text-[10px] hidden sm:inline text-slate-500 dark:text-slate-400">({info.desc})</span>}
    </div>
  );
}
