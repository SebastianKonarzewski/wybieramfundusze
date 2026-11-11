"use client";

import React, { useMemo } from "react";
import { KNFValuation } from "@/types/knf";
import { TrendingUp, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface FundPerformanceMatrixProps {
  valuations: KNFValuation[];
  currency?: string;
}

interface PeriodPerformance {
  id: string;
  label: string;
  sublabel?: string;
  returnRate: number | null;
  annualizedRate?: number | null;
  startDate?: string;
  endDate?: string;
  startValuation?: number;
  endValuation?: number;
}

export function FundPerformanceMatrix({
  valuations,
  currency = "PLN",
}: FundPerformanceMatrixProps) {
  const { t, formatPercent, formatDate } = useTranslation();

  // Sort chronological ascending
  const chronological = useMemo(() => {
    return [...valuations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [valuations]);

  const periods = useMemo<PeriodPerformance[]>(() => {
    if (chronological.length < 2) return [];

    const latest = chronological[chronological.length - 1];
    const latestDate = new Date(latest.date);
    const endVal = latest.valuation;

    const findClosestPoint = (targetDate: Date) => {
      const targetTime = targetDate.getTime();
      let closest = chronological[0];
      let minDiff = Math.abs(new Date(closest.date).getTime() - targetTime);

      for (let i = 1; i < chronological.length; i++) {
        const itemTime = new Date(chronological[i].date).getTime();
        const diff = Math.abs(itemTime - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          closest = chronological[i];
        }
      }

      // If closest point is more than 20 days off target, reject (insufficient history)
      const daysDiff = minDiff / (1000 * 60 * 60 * 24);
      if (daysDiff > 25) return null;
      return closest;
    };

    const computeReturn = (startPoint: KNFValuation | null, years?: number) => {
      if (!startPoint || startPoint.valuation <= 0) return { rate: null, ann: null };
      const rate = (endVal - startPoint.valuation) / startPoint.valuation;
      let ann: number | null = null;
      if (years && years > 1 && rate > -1) {
        ann = Math.pow(1 + rate, 1 / years) - 1;
      }
      return { rate, ann };
    };

    // 1 Month
    const date1M = new Date(latestDate);
    date1M.setMonth(date1M.getMonth() - 1);
    const point1M = findClosestPoint(date1M);
    const ret1M = computeReturn(point1M);

    // 3 Months
    const date3M = new Date(latestDate);
    date3M.setMonth(date3M.getMonth() - 3);
    const point3M = findClosestPoint(date3M);
    const ret3M = computeReturn(point3M);

    // 6 Months
    const date6M = new Date(latestDate);
    date6M.setMonth(date6M.getMonth() - 6);
    const point6M = findClosestPoint(date6M);
    const ret6M = computeReturn(point6M);

    // 1 Year
    const date1Y = new Date(latestDate);
    date1Y.setFullYear(date1Y.getFullYear() - 1);
    const point1Y = findClosestPoint(date1Y);
    const ret1Y = computeReturn(point1Y, 1);

    // 2 Years
    const date2Y = new Date(latestDate);
    date2Y.setFullYear(date2Y.getFullYear() - 2);
    const point2Y = findClosestPoint(date2Y);
    const ret2Y = computeReturn(point2Y, 2);

    // 3 Years
    const date3Y = new Date(latestDate);
    date3Y.setFullYear(date3Y.getFullYear() - 3);
    const point3Y = findClosestPoint(date3Y);
    const ret3Y = computeReturn(point3Y, 3);

    // YTD (1 Jan of current year)
    const dateYTD = new Date(latestDate.getFullYear(), 0, 1);
    const pointYTD = findClosestPoint(dateYTD);
    const retYTD = computeReturn(pointYTD);

    return [
      {
        id: "1M",
        label: t.subfundDetail.performance.period1M,
        returnRate: ret1M.rate,
        startDate: point1M?.date,
        endDate: latest.date,
        startValuation: point1M?.valuation,
        endValuation: endVal,
      },
      {
        id: "3M",
        label: t.subfundDetail.performance.period3M,
        returnRate: ret3M.rate,
        startDate: point3M?.date,
        endDate: latest.date,
        startValuation: point3M?.valuation,
        endValuation: endVal,
      },
      {
        id: "6M",
        label: t.subfundDetail.performance.period6M,
        returnRate: ret6M.rate,
        startDate: point6M?.date,
        endDate: latest.date,
        startValuation: point6M?.valuation,
        endValuation: endVal,
      },
      {
        id: "1Y",
        label: t.subfundDetail.performance.period1Y,
        returnRate: ret1Y.rate,
        startDate: point1Y?.date,
        endDate: latest.date,
        startValuation: point1Y?.valuation,
        endValuation: endVal,
      },
      {
        id: "2Y",
        label: t.subfundDetail.performance.period2Y,
        sublabel: t.subfundDetail.performance.period2YAnn,
        returnRate: ret2Y.rate,
        annualizedRate: ret2Y.ann,
        startDate: point2Y?.date,
        endDate: latest.date,
        startValuation: point2Y?.valuation,
        endValuation: endVal,
      },
      {
        id: "3Y",
        label: t.subfundDetail.performance.period3Y,
        sublabel: t.subfundDetail.performance.period3YAnn,
        returnRate: ret3Y.rate,
        annualizedRate: ret3Y.ann,
        startDate: point3Y?.date,
        endDate: latest.date,
        startValuation: point3Y?.valuation,
        endValuation: endVal,
      },
      {
        id: "YTD",
        label: t.subfundDetail.performance.periodYTD,
        returnRate: retYTD.rate,
        startDate: pointYTD?.date,
        endDate: latest.date,
        startValuation: pointYTD?.valuation,
        endValuation: endVal,
      },
    ];
  }, [chronological, t]);

  if (chronological.length < 2) {
    return (
      <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-6 text-center text-slate-500 shadow-sm">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#044CD0]" />
        <p className="text-xs">{t.subfundDetail.performance.noDataForPeriod}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#044CD0]" />
            {t.subfundDetail.performance.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subfundDetail.performance.desc}
          </p>
        </div>
      </div>

      {/* Grid of Periods */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {periods.map((p) => {
          const hasRate = p.returnRate !== null && p.returnRate !== undefined;
          const isPositive = hasRate && p.returnRate! >= 0;

          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                hasRate
                  ? isPositive
                    ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-500/25"
                    : "bg-rose-50/50 dark:bg-rose-950/15 border-rose-200/80 dark:border-rose-500/25"
                  : "bg-slate-50 dark:bg-[#030a16] border-slate-200 dark:border-[#0e274d]/80 opacity-70"
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                  {p.id}
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block truncate mt-0.5" title={p.label}>
                  {p.label}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                {hasRate ? (
                  <>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <span
                        className={`text-sm sm:text-base font-extrabold tracking-tight ${
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatPercent(p.returnRate!)}
                      </span>
                    </div>

                    {p.annualizedRate !== undefined && p.annualizedRate !== null && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        śr. {formatPercent(p.annualizedRate)} / r.
                      </div>
                    )}

                    {p.startDate && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        od {formatDate(p.startDate)}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic block">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-[#0e274d]/60">
        <AlertCircle className="w-3.5 h-3.5 text-[#044CD0] shrink-0" />
        <span>{t.subfundDetail.performance.annualizedNote}</span>
      </div>
    </div>
  );
}
