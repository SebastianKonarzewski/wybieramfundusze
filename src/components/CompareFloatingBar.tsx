"use client";

import React from "react";
import Link from "next/link";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { useCompare } from "./CompareContext";
import { useTranslation } from "@/lib/i18n";

export function CompareFloatingBar() {
  const { selectedFunds, removeFund, clearFunds } = useCompare();
  const { t } = useTranslation();

  if (selectedFunds.length === 0) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
      <div className="pointer-events-auto w-full bg-white/95 dark:bg-[#051329]/95 border border-slate-200 dark:border-[#044CD0]/60 rounded-2xl p-2.5 sm:p-3 shadow-xl sm:shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 text-slate-800 dark:text-slate-100 transition-all">
        {/* Left: Indicator & Fund pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
          {/* Compare Indicator Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#044CD0] dark:text-[#60a5fa] uppercase tracking-wider shrink-0 select-none">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#071938] text-[#044CD0] dark:text-[#60a5fa] border border-blue-100 dark:border-[#0e274d] flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">{t.compare.floatingBarTitle}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100/80 dark:bg-[#071938] text-[11px] font-bold text-[#044CD0] dark:text-blue-300">
              {selectedFunds.length}/4
            </span>
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-[#0e274d] shrink-0" />

          {/* Fund Pills (horizontally scrollable if long, nicely styled) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-0.5 no-scrollbar flex-1 min-w-0">
            {selectedFunds.map((fund) => (
              <span
                key={fund.subfundId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#030a16] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#0e274d] hover:border-slate-400 dark:hover:border-slate-600 transition-colors shrink-0"
              >
                <span className="truncate max-w-[130px] sm:max-w-[170px] md:max-w-[210px] lg:max-w-[260px]" title={fund.name}>
                  {fund.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFund(fund.subfundId)}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title={t.catalog.card.removeFromCompare}
                  aria-label={`${t.catalog.card.removeFromCompare}: ${fund.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-[#0e274d]/60">
          <button
            type="button"
            onClick={clearFunds}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#071938] rounded-xl text-xs transition-colors cursor-pointer"
            title={t.compare.clearAll}
            aria-label={t.compare.clearAll}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href="/porownywarka"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-md shadow-[#044CD0]/30 transition-all cursor-pointer"
          >
            <span>{t.common.compareNow}</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[11px] font-bold">
              {selectedFunds.length}
            </span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
