import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FundComparator } from "@/components/FundComparator";
import { CompareProvider } from "@/components/CompareContext";
import { Scale } from "lucide-react";

export default function ComparePage() {
  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Scale className="w-3.5 h-3.5" />
              Moduł Analizy Porównawczej Side-by-Side
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Porównywarka Funduszy Inwestycyjnych
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Zestaw ze sobą do 4 funduszy, porównaj koszty stałe i zmienne, wskaźniki ryzyka (SRI) oraz bezpośrednio nałóż na siebie historyczne stopy zwrotu.
            </p>
          </div>

          <FundComparator />
        </main>

        <Footer />
      </div>
    </CompareProvider>
  );
}

