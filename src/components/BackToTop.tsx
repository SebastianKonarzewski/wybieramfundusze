"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useCompare } from "./CompareContext";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();
  const { selectedFunds } = useCompare();
  const hasCompareBar = selectedFunds.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t.catalog.backToTop}
      title={t.catalog.backToTop}
      className={`fixed ${hasCompareBar ? "bottom-32 sm:bottom-28" : "bottom-5 sm:bottom-6"} right-4 sm:right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#051329] hover:bg-blue-50 dark:hover:bg-[#071938] text-slate-700 dark:text-slate-200 hover:text-[#044CD0] dark:hover:text-blue-400 border border-slate-300 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-[#044CD0]/60 shadow-lg sm:shadow-xl flex items-center justify-center transition-all cursor-pointer animate-in fade-in zoom-in-90 duration-150 group`}
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
