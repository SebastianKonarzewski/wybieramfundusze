"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Calendar,
  Compass,
  FileText,
  Clock,
  Coins,
  TrendingUp,
  Briefcase,
  Scale,
  Check,
  Share2,
  Copy,
  Calculator,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { SubfundFullProfile, SubfundCardModel } from "@/types/knf";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ValuationChart } from "./ValuationChart";
import { FundPerformanceMatrix } from "./FundPerformanceMatrix";
import { InvestmentSimulator } from "./InvestmentSimulator";
import { FundRiskAnalytics } from "./FundRiskAnalytics";
import { KidDetailsCard } from "./KidDetailsCard";
import { SimilarFundsSection } from "./SimilarFundsSection";
import { HistoryTimeline } from "./HistoryTimeline";
import { AssetsChart } from "./AssetsChart";
import { FormattedCurrency } from "./FormattedAmount";
import { useCompare } from "./CompareContext";
import { usePortfolio } from "./PortfolioContext";
import { useToast } from "./ToastContext";
import { useTranslation } from "@/lib/i18n";

interface SubfundDetailViewProps {
  profile: SubfundFullProfile;
  similarFunds?: SubfundCardModel[];
}

export function SubfundDetailView({ profile, similarFunds = [] }: SubfundDetailViewProps) {
  const { t, formatPercent, formatDate } = useTranslation();
  const { toggleFund: toggleCompareFund, isSelected } = useCompare();
  const { toggleFund: togglePortfolioFund, isInPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);

  const { subfund, company, latestKid, valuations, assets, history } = profile;

  const inCompare = isSelected(subfund.subfundId);
  const inPortfolio = isInPortfolio(subfund.subfundId);

  const handleCopyLink = () => {
    try {
      if (typeof window !== "undefined") {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success(t.subfundDetail.linkCopied, {
          duration: 3500,
        });
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Top Nav: Breadcrumbs & Quick Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap text-slate-500 dark:text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-[#044CD0] dark:hover:text-[#60a5fa] font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </Link>

          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />

          {company && (
            <>
              <Link
                href={`/tfi/${company.companyId}`}
                className="hover:text-[#044CD0] dark:hover:text-[#60a5fa] font-medium transition-colors truncate max-w-[160px] sm:max-w-[220px]"
                title={company.name}
              >
                {company.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
            </>
          )}

          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">
            {subfund.name}
          </span>
        </nav>

        {/* Share / Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-[#044CD0]/60 text-slate-700 dark:text-slate-300 hover:text-[#044CD0] dark:hover:text-white transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          title={t.subfundDetail.copyLink}
        >
          {copiedLink ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-[#044CD0]" />
          )}
          <span>{copiedLink ? t.subfundDetail.linkCopied : t.subfundDetail.share}</span>
        </button>
      </div>

      {/* Subfund Main Header Card */}
      <div className="bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-[#071938] dark:via-[#051329] dark:to-[#030a16] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-xs bg-blue-50 dark:bg-[#030a16] text-[#044CD0] dark:text-blue-300 border border-blue-200/80 dark:border-[#0e274d] px-2.5 py-0.5 rounded-lg">
                {subfund.type}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#030a16] px-2 py-0.5 rounded border border-slate-200 dark:border-[#0e274d]">
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
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {subfund.name}
            </h1>

            {subfund.fullName && subfund.fullName !== subfund.name && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {subfund.fullName}
              </p>
            )}

            {/* Classification and Company Link */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
              {company && (
                <Link
                  href={`/tfi/${company.companyId}`}
                  className="inline-flex items-center gap-1.5 text-[#044CD0] dark:text-[#3b82f6] hover:text-[#033eb0] dark:hover:text-[#60a5fa] font-semibold transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{company.name}</span>
                </Link>
              )}

              {(subfund.classification || subfund.category) && (
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>
                    {subfund.classification}
                    {subfund.category ? ` • ${subfund.category}` : ""}
                  </span>
                </div>
              )}

              {subfund.fromDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>{t.subfundDetail.inRegistrySince} {formatDate(subfund.fromDate)}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  togglePortfolioFund({
                    subfundId: subfund.subfundId,
                    name: subfund.name,
                    type: subfund.type,
                    category: subfund.category,
                  })
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                  inPortfolio
                    ? "bg-[#044CD0] text-white border-[#044CD0]"
                    : "bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-blue-400"
                }`}
              >
                {inPortfolio ? <Check className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                {inPortfolio ? t.portfolio.inPortfolio : t.portfolio.addToPortfolio}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleCompareFund({
                    subfundId: subfund.subfundId,
                    name: subfund.name,
                    type: subfund.type,
                    category: subfund.category,
                  })
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                  inCompare
                    ? "bg-[#044CD0] text-white border-[#044CD0]"
                    : "bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-blue-400 hover:border-blue-400"
                }`}
              >
                {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                {inCompare ? t.compare.added : t.catalog.card.addToCompare}
              </button>
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-white dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl lg:min-w-[160px] text-center shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                {t.subfundDetail.quickMetrics.ongoingFee}
              </span>
              <span className="text-lg sm:text-2xl font-black text-[#044CD0] dark:text-blue-400">
                {formatPercent(latestKid?.managementAndOtherFeesRate)}
              </span>
            </div>

            {valuations[0] && (
              <div className="bg-white dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl lg:min-w-[160px] text-center shadow-xs">
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  {t.subfundDetail.quickMetrics.latestValuation}
                </span>
                <FormattedCurrency
                  value={valuations[0].valuation}
                  currency={valuations[0].currency}
                  className="inline-flex items-baseline justify-center gap-1 mt-0.5"
                  valueClassName="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100"
                  unitClassName="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module 1: Performance Matrix Across Investment Horizons */}
      <FundPerformanceMatrix
        valuations={valuations}
        currency={valuations[0]?.currency || "PLN"}
      />

      {/* Module 2: Valuation Chart with Benchmark option & CSV Export */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.subfundDetail.sections.valuationHistory}
          </h2>
        </div>
        <ValuationChart valuations={valuations} currency={valuations[0]?.currency || "PLN"} />
      </section>

      {/* Module 3: Historical Investment Profit & Tax Calculator */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Symulator zysku z inwestycji i podatku Belki
          </h2>
        </div>
        <InvestmentSimulator
          valuations={valuations}
          currency={valuations[0]?.currency || "PLN"}
        />
      </section>

      {/* Module 4: Advanced Risk & Performance Analytics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.subfundDetail.riskAnalytics.title}
          </h2>
        </div>
        <FundRiskAnalytics
          valuations={valuations}
          kid={latestKid}
          currency={valuations[0]?.currency || "PLN"}
        />
      </section>

      {/* Module 5: KID & Costs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.subfundDetail.sections.costsAndRisk}
          </h2>
        </div>
        <KidDetailsCard kid={latestKid} />
      </section>

      {/* Module 6: Similar Funds in the Same Category */}
      {similarFunds.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#044CD0]" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.subfundDetail.similar.title}
            </h2>
          </div>
          <SimilarFundsSection
            currentSubfund={{
              subfundId: subfund.subfundId,
              name: subfund.name,
              type: subfund.type,
              category: subfund.category,
            }}
            similarFunds={similarFunds}
          />
        </section>
      )}

      {/* Module 7: Historical Transformations (Timeline) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#044CD0]" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.subfundDetail.sections.timeline}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.subfundDetail.sections.timelineDesc}
        </p>
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
          <HistoryTimeline history={history} />
        </div>
      </section>

      {/* Module 8: Assets Under Management (AUM) */}
      {assets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#044CD0]" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.subfundDetail.sections.aum}
            </h2>
          </div>
          <AssetsChart assets={assets} />
        </section>
      )}
    </div>
  );
}
