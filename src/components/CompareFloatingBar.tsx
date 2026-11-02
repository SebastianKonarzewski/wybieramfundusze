"use client";

import React from "react";
import Link from "next/link";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { useCompare } from "./CompareContext";

export function CompareFloatingBar() {
  const { selectedFunds, removeFund, clearFunds } = useCompare();

  if (selectedFunds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info & Fund pills */}
        <div className="flex items-center gap-2 flex-wrap max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mr-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            Porównanie ({selectedFunds.length}/4):
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedFunds.map((fund) => (
              <span
                key={fund.subfundId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{fund.name}</span>
                <button
                  onClick={() => removeFund(fund.subfundId)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                  title="Usuń z porównania"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={clearFunds}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs transition-colors"
            title="Wyczyść wszystkie"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href="/porownywarka"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/25 transition-all"
          >
            Porównaj teraz
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

