import React from "react";
import { Calendar, GitCommit, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { KNFHistoryItem } from "@/types/knf";

interface HistoryTimelineProps<T> {
  history: KNFHistoryItem<T>[];
  renderDetails?: (item: T, prevItem?: T) => React.ReactNode;
}

export function HistoryTimeline<T extends Record<string, any>>({
  history,
  renderDetails,
}: HistoryTimelineProps<T>) {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400">
        Brak zarejestrowanych historycznych zmian w rejestrze UKNF dla tego podmiotu.
      </div>
    );
  }

  // Sort chronologically (oldest first or newest first)
  const sorted = [...history].sort(
    (a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
  );

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {sorted.map((item, index) => {
        const nextItem = sorted[index + 1]?.data;
        const currentData = item.data;
        const isCurrent = item.validTo.startsWith("9999") || !item.validTo;

        return (
          <div key={item.historyId || index} className="relative group">
            {/* Timeline icon */}
            <div
              className={`absolute -left-[27px] top-1 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isCurrent
                  ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/50"
                  : "bg-slate-900 border-slate-700 text-slate-400 group-hover:border-slate-500"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>

            {/* Content card */}
            <div className="p-5 bg-slate-900/70 border border-slate-800/80 rounded-xl hover:border-slate-700/90 transition-all shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    {formatDate(item.validFrom)}
                    {" — "}
                    {isCurrent ? (
                      <span className="text-emerald-400 font-bold">Obecnie (stan aktualny)</span>
                    ) : (
                      formatDate(item.validTo)
                    )}
                  </span>
                </div>
                {isCurrent && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Wersja obowiązująca
                  </span>
                )}
              </div>

              {/* Dynamic details for Subfund */}
              {renderDetails ? (
                renderDetails(currentData, nextItem)
              ) : (
                <div className="space-y-2 text-sm">
                  {currentData.name && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                        Nazwa:
                      </span>
                      <span className="font-semibold text-slate-100">
                        {currentData.name}
                      </span>
                      {nextItem && nextItem.name && nextItem.name !== currentData.name && (
                        <span className="text-xs text-amber-400 italic">
                          (wcześniej: {nextItem.name})
                        </span>
                      )}
                    </div>
                  )}

                  {currentData.fullName && currentData.fullName !== currentData.name && (
                    <div className="text-xs text-slate-400">
                      Pełna nazwa: {currentData.fullName}
                    </div>
                  )}

                  {currentData.classification && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-slate-500">Klasyfikacja / Kategoria:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-medium">
                        {currentData.classification}
                        {currentData.category ? ` / ${currentData.category}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Address info if Company */}
                  {currentData.city && (
                    <div className="text-xs text-slate-400">
                      Siedziba: {currentData.street}, {currentData.postCode} {currentData.city}
                      {currentData.krs && ` | KRS: ${currentData.krs}`}
                      {currentData.regon && ` | REGON: ${currentData.regon}`}
                    </div>
                  )}

                  {/* Status indicators */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500">Status prawny:</span>
                    {currentData.isLiquidating ? (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        W likwidacji
                        {currentData.liquidationStartDate &&
                          ` (od ${formatDate(currentData.liquidationStartDate)})`}
                      </span>
                    ) : currentData.isActive ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Aktywny
                      </span>
                    ) : (
                      <span className="text-slate-400">Nieaktywny</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

