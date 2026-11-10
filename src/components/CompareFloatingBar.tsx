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
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-7xl px-3 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
      <div className="pointer-events-auto w-full bg-white/98 dark:bg-[#030d22]/98 border-2 border-[#044CD0]/35 dark:border-[#044CD0]/55 rounded-2xl p-2.5 sm:p-3 shadow-[0_12px_36px_rgba(4,76,208,0.15),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(4,76,208,0.22)] backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3 text-slate-800 dark:text-slate-100 transition-all">
        
        {/* Mobile Control Row (< lg): Indicator on left, Actions on right */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          {/* Indicator */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#071938] text-[#044CD0] dark:text-[#60a5fa] border border-blue-200/60 dark:border-[#0e274d] flex items-center justify-center shrink-0">
              <Scale className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.compare.floatingBarTitle}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={clearFunds}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title={t.compare.clearAll}
              aria-label={t.compare.clearAll}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href="/porownywarka"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-xs transition-all cursor-pointer"
            >
              <span>{t.common.compare}</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-[10px] font-bold">
                {selectedFunds.length}
              </span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Desktop Left Indicator (lg+) */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#071938] text-[#044CD0] dark:text-[#60a5fa] border border-blue-200/80 dark:border-[#0e274d] flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t.compare.floatingBarTitle}
          </span>
        </div>

        <div className="hidden lg:block w-px h-10 bg-slate-200 dark:bg-[#0e274d] shrink-0" />

        {/* Center / Grid Zone: 4 Clean Slots in 2 rows (2x2 grid) with NO horizontal scroll */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1 min-w-0">
          {Array.from({ length: 4 }).map((_, slotIndex) => {
            const fund = selectedFunds[slotIndex];

            if (fund) {
              return (
                <div
                  key={fund.subfundId}
                  className="h-[30px] sm:h-[32px] flex items-center justify-between gap-1.5 px-2.5 rounded-xl text-xs bg-slate-50/90 dark:bg-[#030a16] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#0e274d] hover:border-blue-300 dark:hover:border-slate-600 transition-colors min-w-0 group"
                >
                  <span
                    className="truncate font-medium text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs flex-1 min-w-0"
                    title={fund.name}
                  >
                    {fund.name}
                  </span>
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
                className="h-[30px] sm:h-[32px] flex items-center justify-center px-2.5 rounded-xl text-xs border border-dashed border-slate-300 dark:border-[#0e274d]/80 bg-slate-50/40 dark:bg-[#020712]/40 text-slate-400 dark:text-slate-600 select-none min-w-0"
              >
                <span className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500 italic">
                  {t.compare.emptySlot}
                </span>
              </div>
            );
          })}
        </div>

        {/* Desktop Right Actions (lg+) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearFunds}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs transition-colors cursor-pointer"
            title={t.compare.clearAll}
            aria-label={t.compare.clearAll}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href="/porownywarka"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-xs transition-all cursor-pointer"
          >
            <span>{t.common.compare}</span>
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
