"use client";

import React from "react";
import { FileText, Download, Target, Percent } from "lucide-react";
import { KNFKeyInformationDetail } from "@/types/knf";
import { RiskBadge } from "./RiskBadge";
import { useTranslation } from "@/lib/i18n";

export function KidDetailsCard({ kid }: { kid?: KNFKeyInformationDetail | null }) {
  const { t, formatPercent, formatDate } = useTranslation();

  if (!kid) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#051329]/50 border border-slate-200 dark:border-[#0e274d] rounded-2xl text-slate-500 shadow-sm">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#044CD0]" />
        <p className="text-sm font-medium">{t.subfundDetail.noKidAlert}</p>
      </div>
    );
  }

  const pdfUrl = `https://wybieramfundusze-api.knf.gov.pl/v1/key-information/${kid.documentUuid}/file`;

  return (
    <div className="space-y-6">
      {/* Top Banner with Download & Meta */}
      <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#044CD0] dark:text-[#60a5fa]">
              {t.subfundDetail.kidBannerTitle}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.subfundDetail.publicationDate} {formatDate(kid.publicationDate)}
            </span>
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {kid.filename || "KID Funduszu"}
          </div>
          {kid.unit && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.subfundDetail.unitCategory} <span className="text-slate-800 dark:text-slate-300 font-mono font-semibold">{kid.unit}</span> ({kid.currency})
            </div>
          )}
        </div>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-md shadow-[#044CD0]/20 transition-all w-full sm:w-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          {t.subfundDetail.downloadPdf}
        </a>
      </div>

      {/* Grid: Risk & Benchmark & Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk & Benchmark Box */}
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm transition-colors">
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t.subfundDetail.riskTitle}
            </h3>
            <RiskBadge level={kid.riskLevel} size="lg" showLabel={true} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              {t.subfundDetail.riskDesc}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-[#0e274d]">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <Target className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6]" />
              {t.subfundDetail.benchmarkTitle}
            </div>
            {kid.hasBenchmark && kid.benchmark ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-sm font-medium text-slate-800 dark:text-slate-200">
                {kid.benchmark}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                {t.subfundDetail.noBenchmarkDeclared}
              </div>
            )}
          </div>
        </div>

        {/* Fees Breakdown Box */}
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm transition-colors">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6]" />
            {t.subfundDetail.feeStructure}
          </h3>

          <div className="space-y-3 text-xs">
            {/* Management fee */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t.subfundDetail.mgmtFeeTitle}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.subfundDetail.mgmtFeeDesc}</span>
              </div>
              <span className="text-sm font-bold text-[#044CD0] dark:text-blue-400">
                {formatPercent(kid.managementAndOtherFeesRate)}
              </span>
            </div>

            {/* Entry fee */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t.subfundDetail.entryFeeTitle}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.subfundDetail.entryFeeDesc}</span>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {formatPercent(kid.maxEntryFeeRate)}
              </span>
            </div>

            {/* Exit fee */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d]">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t.subfundDetail.exitFeeTitle}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.subfundDetail.exitFeeDesc}</span>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {formatPercent(kid.maxExitFeeRate)}
              </span>
            </div>

            {/* Transaction costs */}
            {kid.transactionCostsRate !== null && kid.transactionCostsRate !== undefined && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d]">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t.subfundDetail.transCostsTitle}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.subfundDetail.transCostsDesc}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatPercent(kid.transactionCostsRate)}
                </span>
              </div>
            )}

            {/* Success fee note */}
            {kid.hasSuccessFee && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                <strong>{t.subfundDetail.successFeeLabel}</strong> {kid.successFee || t.subfundDetail.successFeeDefaultNote}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRIIPs Scenarios Table with Polish percent formatting */}
      {kid.scenarios && kid.scenarios.length > 0 && (
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm transition-colors">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {t.subfundDetail.priipsTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.subfundDetail.priipsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kid.scenarios.map((scenario, idx) => {
              const res1Y = scenario.results.find((r) => r.period === 1.0);
              const res5Y = scenario.results.find((r) => r.period === 5.0);

              const isFavorable = scenario.name.includes("korzystny") && !scenario.name.includes("niekorzystny");
              const isUnfavorable = scenario.name.includes("niekorzystny");
              const isStress = scenario.name.includes("skrajnych");

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isFavorable
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30"
                      : isUnfavorable
                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30"
                      : isStress
                      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/40"
                      : "bg-slate-50 dark:bg-[#030a16] border-slate-200 dark:border-[#0e274d]"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 capitalize mb-3">
                    {scenario.name}
                  </div>

                  <div className="space-y-3">
                    {res1Y && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">{t.subfundDetail.after1Year}</span>
                        <span
                          className={`font-bold text-sm ${
                            res1Y.returnRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {res1Y.returnRate >= 0 ? "+" : ""}
                          {formatPercent(res1Y.returnRate)}
                        </span>
                      </div>
                    )}

                    {res5Y && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-[#0e274d]">
                        <span className="text-slate-500 dark:text-slate-400">{t.subfundDetail.after5Years}</span>
                        <span
                          className={`font-bold text-sm ${
                            res5Y.returnRate >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {res5Y.returnRate >= 0 ? "+" : ""}
                          {formatPercent(res5Y.returnRate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
