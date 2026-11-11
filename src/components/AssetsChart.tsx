"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KNFAsset } from "@/types/knf";
import { Coins } from "lucide-react";
import { FormattedLargeNumber } from "./FormattedAmount";
import { useTranslation } from "@/lib/i18n";
import { useAccessibility } from "@/lib/accessibility";

export function AssetsChart({ assets }: { assets: KNFAsset[] }) {
  const { t, locale, formatLargeNumber, formatDate } = useTranslation();
  const { reducedMotion } = useAccessibility();

  const chronological = useMemo(() => {
    return [...assets]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-24); // last 24 reports
  }, [assets]);

  if (assets.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-[#051329]/50 border border-slate-200 dark:border-[#0e274d] rounded-2xl text-slate-500 shadow-sm">
        <Coins className="w-8 h-8 mb-2 opacity-50 text-[#044CD0]" />
        <p className="text-sm font-medium">{t.assets.noAssets}</p>
      </div>
    );
  }

  const latest = chronological[chronological.length - 1];
  const currency = latest.currency || "PLN";

  return (
    <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1">
            {t.assets.title}
          </div>
          <div className="flex items-baseline gap-3">
            <FormattedLargeNumber
              value={latest.netAssets}
              currency={currency}
              className="inline-flex items-baseline gap-1.5"
              valueClassName="text-2xl font-extrabold text-slate-900 dark:text-slate-100"
              unitClassName="text-sm font-bold text-slate-500 dark:text-slate-400"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({t.assets.netAssetsOn} {formatDate(latest.date)})
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t.assets.grossAssetsLabel}{" "}
          <FormattedLargeNumber
            value={latest.assets}
            currency={currency}
            className="inline-flex items-baseline gap-1"
            valueClassName="font-bold text-slate-800 dark:text-slate-200"
            unitClassName="text-[11px] font-medium text-slate-500 dark:text-slate-400"
          />
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chronological} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                return v;
              }}
            />
            <Tooltip
              isAnimationActive={!reducedMotion}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as KNFAsset;
                  return (
                    <div className="bg-white dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] p-3.5 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                        {t.assets.reportLabel} {formatDate(data.date)}
                      </div>
                      <div className="text-[#044CD0] dark:text-blue-400 font-semibold">
                        {t.assets.netAssetsLabel} {formatLargeNumber(data.netAssets, data.currency || currency)}
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-semibold">
                        {t.assets.grossAssetsTooltip} {formatLargeNumber(data.assets, data.currency || currency)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="netAssets" fill="#044CD0" radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
