"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Layers, Building2, BarChart2, Scale, ExternalLink, FlaskConical } from "lucide-react";
import { useCompare } from "./CompareContext";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
  const pathname = usePathname();
  const { selectedFunds } = useCompare();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/", label: t.nav.catalog, icon: Layers },
    { href: "/porownywarka", label: t.nav.comparator, icon: Scale, badge: selectedFunds.length },
    { href: "/tfi", label: t.nav.tfi, icon: Building2 },
    { href: "/statystyki", label: t.nav.stats, icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#0e274d] bg-[#030a16]/95 backdrop-blur-md">
      {/* Dev / Preview Mode Top Announcement Banner */}
      <div className="w-full bg-[#021838] border-b border-[#0e274d] text-[10px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-x-4 gap-y-0.5 sm:gap-y-1 text-center sm:text-left">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
              <FlaskConical className="w-3 h-3 text-amber-400" />
              {t.nav.devBannerTitle}
            </span>
            <span className="text-slate-400 hidden md:inline">
              {t.nav.devBannerDesc}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300 shrink-0">
            <span className="text-slate-400 hidden sm:inline">{t.nav.officialSiteLabel}</span>
            <a
              href="https://wybieramfundusze.knf.gov.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#60a5fa] hover:text-white font-medium hover:underline transition-colors"
            >
              wybieramfundusze.knf.gov.pl
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-13 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand with UKNF Navy Blue styling */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#02224D] to-[#044CD0] flex items-center justify-center text-white shadow-md shadow-[#044CD0]/30 group-hover:scale-105 transition-transform border border-blue-400/30 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-lg text-slate-100 tracking-tight whitespace-nowrap">
                {t.nav.brandName}<span className="text-[#3b82f6]">{t.nav.brandHighlight}</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#044CD0]/20 text-[#60a5fa] border border-[#044CD0]/40 hidden md:inline-block">
                UKNF API
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
              {t.nav.brandSubtitle}
            </p>
          </div>
        </Link>

        {/* Navigation & Language Switcher */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <nav className="flex items-center gap-0.5 sm:gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#044CD0] text-white shadow-xs font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-[#071938]"
                  }`}
                  title={link.label}
                  aria-label={link.label}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-4 h-4 shrink-0" />
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 text-[9px] font-black rounded-full bg-amber-400 text-slate-950 shadow-xs sm:hidden">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:inline">{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="hidden sm:flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-amber-400 text-slate-950 shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="w-px h-4 sm:h-5 bg-[#0e274d] mx-0.5" />

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
