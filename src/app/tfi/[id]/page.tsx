import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  MapPin,
  Globe,
  ExternalLink,
  ChevronLeft,
  Layers,
  Clock,
} from "lucide-react";
import { knfApi } from "@/lib/knf-api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { CompareProvider } from "@/components/CompareContext";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    notFound();
  }

  const [company, history, fundsRes] = await Promise.all([
    knfApi.getCompany(companyId),
    knfApi.getCompanyHistory(companyId),
    knfApi.getFunds({ companyId, size: 100, includeInactive: true, includeLiquidating: true }),
  ]);

  if (!company) {
    notFound();
  }

  const funds = fundsRes.content || [];

  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Back button */}
          <Link
            href="/tfi"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#3b82f6] font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Wróć do listy Towarzystw (TFI)
          </Link>

          {/* Profile Header */}
          <div className="bg-gradient-to-b from-[#071938] via-[#051329] to-[#030a16] border border-[#0e274d] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-300 bg-[#030a16] border border-[#0e274d] px-2.5 py-0.5 rounded-lg">
                    {company.nationalCode}
                  </span>
                  <StatusBadge isActive={company.isActive} />
                  {company.fromDate && (
                    <span className="text-xs text-slate-400">
                      W rejestrze od: {formatDate(company.fromDate)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {company.name}
                </h1>

                {company.fullName && company.fullName !== company.name && (
                  <p className="text-sm text-slate-400">{company.fullName}</p>
                )}

                {/* Company details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 text-xs text-slate-300">
                  {(company.city || company.street) && (
                    <div className="flex items-center gap-2 bg-[#030a16] p-2.5 rounded-xl border border-[#0e274d]">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        {company.street}, {company.postCode} {company.city}
                      </span>
                    </div>
                  )}

                  {company.krs && (
                    <div className="flex items-center gap-2 bg-[#030a16] p-2.5 rounded-xl border border-[#0e274d]">
                      <span className="font-semibold text-slate-500">KRS:</span>
                      <span className="font-mono">{company.krs}</span>
                      {company.regon && (
                        <span className="text-slate-500">| REGON: {company.regon}</span>
                      )}
                    </div>
                  )}

                  {company.website && (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#030a16] p-2.5 rounded-xl border border-[#0e274d] text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <span className="truncate">{company.website}</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-[#030a16] border border-[#0e274d] p-4 rounded-2xl shrink-0 text-center min-w-[140px]">
                <div className="text-2xl font-black text-blue-400">{funds.length}</div>
                <div className="text-xs text-slate-400 mt-0.5">Funduszy w rejestrze</div>
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
                  Zarządzane Fundusze ({funds.length})
                </h2>
              </div>

              {funds.length === 0 ? (
                <div className="p-8 text-center bg-[#051329]/40 border border-[#0e274d] rounded-2xl text-slate-500">
                  Brak przypisanych funduszy w rejestrze.
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
                        href={`/?search=${encodeURIComponent(fund.name)}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#030a16] hover:bg-[#071938] border border-[#0e274d] text-slate-200 transition-colors self-start sm:self-auto shrink-0"
                      >
                        Pokaż subfundusze
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
                <h2 className="text-lg font-bold text-slate-100">Historia zmian (UKNF)</h2>
              </div>

              <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-4">
                <HistoryTimeline history={history} />
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <CompareFloatingBar />
      </div>
    </CompareProvider>
  );
}
