"use client";

import React from "react";
import { Coins, Layers, Building2, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
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
  const { t, formatLargeNumber, formatDate, formatNumber } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          {t.stats.title}
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          {t.stats.desc}
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-[#051329] border border-[#0e274d] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">{t.hero.netAssets}</span>
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#044CD0] shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-100 truncate">
            {formatLargeNumber(stats.totalAssetsNet)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            {t.hero.grossAssets}: {formatLargeNumber(stats.totalAssetsGross)}
          </div>
        </div>

        <div className="bg-[#051329] border border-[#0e274d] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">{t.hero.activeSubfunds}</span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-blue-400">
            {formatNumber(stats.activeSubfundsCount, 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            {t.hero.activeSubfundsDesc}
          </div>
        </div>

        <div className="bg-[#051329] border border-[#0e274d] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">{t.hero.funds}</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-100">
            {formatNumber(stats.activeFundsCount, 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            {t.hero.fundsDesc}
          </div>
        </div>

        <div className="bg-[#051329] border border-[#0e274d] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-medium truncate">{t.hero.companies}</span>
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#044CD0] shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-100">
            {formatNumber(stats.companiesCount, 0)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            {t.hero.companiesDesc}
          </div>
        </div>
      </div>

      {/* Historical Assets Table */}
      <div className="bg-[#051329] border border-[#0e274d] rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            {t.stats.historyTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {t.stats.historyDesc}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#030a16] text-slate-400 uppercase text-[11px] tracking-wider border-b border-[#0e274d]">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.stats.reportDate}</th>
                <th className="py-3 px-4 font-semibold">{t.stats.grossAssets}</th>
                <th className="py-3 px-4 font-semibold">{t.stats.netAssets}</th>
                <th className="py-3 px-4 text-right font-semibold">{t.stats.diffLiabilities}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0e274d]/60 text-slate-300">
              {history.map((row) => {
                const diff = row.assets - row.netAssets;
                return (
                  <tr key={row.date} className="hover:bg-[#071938]/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-400">
                      {formatLargeNumber(row.assets)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                      {formatLargeNumber(row.netAssets)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
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

