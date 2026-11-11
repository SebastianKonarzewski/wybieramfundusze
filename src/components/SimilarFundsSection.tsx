"use client";

import React from "react";
import Link from "next/link";
import { SubfundCardModel } from "@/types/knf";
import { Scale, Building2, TrendingUp, TrendingDown, ArrowRight, Layers } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";
import { useCompare } from "./CompareContext";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "./ToastContext";

interface SimilarFundsSectionProps {
  currentSubfund: {
    subfundId: number;
    name: string;
    type: string;
    category?: string | null;
  };
  similarFunds: SubfundCardModel[];
}

export function SimilarFundsSection({
  currentSubfund,
  similarFunds,
}: SimilarFundsSectionProps) {
  const { t, formatPercent } = useTranslation();
  const { addFund, isSelected } = useCompare();
  const { toast } = useToast();

  if (!similarFunds || similarFunds.length === 0) {
    return null;
  }

  const handleCompareBoth = (targetFund: SubfundCardModel) => {
    // 1. Add current fund if not present
    if (!isSelected(currentSubfund.subfundId)) {
      addFund({
        subfundId: currentSubfund.subfundId,
        name: currentSubfund.name,
        type: currentSubfund.type,
        category: currentSubfund.category,
      });
    }

    // 2. Add target fund if not present
    if (!isSelected(targetFund.subfundId)) {
      addFund({
        subfundId: targetFund.subfundId,
        name: targetFund.name,
        type: targetFund.type,
        category: targetFund.category,
      });
    }

    toast.success(t.subfundDetail.similar.addedToCompare, {
      duration: 5000,
      action: {
        label: t.common.viewComparator,
        onClick: () => {
          window.location.href = "/porownywarka";
        },
      },
    });
  };

  return (
    <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#044CD0]" />
            {t.subfundDetail.similar.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subfundDetail.similar.desc}
          </p>
        </div>

        <Link
          href="/porownywarka"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#044CD0] dark:text-blue-400 hover:underline self-start sm:self-auto"
        >
          <span>{t.common.viewComparator}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {similarFunds.map((fund) => {
          const isPos = fund.returnRate1Y !== null && fund.returnRate1Y !== undefined && fund.returnRate1Y >= 0;
          const hasRate = fund.returnRate1Y !== null && fund.returnRate1Y !== undefined;

          return (
            <div
              key={fund.subfundId}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] hover:border-[#044CD0]/60 dark:hover:border-[#044CD0]/60 transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#044CD0] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                    {fund.type}
                  </span>
                  <RiskBadge level={fund.riskLevel} size="sm" />
                </div>

                <Link
                  href={`/fundusze/${fund.subfundId}`}
                  className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-[#044CD0] dark:group-hover:text-blue-400 transition-colors line-clamp-2 block"
                  title={fund.name}
                >
                  {fund.name}
                </Link>

                {fund.companyName && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{fund.companyName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    12M:
                  </span>
                  {hasRate ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${
                        isPos
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPos ? "+" : ""}
                      {formatPercent(fund.returnRate1Y!)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Link
                    href={`/fundusze/${fund.subfundId}`}
                    className="inline-flex items-center justify-center px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-white dark:bg-[#071938] border border-slate-200 dark:border-[#0e274d] text-slate-700 dark:text-slate-300 hover:text-[#044CD0] dark:hover:text-white transition-colors"
                  >
                    {t.subfundDetail.similar.viewProfile}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleCompareBoth(fund)}
                    className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-2xs transition-all cursor-pointer"
                    title={t.subfundDetail.similar.compareBoth}
                  >
                    <Scale className="w-3 h-3" />
                    <span>Porównaj</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
