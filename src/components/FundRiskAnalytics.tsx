"use client";

import React, { useMemo } from "react";
import { KNFValuation, KNFKeyInformationDetail } from "@/types/knf";
import { ShieldAlert, TrendingDown, Activity, Award, ArrowUpRight, ArrowDownRight, Clock, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface FundRiskAnalyticsProps {
  valuations: KNFValuation[];
  kid?: KNFKeyInformationDetail | null;
  currency?: string;
}

export function FundRiskAnalytics({
  valuations,
  kid,
  currency = "PLN",
}: FundRiskAnalyticsProps) {
  const { t, formatCurrency, formatPercent, formatDate } = useTranslation();

  // Sort chronological ascending
  const chronological = useMemo(() => {
    return [...valuations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [valuations]);

  const metrics = useMemo(() => {
    if (chronological.length < 5) return null;

    // 1. ATH and ATL
    let athVal = chronological[0].valuation;
    let athDate = chronological[0].date;
    let atlVal = chronological[0].valuation;
    let atlDate = chronological[0].date;

    // 2. Max Drawdown (MDD)
    let peakVal = chronological[0].valuation;
    let peakDate = chronological[0].date;
    let maxDrawdown = 0; // negative or 0
    let mddPeakDate = peakDate;
    let mddTroughDate = chronological[0].date;

    // 3. Volatility (Daily Returns)
    const dailyReturns: number[] = [];

    for (let i = 0; i < chronological.length; i++) {
      const p = chronological[i];

      // ATH / ATL check
      if (p.valuation > athVal) {
        athVal = p.valuation;
        athDate = p.date;
      }
      if (p.valuation < atlVal) {
        atlVal = p.valuation;
        atlDate = p.date;
      }

      // Peak & Drawdown
      if (p.valuation > peakVal) {
        peakVal = p.valuation;
        peakDate = p.date;
      } else if (peakVal > 0) {
        const dd = (p.valuation - peakVal) / peakVal;
        if (dd < maxDrawdown) {
          maxDrawdown = dd;
          mddPeakDate = peakDate;
          mddTroughDate = p.date;
        }
      }

      // Return
      if (i > 0) {
        const prev = chronological[i - 1].valuation;
        if (prev > 0) {
          dailyReturns.push((p.valuation - prev) / prev);
        }
      }
    }

    // Annualized Volatility
    let annualizedVolatility: number | null = null;
    let sharpeRatio: number | null = null;

    if (dailyReturns.length > 10) {
      const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
      const variance =
        dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
        (dailyReturns.length - 1);
      const dailyStdDev = Math.sqrt(variance);
      annualizedVolatility = dailyStdDev * Math.sqrt(252);

      // Sharpe Ratio calculation against risk-free rate 5.75% (Polish NBP reference rate)
      // Approximate 1Y return from data or overall annualized return
      const totalDays =
        (new Date(chronological[chronological.length - 1].date).getTime() -
          new Date(chronological[0].date).getTime()) /
        (1000 * 60 * 60 * 24);

      if (totalDays >= 90 && annualizedVolatility > 0.001) {
        const totalReturn =
          (chronological[chronological.length - 1].valuation - chronological[0].valuation) /
          chronological[0].valuation;
        const years = Math.max(0.5, totalDays / 365.25);
        const annReturn = Math.pow(Math.max(0.01, 1 + totalReturn), 1 / years) - 1;
        const riskFreeRate = 0.0575; // 5.75%
        sharpeRatio = (annReturn - riskFreeRate) / annualizedVolatility;
      }
    }

    // Recommended horizon
    const sri = kid?.riskLevel ?? 3;
    let recommendedYears = 3;
    if (sri <= 2) recommendedYears = 1;
    else if (sri >= 5) recommendedYears = 5;

    return {
      athVal,
      athDate,
      atlVal,
      atlDate,
      maxDrawdown,
      mddPeakDate,
      mddTroughDate,
      annualizedVolatility,
      sharpeRatio,
      recommendedYears,
      dataPoints: chronological.length,
      fromDate: chronological[0].date,
      toDate: chronological[chronological.length - 1].date,
    };
  }, [chronological, kid]);

  if (!metrics) return null;

  return (
    <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#044CD0]" />
            {t.subfundDetail.riskAnalytics.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subfundDetail.riskAnalytics.desc}
          </p>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {t.subfundDetail.riskAnalytics.valuationCount}{" "}
          <strong className="text-slate-700 dark:text-slate-200">{metrics.dataPoints}</strong>
        </div>
      </div>

      {/* Grid of Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Max Drawdown */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-500/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.subfundDetail.riskAnalytics.maxDrawdown}
              </span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t.subfundDetail.riskAnalytics.maxDrawdownDesc}
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-rose-200/60 dark:border-rose-900/40">
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatPercent(metrics.maxDrawdown)}
            </span>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              szczyt: {formatDate(metrics.mddPeakDate)} → dołek: {formatDate(metrics.mddTroughDate)}
            </div>
          </div>
        </div>

        {/* 2. Volatility */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.subfundDetail.riskAnalytics.volatility}
              </span>
              <Activity className="w-4 h-4 text-[#044CD0]" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t.subfundDetail.riskAnalytics.volatilityDesc}
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {metrics.annualizedVolatility !== null
                ? formatPercent(metrics.annualizedVolatility)
                : "—"}
            </span>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              zmienność roczna σ
            </div>
          </div>
        </div>

        {/* 3. Sharpe Ratio */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.subfundDetail.riskAnalytics.sharpeRatio}
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t.subfundDetail.riskAnalytics.sharpeRatioDesc}
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-slate-800">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                metrics.sharpeRatio !== null && metrics.sharpeRatio > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {metrics.sharpeRatio !== null ? metrics.sharpeRatio.toFixed(2) : "—"}
            </span>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {metrics.sharpeRatio !== null && metrics.sharpeRatio > 1
                ? "bardzo dobra efektywność"
                : metrics.sharpeRatio !== null && metrics.sharpeRatio > 0
                ? "dodatnia premia za ryzyko"
                : "poniżej stopy wolnej od ryzyka"}
            </div>
          </div>
        </div>

        {/* 4. ATH & ATL / Horizon */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Skrajne wyceny (ATH / ATL)
              </span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  ATH:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(metrics.athVal, currency)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {formatDate(metrics.athDate)}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                  ATL:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(metrics.atlVal, currency)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {formatDate(metrics.atlDate)}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Horyzont KID:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              min. {metrics.recommendedYears} {metrics.recommendedYears === 1 ? "rok" : "lata"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
