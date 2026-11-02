import React from "react";
import { FileText, Download, ShieldCheck, Target, AlertTriangle, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KNFKeyInformationDetail } from "@/types/knf";
import { RiskBadge } from "./RiskBadge";
import { formatPercent, formatDate } from "@/lib/utils";

export function KidDetailsCard({ kid }: { kid?: KNFKeyInformationDetail | null }) {
  if (!kid) {
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Brak opublikowanego dokumentu KID (Kluczowe Informacje dla Inwestorów) w bazie UKNF dla tego subfunduszu.</p>
      </div>
    );
  }

  const pdfUrl = `https://wybieramfundusze-api.knf.gov.pl/v1/key-information/${kid.documentUuid}/file`;

  return (
    <div className="space-y-6">
      {/* Top Banner with Download & Meta */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Dokument Kluczowych Informacji (KID)
            </span>
            <span className="text-xs text-slate-500">
              Publikacja: {formatDate(kid.publicationDate)}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {kid.filename || "KID Subfunduszu"}
          </div>
          {kid.unit && (
            <div className="text-xs text-slate-400 mt-0.5">
              Kategoria jednostki: <span className="text-slate-300 font-mono">{kid.unit}</span> ({kid.currency})
            </div>
          )}
        </div>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Pobierz oficjalny PDF KID
        </a>
      </div>

      {/* Grid: Risk & Benchmark & Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk & Benchmark Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
              Poziom Ryzyka (SRI)
            </h3>
            <RiskBadge level={kid.riskLevel} size="lg" showLabel={true} />
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Syntetyczny wskaźnik ryzyka (SRI) to wytyczna wskazująca poziom ryzyka tego produktu w porównaniu z innymi. Skala wynosi od 1 (najniższe) do 7 (najwyższe).
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Wskaźnik Referencyjny (Benchmark)
            </div>
            {kid.hasBenchmark && kid.benchmark ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-slate-200">
                {kid.benchmark}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Fundusz nie posiada oficjalnego benchmarku lub nie został zadeklarowany.
              </div>
            )}
          </div>
        </div>

        {/* Fees Breakdown Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-400" />
            Struktura kosztów i opłat
          </h3>

          <div className="space-y-3.5 text-xs">
            {/* Management fee */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">Opłaty bieżące i za zarządzanie</span>
                <span className="text-[11px] text-slate-500">Roczny koszt stały potrącany z aktywów</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {formatPercent(kid.managementAndOtherFeesRate)}
              </span>
            </div>

            {/* Entry fee */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">Maks. opłata wstępna</span>
                <span className="text-[11px] text-slate-500">Pobierana przy nabyciu jednostek</span>
              </div>
              <span className="text-sm font-bold text-slate-200">
                {formatPercent(kid.maxEntryFeeRate)}
              </span>
            </div>

            {/* Exit fee */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200 block">Maks. opłata za umorzenie</span>
                <span className="text-[11px] text-slate-500">Pobierana przy wyjściu z funduszu</span>
              </div>
              <span className="text-sm font-bold text-slate-200">
                {formatPercent(kid.maxExitFeeRate)}
              </span>
            </div>

            {/* Transaction costs */}
            {kid.transactionCostsRate !== null && kid.transactionCostsRate !== undefined && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Koszty transakcyjne portfela</span>
                  <span className="text-[11px] text-slate-500">Średnioroczne koszty obrotu aktywami</span>
                </div>
                <span className="text-sm font-bold text-slate-200">
                  {formatPercent(kid.transactionCostsRate)}
                </span>
              </div>
            )}

            {/* Success fee note */}
            {kid.hasSuccessFee && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                <strong>Opłata za sukces (Success Fee):</strong> {kid.successFee || "Tak, pobierana w przypadku przewyższenia stopy odniesienia."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRIIPs Scenarios Table */}
      {kid.scenarios && kid.scenarios.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-100">
              Scenariusze wyników inwestycyjnych (zgodne z rozporządzeniem PRIIPs)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Symulacje oczekiwanych średnich rocznych stóp zwrotu w różnych warunkach rynkowych.
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
                      ? "bg-emerald-950/30 border-emerald-500/30"
                      : isUnfavorable
                      ? "bg-rose-950/30 border-rose-500/30"
                      : isStress
                      ? "bg-red-950/40 border-red-500/40"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 capitalize mb-3">
                    {scenario.name}
                  </div>

                  <div className="space-y-3">
                    {res1Y && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Po 1 roku:</span>
                        <span
                          className={`font-bold text-sm ${
                            res1Y.returnRate >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {res1Y.returnRate >= 0 ? "+" : ""}
                          {formatPercent(res1Y.returnRate)}
                        </span>
                      </div>
                    )}

                    {res5Y && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                        <span className="text-slate-400">Po 5 latach (śr. rocznie):</span>
                        <span
                          className={`font-bold text-sm ${
                            res5Y.returnRate >= 0 ? "text-emerald-400" : "text-rose-400"
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

