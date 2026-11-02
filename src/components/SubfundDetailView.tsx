"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Building2,
  Calendar,
  Compass,
  FileText,
  Clock,
  Coins,
  TrendingUp,
} from "lucide-react";
import { SubfundFullProfile } from "@/types/knf";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ValuationChart } from "./ValuationChart";
import { AssetsChart } from "./AssetsChart";
import { KidDetailsCard } from "./KidDetailsCard";
import { HistoryTimeline } from "./HistoryTimeline";
import { useTranslation } from "@/lib/i18n";

export function SubfundDetailView({ profile }: { profile: SubfundFullProfile }) {
  const { t, formatCurrency, formatPercent, formatDate } = useTranslation();
  const { subfund, company, latestKid, valuations, assets, history } = profile;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#3b82f6] font-medium transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.subfundDetail.backToCatalog}
      </Link>

      {/* Subfund Main Header */}
      <div className="bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-xs bg-[#030a16] text-blue-300 border border-[#0e274d] px-2.5 py-0.5 rounded-lg">
                {subfund.type}
              </span>
              <span className="font-mono text-xs text-slate-400 bg-[#030a16] px-2 py-0.5 rounded border border-[#0e274d]">
                {subfund.nationalCode}
              </span>
              <StatusBadge
                isActive={subfund.isActive}
                isLiquidating={subfund.isLiquidating}
                liquidationStartDate={subfund.liquidationStartDate}
                liquidationEndDate={subfund.liquidationEndDate}
              />
              <RiskBadge level={latestKid?.riskLevel} size="sm" />
            </div>

            {/* Subfund Title */}
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {subfund.name}
            </h1>

            {subfund.fullName && subfund.fullName !== subfund.name && (
              <p className="text-xs sm:text-sm text-slate-400">{subfund.fullName}</p>
            )}

            {/* Classification and Company Link */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              {company && (
                <Link
                  href={`/tfi/${company.companyId}`}
                  className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] font-semibold transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {company.name}
                </Link>
              )}

              {(subfund.classification || subfund.category) && (
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {subfund.classification}
                    {subfund.category ? ` • ${subfund.category}` : ""}
                  </span>
                </div>
              )}

              {subfund.fromDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.subfundDetail.inRegistrySince} {formatDate(subfund.fromDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 md:flex md:flex-col gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
            <div className="bg-[#030a16] border border-[#0e274d] p-3 sm:p-4 rounded-xl sm:rounded-2xl md:min-w-[140px] text-center">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block">
                {t.subfundDetail.quickMetrics.ongoingFee}
              </span>
              <span className="text-lg sm:text-xl font-black text-blue-400">
                {formatPercent(latestKid?.managementAndOtherFeesRate)}
              </span>
            </div>

            {valuations[0] && (
              <div className="bg-[#030a16] border border-[#0e274d] p-3 sm:p-4 rounded-xl sm:rounded-2xl md:min-w-[140px] text-center">
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block">
                  {t.subfundDetail.quickMetrics.latestValuation}
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-100">
                  {formatCurrency(valuations[0].valuation, valuations[0].currency)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Valuation Chart with Benchmark option */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg font-bold text-slate-100">
            {t.subfundDetail.sections.valuationHistory}
          </h2>
        </div>
        <ValuationChart valuations={valuations} currency={valuations[0]?.currency || "PLN"} />
      </section>

      {/* Section 2: KID & Costs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg font-bold text-slate-100">
            {t.subfundDetail.sections.costsAndRisk}
          </h2>
        </div>
        <KidDetailsCard kid={latestKid} />
      </section>

      {/* Section 3: Historical Transformations (History) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg font-bold text-slate-100">
            {t.subfundDetail.sections.timeline}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {t.subfundDetail.sections.timelineDesc}
        </p>
        <div className="bg-[#051329] border border-[#0e274d] rounded-3xl p-6 shadow-md">
          <HistoryTimeline history={history} />
        </div>
      </section>

      {/* Section 4: Assets (AUM) */}
      {assets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#044CD0]" />
            <h2 className="text-lg font-bold text-slate-100">
              {t.subfundDetail.sections.aum}
            </h2>
          </div>
          <AssetsChart assets={assets} />
        </section>
      )}
    </div>
  );
}
