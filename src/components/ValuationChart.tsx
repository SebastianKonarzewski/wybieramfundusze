"use client";

import React, { useState, useMemo, useEffect, startTransition } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { KNFValuation } from "@/types/knf";
import { TrendingUp, TrendingDown, Calendar, LineChart as ChartIcon, RefreshCw } from "lucide-react";
import { BenchmarkSeries } from "@/lib/benchmark-api";
import { useTranslation } from "@/lib/i18n";
import { useAccessibility } from "@/lib/accessibility";

interface ValuationChartProps {
  valuations: KNFValuation[];
  currency?: string;
  defaultBenchmark?: "NONE" | "WIG" | "TBSP";
}

export function ValuationChart({
  valuations,
  currency = "PLN",
  defaultBenchmark = "NONE",
}: ValuationChartProps) {
  const { t, locale, formatCurrency, formatDate, formatPercent } = useTranslation();
  const { reducedMotion } = useAccessibility();
  const [selectedRange, setSelectedRange] = useState<"1M" | "3M" | "6M" | "1Y" | "3Y" | "MAX">("1Y");
  const [activeBenchmark, setActiveBenchmark] = useState<"NONE" | "WIG" | "TBSP">(defaultBenchmark);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkSeries | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // Fetch benchmark data when benchmark changes
  useEffect(() => {
    if (activeBenchmark === "NONE") {
      startTransition(() => {
        setBenchmarkData(null);
      });
      return;
    }

    const rangeParam =
      selectedRange === "1M"
        ? "1mo"
        : selectedRange === "3M"
        ? "3mo"
        : selectedRange === "6M"
        ? "6mo"
        : selectedRange === "1Y"
        ? "1y"
        : selectedRange === "3Y"
        ? "3y"
        : "5y";

    const fetchBench = async () => {
      setBenchmarkLoading(true);
      try {
        const res = await fetch(`/api/benchmarks?symbol=${activeBenchmark}&range=${rangeParam}`);
        if (res.ok) {
          const json = await res.json();
          setBenchmarkData(json);
        }
      } catch (err) {
        console.error("Error fetching benchmark:", err);
      } finally {
        setBenchmarkLoading(false);
      }
    };

    fetchBench();
  }, [activeBenchmark, selectedRange]);

  // Sort valuations chronologically ascending
  const chronological = useMemo(() => {
    return [...valuations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [valuations]);

  // Filter based on range
  const filteredData = useMemo(() => {
    if (chronological.length === 0) return [];
    if (selectedRange === "MAX") return chronological;

    const latestDate = new Date(chronological[chronological.length - 1].date);
    const cutoffDate = new Date(latestDate);

    switch (selectedRange) {
      case "1M":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case "3M":
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case "6M":
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case "1Y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case "3Y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 3);
        break;
    }

    const filtered = chronological.filter((item) => new Date(item.date) >= cutoffDate);
    return filtered.length > 1 ? filtered : chronological.slice(-10);
  }, [chronological, selectedRange]);

  // Performance calculations
  const stats = useMemo(() => {
    if (filteredData.length < 2) {
      const current = filteredData[0]?.valuation ?? 0;
      return { start: current, end: current, diff: 0, returnRate: 0, min: current, max: current };
    }

    const start = filteredData[0].valuation;
    const end = filteredData[filteredData.length - 1].valuation;
    const diff = end - start;
    const returnRate = start > 0 ? diff / start : 0;

    let min = start;
    let max = start;
    filteredData.forEach((d) => {
      if (d.valuation < min) min = d.valuation;
      if (d.valuation > max) max = d.valuation;
    });

    return { start, end, diff, returnRate, min, max };
  }, [filteredData]);

  // Aligned chart points with benchmark if active
  const alignedChartData = useMemo(() => {
    if (activeBenchmark === "NONE" || !benchmarkData || filteredData.length === 0) {
      return filteredData.map((d) => ({
        date: d.date,
        valuation: d.valuation,
      }));
    }

    // Benchmark mode: normalize both series to percentage return (%) from start
    const fundBase = filteredData[0].valuation;
    const benchPoints = benchmarkData.points;
    const benchMap: Record<string, number> = {};
    benchPoints.forEach((p) => {
      benchMap[p.date] = p.value;
    });

    // Find first available benchmark point on or before start
    const firstFundDate = new Date(filteredData[0].date).getTime();
    const availableBench = benchPoints.filter((p) => new Date(p.date).getTime() >= firstFundDate);
    const benchBase = availableBench[0]?.value || benchPoints[0]?.value || 1;

    return filteredData.map((d) => {
      const fundReturn = fundBase > 0 ? ((d.valuation - fundBase) / fundBase) * 100 : 0;

      // Find closest benchmark date on or before d.date
      const targetTime = new Date(d.date).getTime();
      let closestBenchVal = benchBase;
      for (const bp of benchPoints) {
        if (new Date(bp.date).getTime() <= targetTime) {
          closestBenchVal = bp.value;
        } else {
          break;
        }
      }

      const benchReturn = benchBase > 0 ? ((closestBenchVal - benchBase) / benchBase) * 100 : 0;

      return {
        date: d.date,
        valuation: d.valuation,
        fundReturn: parseFloat(fundReturn.toFixed(2)),
        benchmarkReturn: parseFloat(benchReturn.toFixed(2)),
      };
    });
  }, [filteredData, activeBenchmark, benchmarkData]);

  if (valuations.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-[#051329]/40 border border-[#0e274d] rounded-2xl text-slate-500">
        <Calendar className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">{t.chart.noValuations}</p>
      </div>
    );
  }

  const isPositive = stats.returnRate >= 0;

  return (
    <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-5 shadow-lg">
      {/* Top Bar: Valuation & Range & Benchmark Select */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
            {t.chart.unitValuation}
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {formatCurrency(stats.end, currency)}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg ${
                isPositive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? "+" : ""}
              {formatPercent(stats.returnRate)}
              <span className="text-[11px] font-normal opacity-80">
                ({isPositive ? "+" : ""}
                {formatCurrency(stats.diff, currency)})
              </span>
            </span>
          </div>
        </div>

        {/* Controls: Benchmark selector & Range buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Benchmark selector */}
          <div className="flex items-center gap-1.5 bg-[#030a16] border border-[#0e274d] px-2.5 py-1 rounded-xl text-xs">
            {benchmarkLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#044CD0] animate-spin" />
            ) : (
              <ChartIcon className="w-3.5 h-3.5 text-[#044CD0]" />
            )}
            <span className="text-slate-400 font-medium">{t.chart.benchmarkLabel}</span>
            <select
              value={activeBenchmark}
              onChange={(e) => setActiveBenchmark(e.target.value as "NONE" | "WIG" | "TBSP")}
              className="bg-transparent text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="NONE" className="bg-[#030a16]">{t.chart.noBenchmarkOption}</option>
              <option value="WIG" className="bg-[#030a16]">{t.chart.wigOption}</option>
              <option value="TBSP" className="bg-[#030a16]">{t.chart.tbspOption}</option>
            </select>
          </div>

          {/* Range Buttons */}
          <div className="flex items-center bg-[#030a16] p-1 rounded-xl border border-[#0e274d] overflow-x-auto">
            {(["1M", "3M", "6M", "1Y", "3Y", "MAX"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  selectedRange === range
                    ? "bg-[#044CD0] text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeBenchmark === "NONE" ? (
            <AreaChart data={alignedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="valGradUknf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#044CD0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#02224D" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) => {
                  const date = new Date(d);
                  return `${date.getDate()} ${date.toLocaleString(locale === "pl" ? "pl-PL" : "en-US", { month: "short" })}`;
                }}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 1", "dataMax + 1"]}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                isAnimationActive={!reducedMotion}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#030a16] border border-[#0e274d] px-3.5 py-2.5 rounded-xl shadow-xl text-xs">
                        <div className="text-slate-400 font-medium mb-1">{formatDate(data.date)}</div>
                        <div className="text-base font-bold text-slate-100">
                          {formatCurrency(data.valuation, currency)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="valuation"
                stroke="#044CD0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#valGradUknf)"
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          ) : (
            <LineChart data={alignedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(d) => {
                  const date = new Date(d);
                  return `${date.getDate()} ${date.toLocaleString(locale === "pl" ? "pl-PL" : "en-US", { month: "short" })}`;
                }}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                isAnimationActive={!reducedMotion}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-[#030a16] border border-[#0e274d] p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                        <div className="text-slate-400 font-semibold mb-1">{formatDate(String(label))}</div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#044CD0]" />
                            {t.chart.subfundSeries}
                          </span>
                          <span className="font-bold text-slate-100">
                            {row.fundReturn >= 0 ? "+" : ""}
                            {formatPercent(row.fundReturn / 100)}
                            <span className="text-[11px] text-slate-400 font-normal ml-1">
                              ({formatCurrency(row.valuation, currency)})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            {activeBenchmark === "WIG" ? "WIG20 TR" : "TBSP"}:
                          </span>
                          <span className="font-bold text-slate-100">
                            {row.benchmarkReturn >= 0 ? "+" : ""}
                            {formatPercent(row.benchmarkReturn / 100)}
                          </span>
                        </div>
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
                wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
              />
              <Line
                type="monotone"
                dataKey="fundReturn"
                name={t.chart.subfundSeries}
                stroke="#044CD0"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={!reducedMotion}
              />
              <Line
                type="monotone"
                dataKey="benchmarkReturn"
                name={activeBenchmark === "WIG" ? "WIG20 TR" : "TBSP"}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={!reducedMotion}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
