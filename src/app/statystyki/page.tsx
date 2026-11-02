import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareProvider } from "@/components/CompareContext";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
import { knfApi } from "@/lib/knf-api";
import { BarChart2, Coins, Calendar, ShieldCheck, Layers, Building2, TrendingUp } from "lucide-react";
import { formatLargeNumber, formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const [stats, totalAssetsHistoryRes] = await Promise.all([
    knfApi.getMarketStats(),
    knfApi.getTotalAssets({ size: 24, sort: "date,desc" }),
  ]);

  const history = totalAssetsHistoryRes.content || [];

  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Stan i Struktura Rynku Funduszy w Polsce
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Agregowane dane dotyczące aktywów pod zarządzaniem (AUM), struktury prawnej podmiotów oraz dynamiki rynku funduszy inwestycyjnych.
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Aktywa Brutto (AUM)</span>
                <Coins className="w-4 h-4 text-[#044CD0]" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                {formatLargeNumber(stats.totalAssetsGross)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Netto: {formatLargeNumber(stats.totalAssetsNet)}
              </div>
            </div>

            <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Aktywne Subfundusze</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-400">
                {formatNumber(stats.activeSubfundsCount, 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Wybór z pełnego rejestru
              </div>
            </div>

            <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Fundusze Inwestycyjne</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                {formatNumber(stats.activeFundsCount, 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                FIO, SFIO, FIZ, ETF
              </div>
            </div>

            <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Towarzystwa (TFI)</span>
                <Building2 className="w-4 h-4 text-[#044CD0]" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                {formatNumber(stats.companiesCount, 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Aktywnie zarządzające
              </div>
            </div>
          </div>

          {/* Historical Assets Table */}
          <div className="bg-[#051329] border border-[#0e274d] rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Historia Raportowanych Aktywów Rynku Polskiego
              </h2>
              <p className="text-xs text-slate-400">
                Miesięczne i kwartalne stany aktywów brutto i netto z zasobów UKNF (endpoint /v1/total-assets).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#030a16] text-slate-400 uppercase text-[11px] tracking-wider border-b border-[#0e274d]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Data Raportu</th>
                    <th className="py-3 px-4 font-semibold">Aktywa Brutto</th>
                    <th className="py-3 px-4 font-semibold">Aktywa Netto</th>
                    <th className="py-3 px-4 text-right font-semibold">Różnica (Zobowiązania)</th>
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
        </main>

        <Footer />
        <CompareFloatingBar />
      </div>
    </CompareProvider>
  );
}
