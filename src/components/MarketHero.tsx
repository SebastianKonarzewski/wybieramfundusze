"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Coins,
  Layers,
  Building2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import { MarketStatistics } from "@/types/knf";
import { useTranslation } from "@/lib/i18n";

export function MarketHero({ stats }: { stats: MarketStatistics }) {
  const { t, locale, formatLargeNumber, formatDate, formatNumber, formatPercent } = useTranslation();

  // Calculate 12-month asset trend dynamics if history is available
  const trendData = useMemo(() => {
    if (!stats.assetsHistory || stats.assetsHistory.length < 2) return null;

    const series = stats.assetsHistory;
    const start = series[0].assets;
    const end = series[series.length - 1].assets;
    const diff = end - start;
    const rate = start > 0 ? diff / start : 0;

    return {
      series,
      start,
      end,
      diff,
      rate,
      isPositive: rate >= 0,
    };
  }, [stats.assetsHistory]);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] p-4 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-2xl">
      {/* Background glow effects with UKNF blue */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#044CD0]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#02224D]/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Top Header: Title & Active Notice & Date Badge */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-slate-400 mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base leading-relaxed">
              {t.hero.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {/* Global Active Notice Badge */}
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.hero.activeEntitiesNotice}</span>
            </div>

            {/* Date Badge */}
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 bg-[#030a16]/80 border border-[#0e274d] px-2.5 sm:px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-[#044CD0]" />
              <span>{t.hero.marketDataDate} <strong className="text-slate-200">{formatDate(stats.statsDate)}</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Assets in Funds (AUM) */}
          <div className="bg-[#030a16]/85 border border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold truncate text-slate-300">
                {t.hero.grossAssets}
              </span>
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#044CD0] group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-100 truncate">
              {formatLargeNumber(stats.totalAssetsGross)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
              {t.hero.netAssets}: <span className="text-blue-400 font-semibold">{formatLargeNumber(stats.totalAssetsNet)}</span>
            </div>
          </div>

          {/* Card 2: Active Subfunds */}
          <div className="bg-[#030a16]/85 border border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold truncate text-slate-300">
                {t.hero.activeSubfunds}
              </span>
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-blue-400">
              {formatNumber(stats.activeSubfundsCount, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
              {t.hero.activeSubfundsDesc}
            </div>
          </div>

          {/* Card 3: Active Funds (Umbrella + Standalone, incl. ETFs) */}
          <div className="bg-[#030a16]/85 border border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold truncate text-slate-300">
                {t.hero.funds}
              </span>
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-100">
              {formatNumber(stats.activeFundsCount, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
              {t.hero.fundsDesc}
            </div>
          </div>

          {/* Card 4: Licensed Fund Managers (TFI) */}
          <div className="bg-[#030a16]/85 border border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold truncate text-slate-300">
                {t.hero.companies}
              </span>
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#044CD0] group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-100">
              {formatNumber(stats.companiesCount, 0)}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
              {t.hero.companiesDesc}
            </div>
          </div>
        </div>

        {/* Subtle Market Assets Dynamics Sparkline Strip */}
        {trendData && (
          <div className="bg-[#030a16]/75 border border-[#0e274d] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left: Trend summary metric */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div className="w-8 h-8 rounded-lg bg-[#044CD0]/15 border border-[#044CD0]/30 flex items-center justify-center text-[#3b82f6] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {t.hero.marketTrend}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm sm:text-base font-extrabold ${trendData.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {trendData.isPositive ? "+" : ""}{formatPercent(trendData.rate)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({trendData.isPositive ? "+" : ""}{formatLargeNumber(trendData.diff)})
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Compact Sparkline AreaChart */}
            <div className="h-10 w-full md:max-w-xs lg:max-w-md shrink-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData.series} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="heroSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#044CD0" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#044CD0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#030a16] border border-[#0e274d] px-2.5 py-1.5 rounded-lg shadow-xl text-[11px]">
                            <span className="text-slate-400 mr-2">{formatDate(item.date)}:</span>
                            <span className="font-bold text-slate-100">{formatLargeNumber(item.assets)}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="assets"
                    stroke="#044CD0"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#heroSparklineGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Link to full stats page */}
            <Link
              href="/statystyki"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#60a5fa] hover:text-white transition-colors shrink-0 self-end md:self-auto"
            >
              <span>{t.hero.fullHistoryLink}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Educational Insight Note */}
        <div className="flex items-start gap-2.5 bg-[#030a16]/60 border border-[#0e274d]/80 rounded-xl p-3 text-[11px] sm:text-xs text-slate-400 leading-relaxed">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            {t.hero.educationalNote}
          </p>
        </div>
      </div>
    </div>
  );
}
