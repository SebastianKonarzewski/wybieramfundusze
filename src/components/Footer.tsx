"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-[#0e274d] bg-[#030a16] mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#0e274d]/80">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-base text-slate-100">
                {t.nav.brandName}<span className="text-[#3b82f6]">{t.nav.brandHighlight}</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3">
              {t.footer.sourcesTitle}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://wybieramfundusze-api.knf.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  wybieramfundusze-api.knf.gov.pl
                </a>
              </li>
              <li>
                <a
                  href="https://wybieramfundusze.knf.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#3b82f6] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t.footer.uknfPortal}
                </a>
              </li>
              <li>
                <a
                  href="https://wybieramfundusze-api.knf.gov.pl/documentation.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#3b82f6] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t.footer.apiDocs}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3b82f6]" /> {t.footer.legalNoticeTitle}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.legalNoticeDesc}
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} WybieramFundusze. {t.footer.copyright}</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-200">
              {t.footer.catalogLink}
            </Link>
            <Link href="/porownywarka" className="hover:text-slate-200">
              {t.footer.comparatorLink}
            </Link>
            <Link href="/tfi" className="hover:text-slate-200">
              {t.footer.tfiLink}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
