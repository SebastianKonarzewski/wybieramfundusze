"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  Database,
  Lock,
  Trash2,
  ExternalLink,
  Check,
  FileCheck,
} from "lucide-react";
import { useAccessibility } from "@/lib/accessibility";
import { useTranslation } from "@/lib/i18n";

export function PrivacyModal() {
  const { isPrivacyModalOpen, closePrivacyModal } = useAccessibility();
  const { t } = useTranslation();
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isPrivacyModalOpen) return null;

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      setClearedNotice(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#051329] border border-[#0e274d] rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#0e274d] flex items-start justify-between gap-4 bg-[#030a16]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#3b82f6] shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {t.privacyModal.badge}
                </span>
              </div>
              <h2
                id="privacy-modal-title"
                className="text-base sm:text-lg font-bold text-slate-100 tracking-tight"
              >
                {t.privacyModal.title}
              </h2>
            </div>
          </div>

          <button
            onClick={closePrivacyModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#071938] transition-colors cursor-pointer"
            aria-label={t.privacyModal.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3b82f6]" />
              {t.privacyModal.section1Title}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {t.privacyModal.section1Text}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3b82f6]" />
              {t.privacyModal.section2Title}
            </h3>
            <p className="text-slate-400">
              {t.privacyModal.section2Text}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300 text-xs">
              <li><strong className="text-slate-200">preferred_locale</strong> — {t.privacyModal.storageItem1}</li>
              <li><strong className="text-slate-200">comparison_funds</strong> — {t.privacyModal.storageItem2}</li>
              <li><strong className="text-slate-200">cookie_consent</strong> — {t.privacyModal.storageItem3}</li>
              <li><strong className="text-slate-200">a11y_preferences</strong> — {t.privacyModal.storageItem4}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#3b82f6]" />
              {t.privacyModal.section3Title}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {t.privacyModal.section3Text}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-2 border-t border-[#0e274d]">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              {t.privacyModal.section4Title}
            </h3>
            <p className="text-slate-400">
              {t.privacyModal.section4Text}
            </p>

            {clearedNotice ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                {t.privacyModal.clearedMessage}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClearLocalStorage}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#030a16] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#0e274d] hover:border-rose-500/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                {t.privacyModal.clearStorageBtn}
              </button>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#0e274d] bg-[#030a16] flex justify-end">
          <button
            type="button"
            onClick={closePrivacyModal}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white transition-colors cursor-pointer"
          >
            {t.privacyModal.close}
          </button>
        </div>
      </div>
    </div>
  );
}

