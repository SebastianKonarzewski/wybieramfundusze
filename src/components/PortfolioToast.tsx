"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Briefcase, Check, ArrowRight, X } from "lucide-react";
import { usePortfolio } from "./PortfolioContext";
import { useTranslation } from "@/lib/i18n";

export function PortfolioToast() {
  const { lastAddedFund, clearLastAddedFund } = usePortfolio();
  const { t } = useTranslation();

  useEffect(() => {
    if (!lastAddedFund) return;
    const timer = setTimeout(() => {
      clearLastAddedFund();
    }, 4500);

    return () => clearTimeout(timer);
  }, [lastAddedFund, clearLastAddedFund]);

  if (!lastAddedFund) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className="bg-white dark:bg-[#051329] border border-emerald-500/50 dark:border-emerald-500/60 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              <span>{t.portfolio.toastAdded}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[190px] sm:max-w-[220px]">
              {lastAddedFund.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/portfel"
            onClick={clearLastAddedFund}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#044CD0] hover:bg-blue-600 text-white transition-colors shadow-xs"
          >
            <span>{t.portfolio.goToPortfolio}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={clearLastAddedFund}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Zamknij powiadomienie"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
