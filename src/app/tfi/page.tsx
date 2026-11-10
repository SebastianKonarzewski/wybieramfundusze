"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, ArrowRight, Building2, X } from "lucide-react";
import { KNFCompany } from "@/types/knf";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/lib/i18n";

export default function CompaniesPage() {
  const { t, formatDate } = useTranslation();
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
    <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#044CD0]" />
            <span>{t.tfi.title}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            {t.tfi.desc}
          </p>
        </div>

        {/* Search & Inactive Toggle Card */}
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-3.5 sm:p-4 shadow-xs dark:shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-colors">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.tfi.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-[#044CD0] transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={t.common.clear}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300 group shrink-0">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-100 dark:bg-[#030a16] border-slate-300 dark:border-slate-700 text-[#044CD0] accent-[#044CD0] cursor-pointer"
            />
            <span className="group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
              {t.tfi.showInactive}
            </span>
          </label>
        </div>

        {/* List of Companies */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {t.tfi.loadingList}
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center bg-white/60 dark:bg-[#051329]/50 border border-slate-200 dark:border-[#0e274d] rounded-3xl text-slate-500 dark:text-slate-400">
            {t.tfi.noResults}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {companies.map((company) => (
              <Link
                key={company.companyId}
                href={`/tfi/${company.companyId}`}
                className="group bg-white dark:bg-[#051329] hover:bg-blue-50/40 dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] hover:border-[#044CD0]/60 dark:hover:border-[#044CD0]/70 rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-md dark:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs text-[#044CD0] dark:text-blue-300 font-bold bg-blue-50 dark:bg-[#030a16] border border-blue-200/60 dark:border-[#0e274d] px-2 py-0.5 rounded-lg">
                      {company.nationalCode}
                    </span>
                    {company.isActive !== false ? (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {t.tfi.activeBadge}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                        {t.tfi.inactiveBadge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-[#044CD0] dark:group-hover:text-[#60a5fa] transition-colors mb-2 leading-snug">
                    {company.name}
                  </h3>

                  {company.fromDate && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{t.tfi.inRegistryFrom} {formatDate(company.fromDate)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3.5 border-t border-slate-200/80 dark:border-[#0e274d] mt-4 flex items-center justify-between text-xs text-[#044CD0] dark:text-[#3b82f6] font-semibold">
                  <span>{t.tfi.seeProfileAndFunds}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
