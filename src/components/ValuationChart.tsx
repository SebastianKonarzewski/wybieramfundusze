"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { KNFValuation } from "@/types/knf";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, Maximize2 } from "lucide-react";

interface ValuationChartProps {
  valuations: KNFValuation[];
  currency?: string;
}

export function ValuationChart({ valuations, currency = "PLN" }: ValuationChartProps) {
  const [selectedRange, setSelectedRange] = useState<"1M" | "3M" | "6M" | "1Y" | "3Y" | "MAX">("1Y");

  // Sort chronologically ascending for the chart
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

  if (valuations.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
        <Calendar className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Brak zarejestrowanych wycen w bazie UKNF dla wybranego okresu.</p>
      </div>
    );
  }

  const isPositive = stats.returnRate >= 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-md">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
            Wycena jednostki uczestnictwa
          </div>
          <div className="flex items-baseline gap-3">
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
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositive ? "+" : ""}
              {formatPercent(stats.returnRate)}
              <span className="text-[11px] font-normal opacity-80">
                ({isPositive ? "+" : ""}
                {formatCurrency(stats.diff, currency)})
              </span>
            </span>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(["1M", "3M", "6M", "1Y", "3Y", "MAX"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedRange === range
                  ? "bg-slate-800 text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity={0}
                />
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
                return `${date.getDate()} ${date.toLocaleString("pl-PL", { month: "short" })}`;
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as KNFValuation;
                  return (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl shadow-xl text-xs">
                      <div className="text-slate-400 font-medium mb-1">
                        {formatDate(data.date)}
                      </div>
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
              stroke={isPositive ? "#10b981" : "#f43f5e"}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#valGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Min / Max Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
        <div>
          Min w okresie:{" "}
          <strong className="text-slate-200">{formatCurrency(stats.min, currency)}</strong>
        </div>
        <div>
          Liczba wycen: <strong className="text-slate-200">{filteredData.length}</strong>
        </div>
        <div>
          Max w okresie:{" "}
          <strong className="text-slate-200">{formatCurrency(stats.max, currency)}</strong>
        </div>
      </div>
    </div>
  );
}

