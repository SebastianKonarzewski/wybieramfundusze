"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Globe,
  ExternalLink,
  ChevronLeft,
  Layers,
  Clock,
} from "lucide-react";
import { KNFCompanyDetail, KNFHistoryItem, KNFFund } from "@/types/knf";
import { HistoryTimeline } from "./HistoryTimeline";
import { StatusBadge } from "./StatusBadge";
import { useTranslation } from "@/lib/i18n";

interface CompanyDetailViewProps {
  company: KNFCompanyDetail;
  history: KNFHistoryItem<KNFCompanyDetail>[];
  funds: KNFFund[];
}

export function CompanyDetailView({ company, history, funds }: CompanyDetailViewProps) {
  const { t, formatDate } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/tfi"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#3b82f6] font-medium transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.tfi.backToList}
      </Link>

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-xs font-bold text-blue-300 bg-[#030a16] border border-[#0e274d] px-2.5 py-0.5 rounded-lg">
                {company.nationalCode}
              </span>
              <StatusBadge isActive={company.isActive} />
              {company.fromDate && (
                <span className="text-xs text-slate-400">
                  {t.tfi.inRegistryFrom} {formatDate(company.fromDate)}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {company.name}
            </h1>

            {company.fullName && company.fullName !== company.name && (
              <p className="text-xs sm:text-sm text-slate-400">{company.fullName}</p>
            )}

            {/* Company details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-2 sm:pt-3 text-xs text-slate-300">
              {(company.city || company.street) && (
                <div className="flex items-center gap-2 bg-[#030a16] p-2 sm:p-2.5 rounded-xl border border-[#0e274d]">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {company.street}, {company.postCode} {company.city}
                  </span>
                </div>
              )}

              {company.krs && (
                <div className="flex items-center gap-2 bg-[#030a16] p-2 sm:p-2.5 rounded-xl border border-[#0e274d]">
                  <span className="font-semibold text-slate-500">KRS:</span>
                  <span className="font-mono">{company.krs}</span>
                  {company.regon && (
                    <span className="text-slate-500 truncate">| REGON: {company.regon}</span>
                  )}
                </div>
              )}

              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#030a16] p-2 sm:p-2.5 rounded-xl border border-[#0e274d] text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="truncate">{company.website}</span>
                  <ExternalLink className="w-3 h-3 ml-auto shrink-0" />
                </a>
              )}
            </div>
          </div>

          <div className="bg-[#030a16] border border-[#0e274d] p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 text-center w-full md:w-auto md:min-w-[140px]">
            <div className="text-2xl font-black text-blue-400">{funds.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">{t.tfi.fundsInRegistry}</div>
          </div>
        </div>
      </div>

      {/* Grid: Funds List & History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Managed Funds */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-[#044CD0]" />
            <h2 className="text-lg font-bold text-slate-100">
              {t.tfi.managedFunds} ({funds.length})
            </h2>
          </div>

          {funds.length === 0 ? (
            <div className="p-8 text-center bg-[#051329]/40 border border-[#0e274d] rounded-2xl text-slate-500">
              {t.tfi.noFundsAssigned}
            </div>
          ) : (
            <div className="space-y-3">
              {funds.map((fund) => (
                <div
                  key={fund.fundId}
                  className="bg-[#051329] border border-[#0e274d] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#044CD0]/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs bg-[#030a16] border border-[#0e274d] px-2 py-0.5 rounded text-blue-300">
                        {fund.type}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {fund.nationalCode}
                      </span>
                      <StatusBadge
                        isActive={fund.isActive}
                        isLiquidating={fund.isLiquidating}
                        liquidationStartDate={fund.liquidationStartDate}
                        liquidationEndDate={fund.liquidationEndDate}
                      />
                    </div>
                    <h4 className="font-bold text-sm text-slate-100">{fund.name}</h4>
                  </div>

                  <Link
                    href={`/?fundId=${fund.fundId}&fundName=${encodeURIComponent(fund.name)}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#030a16] hover:bg-[#071938] border border-[#0e274d] text-slate-200 transition-colors self-start sm:self-auto shrink-0"
                  >
                    {t.tfi.showSubfunds}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registration History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#044CD0]" />
            <h2 className="text-lg font-bold text-slate-100">{t.tfi.changesHistory}</h2>
          </div>

          <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-4">
            <HistoryTimeline history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
