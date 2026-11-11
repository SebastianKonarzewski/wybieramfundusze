"use client";

import React, { useState, useMemo } from "react";
import { KNFValuation } from "@/types/knf";
import { Calculator, Wallet, Coins, ArrowRight, Info, Check, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface InvestmentSimulatorProps {
  valuations: KNFValuation[];
  currency?: string;
}

const PRESET_AMOUNTS = [2000, 5000, 10000, 25000, 50000];
const SIMULATOR_HORIZONS = [
  { id: "1M", labelPl: "1 mies.", labelEn: "1 mo." },
  { id: "3M", labelPl: "3 mies.", labelEn: "3 mo." },
  { id: "6M", labelPl: "6 mies.", labelEn: "6 mo." },
  { id: "1Y", labelPl: "1 rok", labelEn: "1 yr." },
  { id: "2Y", labelPl: "2 lata", labelEn: "2 yrs." },
  { id: "3Y", labelPl: "3 lata", labelEn: "3 yrs." },
  { id: "YTD", labelPl: "YTD", labelEn: "YTD" },
  { id: "MAX", labelPl: "MAX", labelEn: "MAX" },
];

export function InvestmentSimulator({
  valuations,
  currency = "PLN",
}: InvestmentSimulatorProps) {
  const { t, locale, formatCurrency, formatPercent, formatDate } = useTranslation();
  const [amount, setAmount] = useState<number>(10000);
  const [selectedHorizon, setSelectedHorizon] = useState<string>("1Y");
  const [includeBelkaTax, setIncludeBelkaTax] = useState<boolean>(true);

  // Sort chronological ascending
  const chronological = useMemo(() => {
    return [...valuations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [valuations]);

  // Compute return for selected horizon
  const simulation = useMemo(() => {
    if (chronological.length < 2 || amount <= 0) {
      return null;
    }

    const latest = chronological[chronological.length - 1];
    const latestDate = new Date(latest.date);
    const endValuation = latest.valuation;

    let targetDate = new Date(latestDate);
    if (selectedHorizon === "1M") {
      targetDate.setMonth(targetDate.getMonth() - 1);
    } else if (selectedHorizon === "3M") {
      targetDate.setMonth(targetDate.getMonth() - 3);
    } else if (selectedHorizon === "6M") {
      targetDate.setMonth(targetDate.getMonth() - 6);
    } else if (selectedHorizon === "1Y") {
      targetDate.setFullYear(targetDate.getFullYear() - 1);
    } else if (selectedHorizon === "2Y") {
      targetDate.setFullYear(targetDate.getFullYear() - 2);
    } else if (selectedHorizon === "3Y") {
      targetDate.setFullYear(targetDate.getFullYear() - 3);
    } else if (selectedHorizon === "YTD") {
      targetDate = new Date(latestDate.getFullYear(), 0, 1);
    } else {
      // MAX
      targetDate = new Date(chronological[0].date);
    }

    // Find point closest to target date
    const targetTime = targetDate.getTime();
    let closestPoint = chronological[0];
    let minDiff = Math.abs(new Date(closestPoint.date).getTime() - targetTime);

    for (let i = 1; i < chronological.length; i++) {
      const diff = Math.abs(new Date(chronological[i].date).getTime() - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = chronological[i];
      }
    }

    const startValuation = closestPoint.valuation;
    if (startValuation <= 0) return null;

    const returnRate = (endValuation - startValuation) / startValuation;
    const grossFinal = amount * (1 + returnRate);
    const grossProfit = grossFinal - amount;

    let taxAmount = 0;
    if (includeBelkaTax && grossProfit > 0) {
      // Belka tax is 19%
      taxAmount = grossProfit * 0.19;
    }

    const netProfit = grossProfit - taxAmount;
    const netFinal = amount + netProfit;

    return {
      startDate: closestPoint.date,
      endDate: latest.date,
      startValuation,
      endValuation,
      returnRate,
      initialAmount: amount,
      grossProfit,
      taxAmount,
      netProfit,
      netFinal,
      isProfit: grossProfit >= 0,
    };
  }, [chronological, amount, selectedHorizon, includeBelkaTax]);

  if (chronological.length < 2) return null;

  return (
    <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#044CD0]" />
            {t.subfundDetail.simulator.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subfundDetail.simulator.desc}
          </p>
        </div>

        {/* Belka Tax switch */}
        <label className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer self-start sm:self-auto select-none">
          <input
            type="checkbox"
            checked={includeBelkaTax}
            onChange={(e) => setIncludeBelkaTax(e.target.checked)}
            className="w-4 h-4 rounded text-[#044CD0] focus:ring-[#044CD0] cursor-pointer"
          />
          <span>{t.subfundDetail.simulator.belkaTaxLabel}</span>
          <span title={t.subfundDetail.simulator.belkaTaxTooltip}>
            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
          </span>
        </label>
      </div>

      {/* Input row + horizon presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Amount Input */}
        <div className="lg:col-span-5 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.subfundDetail.simulator.initialCapital}
          </label>
          <div className="relative">
            <input
              type="number"
              min="100"
              max="10000000"
              step="500"
              value={amount || ""}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full h-11 px-3.5 pr-14 text-base font-bold bg-slate-50 dark:bg-[#030a16] border border-slate-300 dark:border-[#0e274d] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#044CD0] focus:ring-2 focus:ring-[#044CD0]/20 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              {currency}
            </span>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  amount === val
                    ? "bg-[#044CD0] text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-[#030a16] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d]"
                }`}
              >
                {val.toLocaleString()} {currency}
              </button>
            ))}
          </div>
        </div>

        {/* Horizons selector */}
        <div className="lg:col-span-7 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.subfundDetail.simulator.horizonLabel}
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-[#030a16] rounded-xl border border-slate-200 dark:border-[#0e274d]">
            {SIMULATOR_HORIZONS.map((h) => {
              const isSelected = selectedHorizon === h.id;
              const label = locale === "en" ? h.labelEn : h.labelPl;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedHorizon(h.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#044CD0] text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-[#071938]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {simulation && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 flex items-center gap-2">
              <span>od {formatDate(simulation.startDate)}</span>
              <span>→</span>
              <span>do {formatDate(simulation.endDate)}</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                ({simulation.returnRate >= 0 ? "+" : ""}{formatPercent(simulation.returnRate)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Output Cards */}
      {simulation && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Initial Deposit */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d]">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {t.subfundDetail.simulator.initialDeposit}
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {formatCurrency(simulation.initialAmount, currency)}
              </span>
            </div>

            {/* 2. Gross Result */}
            <div
              className={`p-3.5 rounded-2xl border ${
                simulation.isProfit
                  ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-500/25"
                  : "bg-rose-50/50 dark:bg-rose-950/15 border-rose-200 dark:border-rose-500/25"
              }`}
            >
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {simulation.isProfit
                  ? t.subfundDetail.simulator.grossProfit
                  : t.subfundDetail.simulator.grossLoss}
              </span>
              <span
                className={`text-base sm:text-lg font-bold mt-0.5 block ${
                  simulation.isProfit
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {simulation.isProfit ? "+" : ""}
                {formatCurrency(simulation.grossProfit, currency)}
              </span>
            </div>

            {/* 3. Belka Tax */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d]">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {t.subfundDetail.simulator.belkaTaxDeduction}
              </span>
              <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {simulation.taxAmount > 0
                  ? `-${formatCurrency(simulation.taxAmount, currency)}`
                  : "0,00 zł"}
              </span>
            </div>

            {/* 4. Net Payout (Highlight) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-[#044CD0]/20 dark:to-[#030a16] border border-blue-200 dark:border-[#044CD0]/40 shadow-xs">
              <span className="text-[11px] font-bold text-[#044CD0] dark:text-blue-300 block">
                {t.subfundDetail.simulator.netPayout}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {formatCurrency(simulation.netFinal, currency)}
              </span>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{
                  width: `${Math.min(100, Math.max(10, (simulation.initialAmount / simulation.netFinal) * 100))}%`,
                }}
                className="bg-[#044CD0] h-full"
                title={`${t.subfundDetail.simulator.initialDeposit}: ${formatCurrency(simulation.initialAmount, currency)}`}
              />
              {simulation.isProfit && simulation.netProfit > 0 && (
                <div
                  style={{
                    width: `${Math.min(90, (simulation.netProfit / simulation.netFinal) * 100)}%`,
                  }}
                  className="bg-emerald-500 h-full"
                  title={`${t.subfundDetail.simulator.netProfit}: ${formatCurrency(simulation.netProfit, currency)}`}
                />
              )}
              {simulation.taxAmount > 0 && (
                <div
                  style={{
                    width: `${Math.min(30, (simulation.taxAmount / simulation.netFinal) * 100)}%`,
                  }}
                  className="bg-amber-500 h-full"
                  title={`${t.subfundDetail.simulator.belkaTaxDeduction}: ${formatCurrency(simulation.taxAmount, currency)}`}
                />
              )}
            </div>

            {/* Bar Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#044CD0]" />
                <span>{t.subfundDetail.simulator.initialDeposit} ({formatCurrency(simulation.initialAmount, currency)})</span>
              </div>
              {simulation.isProfit ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{t.subfundDetail.simulator.netProfit} (+{formatCurrency(simulation.netProfit, currency)})</span>
                  </div>
                  {simulation.taxAmount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>{t.subfundDetail.simulator.belkaTaxDeduction} ({formatCurrency(simulation.taxAmount, currency)})</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{t.subfundDetail.simulator.grossLoss} ({formatCurrency(simulation.grossProfit, currency)})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
