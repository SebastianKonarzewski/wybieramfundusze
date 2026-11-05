"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { KNFHistoryItem } from "@/types/knf";
import { useTranslation } from "@/lib/i18n";

interface DefaultHistoryData {
  name?: string | null;
  fullName?: string | null;
  classification?: string | null;
}

interface HistoryTimelineProps<T> {
  history: KNFHistoryItem<T>[];
  renderDetails?: (item: T, prevItem?: T) => React.ReactNode;
}

export function HistoryTimeline<T extends object>({
  history,
  renderDetails,
}: HistoryTimelineProps<T>) {
  const { t, formatDate } = useTranslation();

  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-[#051329]/50 border border-[#0e274d] rounded-xl text-slate-400">
        {t.common.noChanges}
      </div>
    );
  }

  // Sort chronologically (newest first)
  const sorted = [...history].sort(
    (a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
  );

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#0e274d]">
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
                  : "bg-[#030a16] border-[#0e274d] text-slate-400 group-hover:border-slate-500"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>

            {/* Content card */}
            <div className="p-5 bg-[#030a16] border border-[#0e274d] rounded-xl hover:border-[#044CD0]/60 transition-all shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    {formatDate(item.validFrom)}
                    {" — "}
                    {isCurrent ? (
                      <span className="text-emerald-400 font-bold">{t.common.currentlyActive}</span>
                    ) : (
                      formatDate(item.validTo)
                    )}
                  </span>
                </div>
                {isCurrent && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    {t.common.inForceVersion}
                  </span>
                )}
              </div>

              {/* Dynamic details for Subfund */}
              {renderDetails ? (
                renderDetails(currentData, nextItem)
              ) : (() => {
                const defaultData = currentData as unknown as DefaultHistoryData;
                const nextDefaultData = nextItem as unknown as DefaultHistoryData | undefined;
                return (
                  <div className="space-y-2 text-sm">
                    {defaultData.name && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                          {t.common.nameLabel}
                        </span>
                        <span className="font-semibold text-slate-100">
                          {defaultData.name}
                        </span>
                        {nextDefaultData?.name && nextDefaultData.name !== defaultData.name && (
                          <span className="text-xs text-amber-400 italic">
                            ({t.common.previously} {nextDefaultData.name})
                          </span>
                        )}
                      </div>
                    )}

                    {defaultData.fullName && defaultData.fullName !== defaultData.name && (
                      <div className="text-xs text-slate-400">
                        {t.common.fullNameLabel} {defaultData.fullName}
                      </div>
                    )}

                    {defaultData.classification && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-slate-500">{t.common.classificationCategory}</span>
                        <span className="px-2 py-0.5 rounded bg-[#051329] border border-[#0e274d] font-medium">
                          {defaultData.classification}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
