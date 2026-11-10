"use client";

import React, { useMemo } from "react";
import { Coins, Layers, Building2, TrendingUp, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useTranslation } from "@/lib/i18n";
import { useAccessibility } from "@/lib/accessibility";
import { KNFTotalAsset } from "@/types/knf";

interface StatsViewProps {
  stats: {
    totalAssetsGross: number;
    totalAssetsNet: number;
    activeSubfundsCount: number;
    activeFundsCount: number;
    companiesCount: number;
  };
  history: KNFTotalAsset[];
}

export function StatsView({ stats, history }: StatsViewProps) {
  const { t, locale, formatLargeNumber, formatDate, formatNumber } = useTranslation();
  const { reducedMotion } = useAccessibility();

  const chronologicalHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <BarChart2 className="w-7 h-7 text-[#044CD0]" />
          <span>{t.stats.title}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          {t.stats.desc}
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-5 shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">{t.hero.netAssets}</span>
            <Coins className="w-4 h-4 text-[#044CD0] shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-slate-100 truncate">
            {formatLargeNumber(stats.totalAssetsNet)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
            {t.hero.grossAssets}: {formatLargeNumber(stats.totalAssetsGross)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-5 shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">{t.hero.activeSubfunds}</span>
            <Layers className="w-4 h-4 text-[#044CD0] dark:text-blue-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-[#044CD0] dark:text-blue-400">
            {formatNumber(stats.activeSubfundsCount, 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
            {t.hero.activeSubfundsDesc}
          </div>
        </div>

        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-5 shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">{t.hero.funds}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-cyan-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatNumber(stats.activeFundsCount, 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
            {t.hero.fundsDesc}
          </div>
        </div>

        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-5 shadow-xs dark:shadow-md transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold truncate">{t.hero.companies}</span>
            <Building2 className="w-4 h-4 text-[#044CD0] shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatNumber(stats.companiesCount, 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
            {t.hero.companiesDesc}
          </div>
        </div>
      </div>

      {/* Historical Asset Trends Chart */}
      {chronologicalHistory.length > 1 && (
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-xl transition-colors space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[#044CD0]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.stats.historyTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.stats.historyDesc}
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chronologicalHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossAssetsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#044CD0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#044CD0" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="netAssetsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00b4d8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(d) => {
                    const date = new Date(d);
                    return `${date.getDate()} ${date.toLocaleString(locale === "pl" ? "pl-PL" : "en-US", { month: "short" })}`;
                  }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const billionsUnit = locale === "pl" ? " mld" : " bn";
                    const millionsUnit = locale === "pl" ? " mln" : " m";
                    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(0)}${billionsUnit}`;
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}${millionsUnit}`;
                    return String(v);
                  }}
                />
                <Tooltip
                  isAnimationActive={!reducedMotion}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 dark:bg-[#030a16]/95 border border-slate-200 dark:border-[#0e274d] p-3 rounded-xl shadow-xl text-xs space-y-1.5 text-slate-800 dark:text-slate-100 backdrop-blur-sm">
                          <div className="text-slate-500 dark:text-slate-400 font-semibold mb-1">
                            {formatDate(String(label))}
                          </div>
                          {payload.map((item, i: number) => {
                            const numVal = typeof item.value === "number" ? item.value : Number(item.value) || 0;
                            return (
                              <div key={i} className="flex items-center justify-between gap-4">
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span>{item.name}</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                                  {formatLargeNumber(numVal)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="assets"
                  name={t.stats.grossAssets}
                  stroke="#044CD0"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#grossAssetsGrad)"
                  isAnimationActive={!reducedMotion}
                />
                <Area
                  type="monotone"
                  dataKey="netAssets"
                  name={t.stats.netAssets}
                  stroke="#00b4d8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#netAssetsGrad)"
                  isAnimationActive={!reducedMotion}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historical Assets Table */}
      <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.stats.historyTitle} (tabela)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.stats.historyDesc}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-[#030a16] text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-[#0e274d]">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.stats.reportDate}</th>
                <th className="py-3 px-4 font-semibold">{t.stats.grossAssets}</th>
                <th className="py-3 px-4 font-semibold">{t.stats.netAssets}</th>
                <th className="py-3 px-4 text-right font-semibold">{t.stats.diffLiabilities}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#0e274d]/60 text-slate-700 dark:text-slate-300">
              {history.map((row) => {
                const diff = row.assets - row.netAssets;
                return (
                  <tr key={row.date} className="hover:bg-blue-50/40 dark:hover:bg-[#071938]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#044CD0] dark:text-blue-400">
                      {formatLargeNumber(row.assets)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-emerald-700 dark:text-cyan-400">
                      {formatLargeNumber(row.netAssets)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {formatLargeNumber(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

