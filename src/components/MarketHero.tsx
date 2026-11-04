"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Coins,
  Layers,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from "recharts";
import { MarketStatistics } from "@/types/knf";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAccessibility } from "@/lib/accessibility";

export function MarketHero({ stats }: { stats: MarketStatistics }) {
  const { t, formatLargeNumber, formatDate, formatNumber, formatPercent } = useTranslation();
  const { theme } = useTheme();
  const { highContrast } = useAccessibility();
  const isLight = theme === "light";

  // Calculate 12-month asset trend dynamics with proper min/max scaling
  const trendData = useMemo(() => {
    if (!stats.assetsHistory || stats.assetsHistory.length < 2) return null;

    const series = stats.assetsHistory;
    const start = series[0].netAssets || series[0].assets;
    const end = series[series.length - 1].netAssets || series[series.length - 1].assets;
    const diff = end - start;
    const rate = start > 0 ? diff / start : 0;

    const values = series.map((d) => d.netAssets || d.assets);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const ySpan = maxVal - minVal;
    // Buffer for realistic slope visualization
    const yPadding = ySpan > 0 ? ySpan * 0.25 : minVal * 0.05;

    return {
      series,
      start,
      end,
      diff,
      rate,
      isPositive: rate >= 0,
      yMin: Math.max(0, minVal - yPadding),
      yMax: maxVal + yPadding,
    };
  }, [stats.assetsHistory]);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] p-4 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-2xl">
      {/* Background glow effects with UKNF blue - dark mode only */}
      <div data-component="hero-glow-blob" className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#044CD0]/15 dark:block hidden blur-3xl pointer-events-none" />
      <div data-component="hero-glow-blob" className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#02224D]/30 dark:block hidden blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Top Header: Title & Market Data Date */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm lg:text-base leading-relaxed">
              {t.hero.desc}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-[#030a16]/80 border border-slate-200 dark:border-[#0e274d] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl self-start lg:self-auto shrink-0 shadow-xs">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#044CD0]" />
            <span>
              {t.hero.marketDataDate} <strong className="text-slate-800 dark:text-slate-200">{formatDate(stats.statsDate)}</strong>
            </span>
          </div>
        </div>

        {/* 3 Key Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Net Assets in Funds (AUM) */}
          <div className="bg-white/95 dark:bg-[#030a16]/85 border border-blue-100 dark:border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 transition-all shadow-sm dark:shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-1.5">
              <span className="text-xs sm:text-sm font-semibold truncate text-slate-700 dark:text-slate-300">
                {t.hero.netAssets}
              </span>
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-[#044CD0] group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 truncate">
              {formatLargeNumber(stats.totalAssetsNet)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
              {t.hero.grossAssets}: <span className="text-blue-600 dark:text-blue-400 font-semibold">{formatLargeNumber(stats.totalAssetsGross)}</span>
            </div>
          </div>

          {/* Card 2: Investable Products (Subfunds + Standalone Funds) */}
          <div className="bg-white/95 dark:bg-[#030a16]/85 border border-blue-100 dark:border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 transition-all shadow-sm dark:shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-1.5">
              <span className="text-xs sm:text-sm font-semibold truncate text-slate-700 dark:text-slate-300">
                {t.hero.investableProducts}
              </span>
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-400">
              {formatNumber(stats.investableProductsCount || 688, 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
              {t.hero.investableProductsDesc}
            </div>
          </div>

          {/* Card 3: Fund Managers (TFI) */}
          <div className="bg-white/95 dark:bg-[#030a16]/85 border border-blue-100 dark:border-[#0e274d] hover:border-[#044CD0]/60 rounded-xl sm:rounded-2xl px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 transition-all shadow-sm dark:shadow-md group">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-1.5">
              <span className="text-xs sm:text-sm font-semibold truncate text-slate-700 dark:text-slate-300">
                {t.hero.companies}
              </span>
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#044CD0] group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100">
              {formatNumber(stats.companiesCount, 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
              {t.hero.companiesDesc}
            </div>
          </div>
        </div>

        {/* Dynamic Market Assets Trend Strip with Scaled Domain */}
        {trendData && (
          <div className="bg-white dark:bg-[#030a16]/75 border border-slate-200/90 dark:border-[#0e274d] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs dark:shadow-md">
            {/* Left: Trend summary & concrete values */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div
                data-component="trend-icon-box"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  trendData.isPositive
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
                }`}
              >
                {trendData.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-[11px] text-slate-700 dark:text-slate-400 font-semibold">
                  {t.hero.marketTrend}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm sm:text-base font-extrabold ${
                      trendData.isPositive
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {trendData.isPositive ? "+" : ""}
                    {formatPercent(trendData.rate)}
                  </span>
                  <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold">
                    ({trendData.isPositive ? "+" : ""}
                    {formatLargeNumber(trendData.diff)})
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                  {t.hero.trendRange
                    .replace("{start}", formatLargeNumber(trendData.start))
                    .replace("{end}", formatLargeNumber(trendData.end))}
                </div>
              </div>
            </div>

            {/* Middle: Sparkline AreaChart with scaled Y-Axis domain (no flat line!) */}
            <div className="h-12 sm:h-14 w-full md:max-w-xs lg:max-w-md shrink-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData.series}
                  margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="heroScaledGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={highContrast ? "transparent" : isLight ? "#60a5fa" : "#044CD0"}
                        stopOpacity={highContrast ? 0 : isLight ? 0.08 : 0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={highContrast ? "transparent" : "#044CD0"}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[trendData.yMin, trendData.yMax]} hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] px-2.5 py-1.5 rounded-lg shadow-xl text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 mr-2">{formatDate(item.date)}:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatLargeNumber(item.netAssets || item.assets)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="netAssets"
                    stroke={highContrast ? "#ffff00" : isLight ? "#044CD0" : "#3b82f6"}
                    strokeWidth={2}
                    fillOpacity={highContrast ? 0 : 1}
                    fill={highContrast ? "none" : "url(#heroScaledGrad)"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Direct Link to full stats page */}
            <Link
              href="/statystyki"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#044CD0] dark:text-[#60a5fa] hover:text-[#033eb0] dark:hover:text-white transition-colors shrink-0 self-end md:self-auto"
            >
              <span>{t.hero.fullHistoryLink}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Factual Note on Fund vs Subfund categorization */}
        <div className="flex items-start gap-2.5 bg-white/80 dark:bg-[#030a16]/60 border border-blue-200/60 dark:border-[#0e274d]/80 rounded-xl p-3 text-[11px] sm:text-xs text-slate-700 dark:text-slate-400 leading-relaxed shadow-xs">
          <Info className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6] shrink-0 mt-0.5" />
          <p>{t.hero.educationalNote}</p>
        </div>
      </div>
    </div>
  );
}
