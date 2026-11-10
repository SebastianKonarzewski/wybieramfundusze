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
    <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-3 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
      <div className="pointer-events-auto w-full bg-white/98 dark:bg-[#020817]/98 border-2 border-[#044CD0]/40 dark:border-[#044CD0]/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_12px_45px_-5px_rgba(4,76,208,0.22)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(4,76,208,0.35)] ring-1 ring-blue-500/20 backdrop-blur-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 text-slate-800 dark:text-slate-100 transition-all">
        {/* Left: Indicator & 4 Visual Slots */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
          {/* Indicator Badge */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <div className="w-8 h-8 rounded-xl bg-[#044CD0] text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
                {t.compare.floatingBarTitle}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
                {t.compare.selectedCountBadge.replace("{count}", String(selectedFunds.length))}
              </div>
            </div>
            <span className="sm:hidden px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-[11px] font-bold text-[#044CD0] dark:text-blue-300">
              {selectedFunds.length}/4
            </span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-[#0e274d] shrink-0" />

          {/* 4 Fixed Slots (Occupied & Empty Dashed Placeholders) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-0.5 no-scrollbar flex-1 min-w-0">
            {Array.from({ length: 4 }).map((_, slotIndex) => {
              const fund = selectedFunds[slotIndex];
              const isNextSlot = slotIndex === selectedFunds.length;

              if (fund) {
                return (
                  <div
                    key={fund.subfundId}
                    className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-blue-50/90 dark:bg-[#030c1c] text-slate-800 dark:text-slate-100 border border-blue-200/90 dark:border-[#044CD0]/50 shadow-2xs transition-all flex-1 min-w-[135px] md:min-w-0 shrink-0 md:shrink group hover:border-[#044CD0]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="w-4 h-4 rounded-full bg-[#044CD0] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {slotIndex + 1}
                      </span>
                      <span
                        className="truncate font-semibold text-slate-900 dark:text-slate-100 text-[11px] sm:text-xs"
                        title={fund.name}
                      >
                        {fund.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFund(fund.subfundId)}
                      className="p-0.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer shrink-0"
                      title={t.catalog.card.removeFromCompare}
                      aria-label={`${t.catalog.card.removeFromCompare}: ${fund.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={`slot-placeholder-${slotIndex}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all flex-1 min-w-[120px] md:min-w-0 shrink-0 md:shrink select-none border-2 border-dashed ${
                    isNextSlot
                      ? "border-blue-300 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20 text-[#044CD0] dark:text-blue-400"
                      : "border-slate-300 dark:border-[#0e274d]/80 bg-slate-50/40 dark:bg-[#020712]/40 text-slate-400 dark:text-slate-600"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border border-dashed text-[10px] font-semibold flex items-center justify-center shrink-0 ${
                      isNextSlot
                        ? "border-blue-400 dark:border-blue-600 text-[#044CD0] dark:text-blue-400"
                        : "border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {slotIndex + 1}
                  </span>
                  <span className="truncate text-[11px] font-medium">
                    {isNextSlot ? t.compare.addMoreHint : t.compare.emptySlot}
                  </span>
                </div>
              );
            })}
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
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#044CD0] hover:bg-blue-600 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
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
