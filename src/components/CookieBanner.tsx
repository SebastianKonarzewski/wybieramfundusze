"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Cookie, X } from "lucide-react";
import { useAccessibility } from "@/lib/accessibility";
import { useTranslation } from "@/lib/i18n";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { openPrivacyModal } = useAccessibility();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        startTransition(() => {
          setIsVisible(true);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie_consent", "accepted");
      setIsVisible(false);
    } catch {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label={t.cookies.bannerTitle}
      className="fixed bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-auto sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#051329]/95 border border-[#044CD0]/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-xs sm:text-sm">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#3b82f6] shrink-0">
              <Cookie className="w-3.5 h-3.5" />
            </div>
            <span>{t.cookies.bannerTitle}</span>
          </div>

          <button
            onClick={handleAccept}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={t.common.close}
            aria-label={t.common.close}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {t.cookies.bannerText}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#0e274d]/80">
          <button
            type="button"
            onClick={openPrivacyModal}
            className="text-xs text-[#60a5fa] hover:text-white font-medium hover:underline transition-colors"
          >
            {t.cookies.privacyDetails}
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-xs transition-colors cursor-pointer"
          >
            {t.cookies.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

