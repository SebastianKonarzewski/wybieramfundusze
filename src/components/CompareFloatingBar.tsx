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
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-3 sm:px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#051329]/95 border border-[#044CD0]/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Info & Fund pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-full justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#60a5fa] uppercase tracking-wider mr-1 sm:mr-2 shrink-0">
            <Scale className="w-4 h-4 text-[#3b82f6]" />
            {t.compare.floatingBarTitle} ({selectedFunds.length}/4):
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-h-20 sm:max-h-none overflow-y-auto">
            {selectedFunds.map((fund) => (
              <span
                key={fund.subfundId}
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-xs font-medium bg-[#030a16] text-slate-200 border border-[#0e274d] hover:border-slate-600 transition-colors"
              >
                <span className="truncate max-w-[95px] sm:max-w-[160px]">{fund.name}</span>
                <button
                  onClick={() => removeFund(fund.subfundId)}
                  className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title={t.catalog.card.removeFromCompare}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-[#0e274d]/60">
          <button
            onClick={clearFunds}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-200 hover:bg-[#071938] rounded-lg text-xs transition-colors cursor-pointer"
            title={t.compare.clearAll}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href="/porownywarka"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-md shadow-[#044CD0]/30 transition-all"
          >
            {t.common.compareNow}
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
