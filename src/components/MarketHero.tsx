import React from "react";
import { Coins, Layers, Building2, TrendingUp, Calendar } from "lucide-react";
import { MarketStatistics } from "@/types/knf";
import { formatLargeNumber, formatDate, formatNumber } from "@/lib/utils";

export function MarketHero({ stats }: { stats: MarketStatistics }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] p-6 sm:p-8 lg:p-10 mb-8 shadow-2xl">
      {/* Background glow effects with UKNF blue */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#044CD0]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#02224D]/30 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Katalog i Porównywarka Funduszy Inwestycyjnych
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              Przeszukuj, analizuj koszty zarządzania, profile ryzyka SRI oraz sprawdzaj historyczne przekształcenia i stopy zwrotu funduszy FIO, SFIO, FIZ i ETF w Polsce.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-[#030a16]/80 border border-[#0e274d] px-3.5 py-2 rounded-xl self-start md:self-auto shrink-0">
            <Calendar className="w-4 h-4 text-[#044CD0]" />
            <span>Stan danych rynkowych: <strong>{formatDate(stats.statsDate)}</strong></span>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Assets Gross */}
          <div className="bg-[#030a16]/80 border border-[#0e274d] hover:border-[#044CD0]/50 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Aktywa Rynku Brutto</span>
              <Coins className="w-4 h-4 text-[#044CD0]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {formatLargeNumber(stats.totalAssetsGross)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Netto: <span className="text-slate-300 font-medium">{formatLargeNumber(stats.totalAssetsNet)}</span>
            </div>
          </div>

          {/* Card 2: Active Subfunds */}
          <div className="bg-[#030a16]/80 border border-[#0e274d] hover:border-[#044CD0]/50 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Aktywne Subfundusze</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400">
              {formatNumber(stats.activeSubfundsCount, 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Wybór z pełnego rejestru
            </div>
          </div>

          {/* Card 3: Funds */}
          <div className="bg-[#030a16]/80 border border-[#0e274d] hover:border-[#044CD0]/50 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Fundusze Inwestycyjne</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {formatNumber(stats.activeFundsCount, 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              FIO, SFIO, FIZ, ETF
            </div>
          </div>

          {/* Card 4: Companies (Only active TFI - 54!) */}
          <div className="bg-[#030a16]/80 border border-[#0e274d] hover:border-[#044CD0]/50 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Towarzystwa (TFI)</span>
              <Building2 className="w-4 h-4 text-[#044CD0]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {formatNumber(stats.companiesCount, 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Aktywnie zarządzające
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
