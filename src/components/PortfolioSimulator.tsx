"use client";

import React, { useState, useEffect, useMemo, startTransition } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Trash2,
  X,
  Search,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Layers,
  PieChart as PieIcon,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Coins,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SubfundFullProfile } from "@/types/knf";
import { usePortfolio } from "./PortfolioContext";
import { RiskBadge } from "./RiskBadge";
import { useTranslation } from "@/lib/i18n";

// Palette for fund lines & donut chart slices
const FUND_PALETTE = [
  "#044CD0", // UKNF Primary Blue
  "#00b4d8", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#06b6d4", // Sky
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

// Model portfolio presets for 1-click test
const MODEL_PRESETS: {
  id: string;
  nameKey: "presetBalanced" | "presetGrowth" | "presetConservative";
  funds: { subfundId: number; name: string; type: string; category: string; allocation: number }[];
}[] = [
  {
    id: "balanced",
    nameKey: "presetBalanced",
    funds: [
      { subfundId: 1, name: "PKO Akcji Rynku Polskiego", type: "FIO", category: "Akcyjne", allocation: 60 },
      { subfundId: 3, name: "PKO Skarbowy", type: "FIO", category: "Dłużne", allocation: 40 },
    ],
  },
  {
    id: "growth",
    nameKey: "presetGrowth",
    funds: [
      { subfundId: 1, name: "PKO Akcji Rynku Polskiego", type: "FIO", category: "Akcyjne", allocation: 50 },
      { subfundId: 5, name: "PKO Technologii i Innowacji Globalny", type: "FIO", category: "Akcyjne", allocation: 50 },
    ],
  },
  {
    id: "conservative",
    nameKey: "presetConservative",
    funds: [
      { subfundId: 3, name: "PKO Skarbowy", type: "FIO", category: "Dłużne", allocation: 70 },
      { subfundId: 7, name: "PKO Konserwatywny", type: "FIO", category: "Krótkoterminowe dłużne", allocation: 30 },
    ],
  },
];

export function PortfolioSimulator() {
  const {
    portfolioFunds,
    removeFund,
    addFund,
    clearPortfolio,
    updateFundAllocation,
    setAllAllocationsEqual,
    setFunds,
  } = usePortfolio();

  const { t, formatCurrency, formatDate } = useTranslation();

  const [profiles, setProfiles] = useState<SubfundFullProfile[]>([]);

  // Capital & display options
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [showFeeDrag, setShowFeeDrag] = useState<boolean>(true);
  const [chartUnit, setChartUnit] = useState<"amount" | "percent">("amount");

  // Date range
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1Y");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Search modal state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ subfundId: number; name: string; type: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 1. Fetch full profiles for all portfolio funds
  useEffect(() => {
    if (portfolioFunds.length === 0) {
      startTransition(() => {
        setProfiles([]);
      });
      return;
    }

    const loadData = async () => {
      try {
        const ids = portfolioFunds.map((f) => f.subfundId).join(",");
        const res = await fetch(`/api/portfolio?ids=${ids}`);
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch (err) {
        console.error("Error loading portfolio data:", err);
      }
    };

    loadData();
  }, [portfolioFunds]);

  // 2. Fund live search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      startTransition(() => {
        setSearchResults([]);
      });
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/subfunds?search=${encodeURIComponent(searchQuery)}&size=10&enriched=false`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.content || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Determine available date bounds across all funds
  const dateBounds = useMemo(() => {
    if (profiles.length === 0) return null;

    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    profiles.forEach((p) => {
      p.valuations.forEach((v) => {
        const ts = new Date(v.date).getTime();
        if (!isNaN(ts)) {
          if (ts < minTimestamp) minTimestamp = ts;
          if (ts > maxTimestamp) maxTimestamp = ts;
        }
      });
    });

    if (minTimestamp === Infinity || maxTimestamp === -Infinity) return null;

    return {
      minDate: new Date(minTimestamp).toISOString().split("T")[0],
      maxDate: new Date(maxTimestamp).toISOString().split("T")[0],
      minTimestamp,
      maxTimestamp,
    };
  }, [profiles]);

  // Sync default period or custom dates
  useEffect(() => {
    if (!dateBounds) return;

    const maxTs = dateBounds.maxTimestamp;
    let startTs = maxTs;

    if (selectedPeriod === "1M") startTs = maxTs - 30 * 24 * 3600 * 1000;
    else if (selectedPeriod === "3M") startTs = maxTs - 90 * 24 * 3600 * 1000;
    else if (selectedPeriod === "6M") startTs = maxTs - 180 * 24 * 3600 * 1000;
    else if (selectedPeriod === "1Y") startTs = maxTs - 365 * 24 * 3600 * 1000;
    else if (selectedPeriod === "3Y") startTs = maxTs - 3 * 365 * 24 * 3600 * 1000;
    else if (selectedPeriod === "YTD") {
      const year = new Date(maxTs).getFullYear();
      startTs = new Date(`${year}-01-01`).getTime();
    } else if (selectedPeriod === "MAX") {
      startTs = dateBounds.minTimestamp;
    }

    startTs = Math.max(startTs, dateBounds.minTimestamp);

    const nextStart = new Date(startTs).toISOString().split("T")[0];
    const nextEnd = dateBounds.maxDate;
    startTransition(() => {
      setCustomStartDate(nextStart);
      setCustomEndDate(nextEnd);
    });
  }, [selectedPeriod, dateBounds]);

  // 4. Calculate total weights
  const totalAllocation = useMemo(() => {
    return portfolioFunds.reduce((sum, f) => sum + (f.allocation || 0), 0);
  }, [portfolioFunds]);

  // 5. Build Historical Portfolio Simulation Engine
  const simulation = useMemo(() => {
    if (profiles.length === 0 || !customStartDate || !customEndDate) {
      return null;
    }

    const startTs = new Date(customStartDate).getTime();
    const endTs = new Date(customEndDate).getTime();

    // Map each profile's valuations sorted chronologically
    const fundDataMap = new Map<
      number,
      {
        profile: SubfundFullProfile;
        sortedVals: { date: string; timestamp: number; valuation: number }[];
        annualFeeRate: number; // e.g. 0.015 for 1.5%
        weightFraction: number; // normalized weight [0..1]
      }
    >();

    const normDivisor = totalAllocation > 0 ? totalAllocation : profiles.length;

    profiles.forEach((p) => {
      const pFund = portfolioFunds.find((f) => f.subfundId === p.subfund.subfundId);
      const rawAllocation = pFund?.allocation ?? 1;
      const weightFraction = rawAllocation / normDivisor;

      // Ongoing management fee from KID, default 1.5% (0.015) if null
      const feeRateRaw = p.latestKid?.managementAndOtherFeesRate;
      let annualFeeRate = 0.015;
      if (typeof feeRateRaw === "number" && !isNaN(feeRateRaw) && feeRateRaw > 0) {
        // If > 0.5 it's likely percentage e.g. 1.5, convert to 0.015
        annualFeeRate = feeRateRaw > 0.5 ? feeRateRaw / 100 : feeRateRaw;
      }

      const sortedVals = p.valuations
        .map((v) => ({ date: v.date, timestamp: new Date(v.date).getTime(), valuation: v.valuation }))
        .filter((v) => !isNaN(v.timestamp))
        .sort((a, b) => a.timestamp - b.timestamp);

      fundDataMap.set(p.subfund.subfundId, {
        profile: p,
        sortedVals,
        annualFeeRate,
        weightFraction,
      });
    });

    // Gather all distinct dates within [startTs, endTs]
    const allDatesSet = new Set<string>();
    fundDataMap.forEach(({ sortedVals }) => {
      sortedVals.forEach((v) => {
        if (v.timestamp >= startTs && v.timestamp <= endTs) {
          allDatesSet.add(v.date);
        }
      });
    });

    const timeline = Array.from(allDatesSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (timeline.length < 2) {
      return null;
    }

    const t0Date = timeline[0];
    const t0Ts = new Date(t0Date).getTime();

    // Find initial valuation for each fund on or near t0
    const initialFundMetrics: Record<
      number,
      { baseVal: number; unitsAcquired: number; initialCapitalAllocated: number }
    > = {};

    fundDataMap.forEach(({ sortedVals, weightFraction }, subfundId) => {
      // Find valuation on t0 or first available
      let baseItem = sortedVals.find((v) => v.date === t0Date);
      if (!baseItem) {
        baseItem = sortedVals.find((v) => v.timestamp >= t0Ts) || sortedVals[0];
      }

      const baseVal = baseItem?.valuation && baseItem.valuation > 0 ? baseItem.valuation : 100;
      const initialCapitalAllocated = initialCapital * weightFraction;
      const unitsAcquired = initialCapitalAllocated / baseVal;

      initialFundMetrics[subfundId] = {
        baseVal,
        unitsAcquired,
        initialCapitalAllocated,
      };
    });

    // Compute day-by-day simulated portfolio trajectory
    const chartSeries: {
      date: string;
      netValue: number;
      grossValue: number;
      feeDrag: number;
      netReturnPct: number;
      grossReturnPct: number;
      [key: string]: string | number;
    }[] = [];

    let peakNetValue = initialCapital;
    let maxDrawdownPct = 0;

    timeline.forEach((dStr) => {
      const curTs = new Date(dStr).getTime();
      const daysElapsed = Math.max(0, (curTs - t0Ts) / (1000 * 3600 * 24));

      let totalNetVal = 0;
      let totalGrossVal = 0;
      const rowItem: Record<string, string | number> = { date: dStr };

      fundDataMap.forEach(({ sortedVals, annualFeeRate }, subfundId) => {
        // Find latest available valuation up to curTs
        let currentValObj = sortedVals.find((v) => v.date === dStr);
        if (!currentValObj) {
          // Fallback to nearest previous valuation (forward-fill)
          for (let i = sortedVals.length - 1; i >= 0; i--) {
            if (sortedVals[i].timestamp <= curTs) {
              currentValObj = sortedVals[i];
              break;
            }
          }
        }

        const baseMetric = initialFundMetrics[subfundId];
        const valNet = currentValObj?.valuation ?? baseMetric.baseVal;
        const fundNetVal = baseMetric.unitsAcquired * valNet;

        // Theoretical gross compounding: add back the accrued management fee
        // daily fee multiplier = (1 + fee / 365) ^ days
        const grossMultiplier = Math.pow(1 + annualFeeRate / 365, daysElapsed);
        const fundGrossVal = fundNetVal * grossMultiplier;

        totalNetVal += fundNetVal;
        totalGrossVal += fundGrossVal;

        // Individual fund trajectory tracking
        rowItem[`fund_${subfundId}`] = parseFloat(fundNetVal.toFixed(2));
      });

      // Track Max Drawdown
      if (totalNetVal > peakNetValue) {
        peakNetValue = totalNetVal;
      } else if (peakNetValue > 0) {
        const dd = ((peakNetValue - totalNetVal) / peakNetValue) * 100;
        if (dd > maxDrawdownPct) maxDrawdownPct = dd;
      }

      const netReturnPct = initialCapital > 0 ? ((totalNetVal - initialCapital) / initialCapital) * 100 : 0;
      const grossReturnPct = initialCapital > 0 ? ((totalGrossVal - initialCapital) / initialCapital) * 100 : 0;
      const feeDragVal = Math.max(0, totalGrossVal - totalNetVal);

      chartSeries.push({
        date: dStr,
        netValue: parseFloat(totalNetVal.toFixed(2)),
        grossValue: parseFloat(totalGrossVal.toFixed(2)),
        feeDrag: parseFloat(feeDragVal.toFixed(2)),
        netReturnPct: parseFloat(netReturnPct.toFixed(2)),
        grossReturnPct: parseFloat(grossReturnPct.toFixed(2)),
        ...rowItem,
      });
    });

    const latestPoint = chartSeries[chartSeries.length - 1];
    const totalDays = Math.max(1, (new Date(timeline[timeline.length - 1]).getTime() - t0Ts) / (1000 * 3600 * 24));
    const years = totalDays / 365.25;

    // CAGR (Compound Annual Growth Rate)
    let cagrPct = 0;
    if (years > 0 && initialCapital > 0 && latestPoint.netValue > 0) {
      cagrPct = (Math.pow(latestPoint.netValue / initialCapital, 1 / years) - 1) * 100;
    }

    // Weighted average ongoing fee and SRI
    let weightedFeeSum = 0;
    let weightedRiskSum = 0;
    fundDataMap.forEach(({ profile, annualFeeRate, weightFraction }) => {
      weightedFeeSum += annualFeeRate * weightFraction;
      const sri = profile.latestKid?.riskLevel || 3;
      weightedRiskSum += sri * weightFraction;
    });

    // Breakdown per fund at the end of period
    const fundBreakdown = Array.from(fundDataMap.entries()).map(([subfundId, data], idx) => {
      const metric = initialFundMetrics[subfundId];
      const rawEndVal = latestPoint?.[`fund_${subfundId}`];
      const endVal: number = typeof rawEndVal === "number" ? rawEndVal : metric.initialCapitalAllocated;
      const returnPct =
        metric.initialCapitalAllocated > 0
          ? ((endVal - metric.initialCapitalAllocated) / metric.initialCapitalAllocated) * 100
          : 0;

      return {
        subfundId,
        name: data.profile.subfund.name,
        type: data.profile.subfund.type,
        category: data.profile.subfund.category || data.profile.subfund.classification || "Fundusz",
        companyName: data.profile.company?.name || "TFI",
        weight: Math.round(data.weightFraction * 1000) / 10,
        initialVal: metric.initialCapitalAllocated,
        finalVal: endVal,
        returnPct,
        annualFee: data.annualFeeRate * 100,
        riskLevel: data.profile.latestKid?.riskLevel ?? null,
        color: FUND_PALETTE[idx % FUND_PALETTE.length],
      };
    });

    return {
      timeline,
      chartSeries,
      finalNetValue: latestPoint.netValue,
      finalGrossValue: latestPoint.grossValue,
      totalNetProfit: latestPoint.netValue - initialCapital,
      totalGrossProfit: latestPoint.grossValue - initialCapital,
      totalNetReturnPct: latestPoint.netReturnPct,
      totalGrossReturnPct: latestPoint.grossReturnPct,
      totalFeeDrag: latestPoint.feeDrag,
      cagrPct,
      maxDrawdownPct,
      weightedAvgFeePct: weightedFeeSum * 100,
      weightedAvgRisk: Math.round(weightedRiskSum * 10) / 10,
      fundBreakdown,
    };
  }, [profiles, portfolioFunds, customStartDate, customEndDate, initialCapital, totalAllocation]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] p-4 sm:p-6 rounded-2xl shadow-xs dark:shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.portfolio.summaryTitle}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              {portfolioFunds.length}/15
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t.portfolio.summarySubtitle.replace("{count}", String(portfolioFunds.length))}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSearching(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.portfolio.addFundBtn}
          </button>

          {portfolioFunds.length > 0 && (
            <>
              <button
                onClick={setAllAllocationsEqual}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-[#030a16] dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title={t.portfolio.equalWeightsBtn}
              >
                <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {t.portfolio.equalWeightsBtn}
              </button>

              <button
                onClick={clearPortfolio}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-rose-50 dark:bg-[#030a16] dark:hover:bg-rose-950/40 border border-slate-200 dark:border-[#0e274d] hover:border-rose-300 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title={t.common.clear}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.common.clear}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Empty State with 1-Click Model Presets */}
      {portfolioFunds.length === 0 && (
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-xs dark:shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <Briefcase className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.portfolio.emptyTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {t.portfolio.emptyDesc}
            </p>
          </div>

          {/* Quick presets for instant testing */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#0e274d]/80 max-w-2xl mx-auto">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.portfolio.presetsTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODEL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setFunds(preset.funds)}
                  className="p-3.5 text-left rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-[#030a16] dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] hover:border-blue-400 dark:hover:border-blue-500 transition-all text-xs space-y-1.5 cursor-pointer group shadow-2xs"
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#044CD0] dark:group-hover:text-blue-400 transition-colors">
                    {t.portfolio[preset.nameKey]}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{preset.funds.length} fundusze</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-600 dark:text-blue-400" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#044CD0] hover:text-[#033eb0] dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Layers className="w-3.5 h-3.5" />
                Przejdź do katalogu funduszy
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Portfolio Configuration Strip (Capital, Allocations & Date Controls) */}
      {portfolioFunds.length > 0 && (
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] p-4 sm:p-6 rounded-2xl shadow-xs dark:shadow-md space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-slate-100 dark:border-[#0e274d]/80">
            {/* Initial Capital */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.portfolio.initialAmount}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="1000"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Math.max(100, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#044CD0]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {t.portfolio.currency}
                </span>
              </div>
            </div>

            {/* Quick Period Selectors */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.portfolio.dateRangeLabel}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["1M", "3M", "6M", "1Y", "3Y", "YTD", "MAX"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedPeriod === p
                        ? "bg-[#044CD0] text-white shadow-xs"
                        : "bg-slate-50 dark:bg-[#030a16] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#0e274d] hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Datepickers */}
                <div className="flex items-center gap-1.5 ml-auto text-xs">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setSelectedPeriod("CUSTOM");
                      setCustomStartDate(e.target.value);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-xs font-medium text-slate-700 dark:text-slate-300"
                  />
                  <span className="text-slate-400">→</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setSelectedPeriod("CUSTOM");
                      setCustomEndDate(e.target.value);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-xs font-medium text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allocation sliders / weight controls for each fund */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="uppercase tracking-wider">Skład i alokacja wag:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  Math.round(totalAllocation) === 100
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                Suma wag: {Math.round(totalAllocation * 10) / 10}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {portfolioFunds.map((fund, idx) => {
                const color = FUND_PALETTE[idx % FUND_PALETTE.length];
                const weight = fund.allocation ?? 0;
                const plnAmount = (initialCapital * (weight / (totalAllocation || 100))).toFixed(0);

                return (
                  <div
                    key={fund.subfundId}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {fund.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFund(fund.subfundId)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer shrink-0"
                        title={t.portfolio.removeFromPortfolio}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={weight}
                        onChange={(e) => updateFundAllocation(fund.subfundId, parseFloat(e.target.value) || 0)}
                        className="w-full accent-[#044CD0] cursor-pointer"
                      />
                      <div className="flex items-center gap-1 shrink-0 font-mono font-bold text-xs">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weight}
                          onChange={(e) => updateFundAllocation(fund.subfundId, parseFloat(e.target.value) || 0)}
                          className="w-12 px-1 py-0.5 rounded border border-slate-300 dark:border-[#0e274d] bg-white dark:bg-[#051329] text-center"
                        />
                        <span>%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{fund.type || "FIO"}</span>
                      <span>≈ {formatCurrency(parseFloat(plnAmount))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Key Performance KPI Cards */}
      {simulation && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Final Value */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] shadow-xs dark:shadow-md space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>{t.portfolio.metrics.finalValue}</span>
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(simulation.finalNetValue)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Kapitał startowy: {formatCurrency(initialCapital)}
            </div>
          </div>

          {/* Card 2: Net Return & Profit */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] shadow-xs dark:shadow-md space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>{t.portfolio.metrics.netProfit}</span>
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div
              className={`text-lg sm:text-2xl font-black ${
                simulation.totalNetProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {simulation.totalNetProfit >= 0 ? "+" : ""}
              {formatCurrency(simulation.totalNetProfit)}
            </div>
            <div className="text-xs font-semibold">
              <span
                className={simulation.totalNetReturnPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}
              >
                {simulation.totalNetReturnPct >= 0 ? "+" : ""}
                {simulation.totalNetReturnPct.toFixed(2)}%
              </span>
              <span className="text-slate-400 ml-1.5">(CAGR: {simulation.cagrPct.toFixed(1)}% r/r)</span>
            </div>
          </div>

          {/* Card 3: Fee Drag (Cost Impact) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] shadow-xs dark:shadow-md space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>{t.portfolio.metrics.feeDrag}</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              -{formatCurrency(simulation.totalFeeDrag)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Śr. opłata stała: <strong className="text-slate-700 dark:text-slate-300">{simulation.weightedAvgFeePct.toFixed(2)}% p.a.</strong>
            </div>
          </div>

          {/* Card 4: Risk & Drawdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] shadow-xs dark:shadow-md space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>{t.portfolio.metrics.maxDrawdown}</span>
              <ShieldAlert className="w-4 h-4 text-[#044CD0]" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-rose-500">
              -{simulation.maxDrawdownPct.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Średnie ryzyko: <strong className="text-slate-700 dark:text-slate-300">SRI {simulation.weightedAvgRisk} / 7</strong>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Simulation Chart (Net vs Gross + Shaded Fee Drag) */}
      {simulation && (
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] p-4 sm:p-6 rounded-2xl shadow-xs dark:shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.portfolio.chartTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.portfolio.chartDesc}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              {/* Fee drag toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showFeeDrag}
                  onChange={(e) => setShowFeeDrag(e.target.checked)}
                  className="rounded border-slate-300 text-[#044CD0] focus:ring-[#044CD0] cursor-pointer"
                />
                <span>{t.portfolio.showFeeDrag}</span>
              </label>

              {/* Chart Mode (PLN vs %) */}
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-[#0e274d] p-0.5 bg-slate-50 dark:bg-[#030a16]">
                <button
                  onClick={() => setChartUnit("amount")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    chartUnit === "amount"
                      ? "bg-white dark:bg-[#071938] text-[#044CD0] dark:text-blue-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {t.portfolio.chartModeAmount}
                </button>
                <button
                  onClick={() => setChartUnit("percent")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    chartUnit === "percent"
                      ? "bg-white dark:bg-[#071938] text-[#044CD0] dark:text-blue-400 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {t.portfolio.chartModePercent}
                </button>
              </div>
            </div>
          </div>

          <div className="h-80 sm:h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simulation.chartSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  {/* Subtle gradient for net curve fill */}
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#044CD0" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#044CD0" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Gradient highlighting the fee drag gap between gross and net */}
                  <linearGradient id="feeDragGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => formatDate(val)}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  minTickGap={40}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => (chartUnit === "amount" ? `${(val / 1000).toFixed(1)}k` : `${val}%`)}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="bg-[#030a16]/95 border border-[#0e274d] p-3 rounded-xl shadow-xl text-xs space-y-1.5 text-slate-200 backdrop-blur-md">
                        <div className="font-bold text-slate-100 border-b border-[#0e274d] pb-1">
                          {formatDate(label ? String(label) : null)}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-[#60a5fa] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#044CD0]" />
                            {t.portfolio.legendNet}:
                          </span>
                          <span className="font-bold text-slate-100">
                            {formatCurrency(p.netValue)} ({p.netReturnPct >= 0 ? "+" : ""}
                            {p.netReturnPct}%)
                          </span>
                        </div>

                        {showFeeDrag && (
                          <>
                            <div className="flex items-center justify-between gap-4 text-cyan-400">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                {t.portfolio.legendGross}:
                              </span>
                              <span className="font-bold">
                                {formatCurrency(p.grossValue)} ({p.grossReturnPct >= 0 ? "+" : ""}
                                {p.grossReturnPct}%)
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-amber-400 pt-1 border-t border-[#0e274d]/60">
                              <span className="font-semibold">{t.portfolio.legendFeeDrag}:</span>
                              <span className="font-mono font-bold">-{formatCurrency(p.feeDrag)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(val) => (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{val}</span>
                  )}
                />

                {/* Shaded Gross Area when fee drag is enabled */}
                {showFeeDrag && (
                  <Area
                    type="monotone"
                    dataKey={chartUnit === "amount" ? "grossValue" : "grossReturnPct"}
                    name={t.portfolio.legendGross}
                    stroke="#00b4d8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#feeDragGradient)"
                    isAnimationActive={false}
                  />
                )}

                {/* Actual Net Portfolio Performance */}
                <Area
                  type="monotone"
                  dataKey={chartUnit === "amount" ? "netValue" : "netReturnPct"}
                  name={t.portfolio.legendNet}
                  stroke="#044CD0"
                  strokeWidth={2.5}
                  fill="url(#netGradient)"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 6. Fund Components Table & Asset Allocation Donut */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Detailed Fund Breakdown Table */}
          <div className="lg:col-span-2 bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-6 shadow-xs dark:shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Składniki portfela i wyniki jednostkowe
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#0e274d] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">{t.portfolio.table.fundName}</th>
                    <th className="py-2.5 px-3 text-right">{t.portfolio.table.weight}</th>
                    <th className="py-2.5 px-3 text-right">{t.portfolio.table.finalVal}</th>
                    <th className="py-2.5 px-3 text-right">{t.portfolio.table.returnPct}</th>
                    <th className="py-2.5 px-3 text-right">{t.portfolio.table.fee}</th>
                    <th className="py-2.5 px-3 text-right">{t.portfolio.table.risk}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#0e274d]/70 text-slate-700 dark:text-slate-300">
                  {simulation.fundBreakdown.map((f) => (
                    <tr key={f.subfundId} className="hover:bg-slate-50 dark:hover:bg-[#030a16]/40">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                          <div>
                            <Link
                              href={`/fundusze/${f.subfundId}`}
                              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#044CD0] dark:hover:text-blue-400 transition-colors line-clamp-1"
                            >
                              {f.name}
                            </Link>
                            <span className="text-[10px] text-slate-400">{f.companyName} • {f.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{f.weight}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(f.finalVal)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          f.returnPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {f.returnPct >= 0 ? "+" : ""}
                        {f.returnPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {f.annualFee.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <RiskBadge level={f.riskLevel} size="sm" showLabel={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Asset Allocation Donut Chart */}
          <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-6 shadow-xs dark:shadow-md flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t.portfolio.assetAllocationTitle}
            </h3>

            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={simulation.fundBreakdown}
                    dataKey="weight"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {simulation.fundBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, String(name)]}
                    contentStyle={{
                      backgroundColor: "#030a16",
                      borderColor: "#0e274d",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-[#0e274d]/80 text-xs">
              {simulation.fundBreakdown.map((f) => (
                <div key={f.subfundId} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">{f.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Institutional Educational Note on Ongoing Fees (Fee Drag) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#030a16]/80 border border-slate-200 dark:border-[#0e274d] text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {t.portfolio.feeAnalysisTitle}
        </div>
        <p className="leading-relaxed">
          {t.portfolio.feeAnalysisDesc}
        </p>
      </div>

      {/* 8. Search & Add Modal */}
      {isSearching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030a16]/85 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#044CD0] dark:text-blue-400" />
                {t.portfolio.searchModalTitle}
              </h3>
              <button
                onClick={() => setIsSearching(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={t.portfolio.searchModalPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#044CD0]"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {searchLoading && (
                <div className="text-center py-6 text-xs text-slate-400">
                  {t.portfolio.searchUKNFSearching}
                </div>
              )}

              {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  {t.portfolio.noSearchResults}
                </div>
              )}

              {searchResults.map((item) => {
                const alreadyIn = portfolioFunds.some((f) => f.subfundId === item.subfundId);
                return (
                  <div
                    key={item.subfundId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#030a16] hover:bg-blue-50 dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.type || "FIO"} • ID: {item.subfundId}
                      </span>
                    </div>

                    <button
                      disabled={alreadyIn}
                      onClick={() => {
                        addFund({
                          subfundId: item.subfundId,
                          name: item.name,
                          type: item.type,
                        });
                        setIsSearching(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                        alreadyIn
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-[#044CD0] hover:bg-[#033eb0] text-white"
                      }`}
                    >
                      {alreadyIn ? t.portfolio.inPortfolio : t.compare.select}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
