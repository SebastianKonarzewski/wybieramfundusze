"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search, Calendar, ArrowRight } from "lucide-react";
import { KNFCompany } from "@/types/knf";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareProvider } from "@/components/CompareContext";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
import { formatDate } from "@/lib/utils";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<KNFCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (includeInactive) params.set("includeInactive", "true");
        params.set("size", "100");

        const res = await fetch(`/api/companies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.content || []);
        }
      } catch (err) {
        console.error("Error loading companies:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCompanies, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, includeInactive]);

  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Towarzystwa Funduszy Inwestycyjnych (TFI)
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Sprawdź podmioty zarządzające funduszami inwestycyjnymi w Polsce, ich dane rejestrowe, numery KRS, REGON oraz historię przekształceń.
            </p>
          </div>

          {/* Search & Inactive Toggle */}
          <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Szukaj TFI po nazwie lub kodzie krajowym (np. PKO, PZU, Ipopema, PLTFI...)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#030a16] border border-[#0e274d] text-sm text-slate-100 focus:outline-hidden focus:border-[#044CD0]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 group">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#030a16] border-slate-700 text-[#044CD0] accent-[#044CD0] cursor-pointer"
              />
              <span className="group-hover:text-slate-100 transition-colors">
                Uwzględnij podmioty wykreślone / nieaktywne
              </span>
            </label>
          </div>

          {/* List of Companies */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Wczytywanie listy towarzystw z rejestru UKNF...
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center bg-[#051329]/50 border border-[#0e274d] rounded-3xl text-slate-400">
              Nie znaleziono towarzystw odpowiadających kryteriom wyszukiwania.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <Link
                  key={company.companyId}
                  href={`/tfi/${company.companyId}`}
                  className="group bg-[#051329] hover:bg-[#071938] border border-[#0e274d] hover:border-[#044CD0]/60 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs text-blue-300 font-bold bg-[#030a16] border border-[#0e274d] px-2 py-0.5 rounded">
                        {company.nationalCode}
                      </span>
                      {company.isActive !== false ? (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Aktywne TFI
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          Nieaktywne
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-100 group-hover:text-[#60a5fa] transition-colors mb-2">
                      {company.name}
                    </h3>

                    {company.fromDate && (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        W rejestrze od: {formatDate(company.fromDate)}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#0e274d] mt-4 flex items-center justify-between text-xs text-[#3b82f6] font-semibold">
                    <span>Zobacz profil i fundusze</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <Footer />
        <CompareFloatingBar />
      </div>
    </CompareProvider>
  );
}
