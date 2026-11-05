"use client";

import React, { createContext, useContext, useState, useEffect, startTransition } from "react";
import { pl, Translations } from "@/locales/pl";
import { en } from "@/locales/en";
import {
  Locale,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatLargeNumber,
  formatLargeNumberParts,
} from "@/lib/utils";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  formatNumber: (value: number | null | undefined, decimals?: number) => string;
  formatCurrency: (value: number | null | undefined, currency?: string) => string;
  formatPercent: (value: number | null | undefined, digits?: number) => string;
  formatDate: (dateString: string | null | undefined) => string;
  formatLargeNumber: (value: number | null | undefined) => string;
  formatLargeNumberParts: (value: number | null | undefined) => { value: string; unit: string };
}

const I18nContext = createContext<I18nContextType | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pl");

  // Load saved locale from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_locale") as Locale | null;
      if (saved === "pl" || saved === "en") {
        startTransition(() => {
          setLocaleState(saved);
        });
        document.documentElement.lang = saved;
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("preferred_locale", newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // ignore
    }
  };

  const t = locale === "en" ? en : pl;

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatNumber: (val, dec) => formatNumber(val, dec, locale),
        formatCurrency: (val, curr) => formatCurrency(val, curr, locale),
        formatPercent: (val, dig) => formatPercent(val, dig, locale),
        formatDate: (d) => formatDate(d, locale),
        formatLargeNumber: (val) => formatLargeNumber(val, locale),
        formatLargeNumberParts: (val) => formatLargeNumberParts(val, locale),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      locale: "pl" as Locale,
      setLocale: () => {},
      t: pl,
      formatNumber: (val: number | null | undefined, dec?: number) => formatNumber(val, dec, "pl"),
      formatCurrency: (val: number | null | undefined, curr?: string) => formatCurrency(val, curr, "pl"),
      formatPercent: (val: number | null | undefined, dig?: number) => formatPercent(val, dig, "pl"),
      formatDate: (d: string | null | undefined) => formatDate(d, "pl"),
      formatLargeNumber: (val: number | null | undefined) => formatLargeNumber(val, "pl"),
      formatLargeNumberParts: (val: number | null | undefined) => formatLargeNumberParts(val, "pl"),
    };
  }
  return ctx;
}

