import React from "react";
import { Coins, Layers, Building2, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { MarketStatistics } from "@/types/knf";
import { formatLargeNumber, formatDate } from "@/lib/utils";

export function MarketHero({ stats }: { stats: MarketStatistics }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 p-6 sm:p-8 lg:p-10 mb-8 shadow-xl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Oficjalne dane Urzędu Komisji Nadzoru Finansowego
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Katalog i Porównywarka Funduszy Inwestycyjnych
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
              Przeszukuj, analizuj koszty zarządzania, profile ryzyka SRI oraz sprawdzaj historyczne przekształcenia i stopy zwrotu funduszy FIO, SFIO, FIZ i ETF w Polsce.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl self-start md:self-auto shrink-0">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Stan danych rynkowych: <strong>{formatDate(stats.statsDate)}</strong></span>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Assets Gross */}
          <div className="bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Aktywa Rynku Brutto</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {formatLargeNumber(stats.totalAssetsGross)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Netto: <span className="text-slate-300 font-medium">{formatLargeNumber(stats.totalAssetsNet)}</span>
            </div>
          </div>

          {/* Card 2: Active Subfunds */}
          <div className="bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Aktywne Subfundusze</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {stats.activeSubfundsCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Łącznie z historią: <span className="text-slate-300 font-medium">{stats.totalSubfundsCount}</span>
            </div>
          </div>

          {/* Card 3: Funds & Liquidating */}
          <div className="bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Fundusze w Rejestrze</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {stats.activeFundsCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              W likwidacji / nieaktywne: <span className="text-amber-400 font-medium">+{stats.liquidatingFundsCount}</span>
            </div>
          </div>

          {/* Card 4: Companies */}
          <div className="bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Towarzystwa (TFI)</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {stats.companiesCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Nadzorowane przez UKNF
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

