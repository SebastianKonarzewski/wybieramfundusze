import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Building2,
  Calendar,
  Layers,
  Compass,
  FileText,
  Clock,
  Coins,
  TrendingUp,
} from "lucide-react";
import { knfApi } from "@/lib/knf-api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatusBadge } from "@/components/StatusBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { ValuationChart } from "@/components/ValuationChart";
import { AssetsChart } from "@/components/AssetsChart";
import { KidDetailsCard } from "@/components/KidDetailsCard";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { CompareProvider } from "@/components/CompareContext";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
import { formatDate, formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubfundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subfundId = parseInt(id, 10);

  if (isNaN(subfundId)) {
    notFound();
  }

  const profile = await knfApi.getSubfundFullProfile(subfundId);

  if (!profile) {
    notFound();
  }

  const { subfund, fund, company, latestKid, valuations, assets, history } = profile;

  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#3b82f6] font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Wróć do Katalogu Subfunduszy
          </Link>

          {/* Subfund Main Header */}
          <div className="bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {subfund.name}
                </h1>

                {subfund.fullName && subfund.fullName !== subfund.name && (
                  <p className="text-sm text-slate-400">{subfund.fullName}</p>
                )}

                {/* Classification and Company Link */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
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
                      <span>Od: {formatDate(subfund.fromDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Metrics Pillar */}
              <div className="flex flex-row md:flex-col gap-3 shrink-0">
                <div className="bg-[#030a16] border border-[#0e274d] p-4 rounded-2xl min-w-[140px] text-center">
                  <span className="text-[11px] font-medium text-slate-500 block">Opłata bieżąca</span>
                  <span className="text-xl font-black text-blue-400">
                    {formatPercent(latestKid?.managementAndOtherFeesRate)}
                  </span>
                </div>

                {valuations[0] && (
                  <div className="bg-[#030a16] border border-[#0e274d] p-4 rounded-2xl min-w-[140px] text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Ostatnia wycena</span>
                    <span className="text-xl font-bold text-slate-100">
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
                Historia wycen jednostki uczestnictwa & Porównanie z Benchmarkiem
              </h2>
            </div>
            <ValuationChart valuations={valuations} currency={valuations[0]?.currency || "PLN"} />
          </section>

          {/* Section 2: KID & Costs */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#044CD0]" />
              <h2 className="text-lg font-bold text-slate-100">
                Koszty, Ryzyko i Dokument KID
              </h2>
            </div>
            <KidDetailsCard kid={latestKid} />
          </section>

          {/* Section 3: Historical Transformations (History) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#044CD0]" />
              <h2 className="text-lg font-bold text-slate-100">
                Oś czasu i historia przekształceń (UKNF)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Oficjalne rejestrowe zmiany strategii, nazwy oraz kategorii subfunduszu zarejestrowane przez Komisję Nadzoru Finansowego.
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
                  Wielkość aktywów pod zarządzaniem (AUM)
                </h2>
              </div>
              <AssetsChart assets={assets} />
            </section>
          )}
        </main>

        <Footer />
        <CompareFloatingBar />
      </div>
    </CompareProvider>
  );
}
