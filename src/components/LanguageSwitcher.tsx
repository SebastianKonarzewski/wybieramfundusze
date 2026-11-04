"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === "pl" ? "en" : "pl");
  };

  const nextLocale = locale === "pl" ? "EN" : "PL";
  const label =
    locale === "pl"
      ? "Przełącz na język angielski (Switch to English)"
      : "Przełącz na język polski (Switch to Polish)";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      data-component="language-toggle"
      className="h-9 sm:h-10 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-slate-300 dark:border-[#0e274d] bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-200 hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-[#044CD0]/60 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs text-xs font-bold"
      title={label}
      aria-label={label}
    >
      <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.2]" />
      <span>{nextLocale}</span>
    </button>
  );
}
