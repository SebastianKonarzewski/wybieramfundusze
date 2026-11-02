"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center bg-[#030a16] p-0.5 rounded-lg border border-[#0e274d] text-[11px] font-semibold shrink-0">
      <button
        type="button"
        onClick={() => setLocale("pl")}
        className={`px-2 py-1 rounded transition-all cursor-pointer ${
          locale === "pl"
            ? "bg-[#044CD0] text-white shadow-xs font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Język polski"
        aria-label="Wersja polska"
      >
        PL
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2 py-1 rounded transition-all cursor-pointer ${
          locale === "en"
            ? "bg-[#044CD0] text-white shadow-xs font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="English language"
        aria-label="English version"
      >
        EN
      </button>
    </div>
  );
}
