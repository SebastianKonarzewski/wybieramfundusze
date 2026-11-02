"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { KNFAsset } from "@/types/knf";
import { formatLargeNumber, formatDate } from "@/lib/utils";
import { Coins } from "lucide-react";

export function AssetsChart({ assets }: { assets: KNFAsset[] }) {
  const chronological = useMemo(() => {
    return [...assets]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-24); // last 24 reports
  }, [assets]);

  if (assets.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
        <Coins className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Brak zarejestrowanych raportów o aktywach w rejestrze UKNF.</p>
      </div>
    );
  }

  const latest = chronological[chronological.length - 1];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
            Wielkość aktywów pod zarządzaniem (AUM)
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-slate-100">
              {formatLargeNumber(latest.netAssets)}
            </span>
            <span className="text-xs text-slate-400">
              (Aktywa netto na dzień {formatDate(latest.date)})
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Brutto: <strong className="text-slate-200">{formatLargeNumber(latest.assets)}</strong>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chronological} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              tickFormatter={(v) => {
                if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(0)} mld`;
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)} mln`;
                return v;
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as KNFAsset;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="text-slate-400 font-medium mb-1">
                        Raport: {formatDate(data.date)}
                      </div>
                      <div className="text-teal-400 font-semibold">
                        Aktywa netto: {formatLargeNumber(data.netAssets)}
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        Aktywa brutto: {formatLargeNumber(data.assets)}
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
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
            />
            <Bar dataKey="netAssets" name="Aktywa Netto" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="assets" name="Aktywa Brutto" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

