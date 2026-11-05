"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Layers,
  Building2,
  BarChart2,
  Scale,
  ExternalLink,
  FlaskConical,
  Menu,
  X,
} from "lucide-react";
import { useCompare } from "./CompareContext";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccessibilityToolbar } from "./AccessibilityToolbar";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { selectedFunds } = useCompare();
  const { t, locale } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  // Auto-close mobile menu and WCAG menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsA11yOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsA11yOpen(false);
      }
    };
    if (isMobileMenuOpen || isA11yOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen, isA11yOpen]);

  // Coordinated menu toggles: opening one closes the other
  const handleA11yOpenChange = (open: boolean) => {
    if (open) {
      setIsMobileMenuOpen(false);
    }
    setIsA11yOpen(open);
  };

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      setIsA11yOpen(false);
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: t.nav.catalog, icon: Layers },
    { href: "/porownywarka", label: t.nav.comparator, icon: Scale, badge: selectedFunds.length },
    { href: "/tfi", label: t.nav.tfi, icon: Building2 },
    { href: "/statystyki", label: t.nav.stats, icon: BarChart2 },
  ];

  return (
    <>
      {/* WCAG Skip to Main Content Link */}
      <a href="#main-content" className="skip-link">
        {t.a11y.skipToContent}
      </a>

      <header
        data-component="navbar-header"
        className="sticky top-0 z-50 w-full border-b border-[#0e274d] bg-[#030a16]/95 backdrop-blur-md"
      >
        {/* Dev / Preview Mode Top Announcement Banner */}
        <div
          data-component="announcement-banner"
          className="w-full bg-[#021838] border-b border-[#0e274d] text-[10px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-4 lg:px-5 xl:px-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-x-4 gap-y-0.5 sm:gap-y-1 text-center sm:text-left">
            <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                <FlaskConical className="w-3 h-3 text-amber-400" />
                {t.nav.devBannerTitle}
              </span>
              <span className="text-slate-400 hidden xl:inline">
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

        <div
          data-component="navbar-content"
          className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-5 xl:px-8 h-13 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-3"
        >
          {/* Brand with UKNF Navy Blue styling */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#02224D] to-[#044CD0] flex items-center justify-center text-white shadow-xs border border-blue-400/40 shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base xl:text-lg text-slate-100 tracking-tight whitespace-nowrap">
                  {t.nav.brandName}<span className="text-[#3b82f6]">{t.nav.brandHighlight}</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#f0f7ff] dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-[#60a5fa] border border-[#bfdbfe] dark:border-[#044CD0]/40 hidden xl:inline-block shadow-2xs">
                  UKNF API
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xl:block truncate">
                {t.nav.brandSubtitle}
              </p>
            </div>
          </Link>

          {/* Navigation & Controls Container */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Navigation Links (<nav>) - visible only on lg: */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label={t.nav.menu}>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex items-center justify-center gap-1.5 xl:gap-2 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-[#044CD0] text-white shadow-xs font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-[#071938]"
                    }`}
                    title={link.label}
                    aria-label={link.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="flex items-center justify-center min-w-[16px] h-4 xl:min-w-[20px] xl:h-5 px-1 text-[10px] xl:text-xs font-bold rounded-full bg-amber-400 text-slate-950 shadow-xs shrink-0">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Divider - visible only on lg: */}
            <div className="hidden lg:block w-px h-5 bg-[#0e274d] mx-1" />

            {/* Quick Comparator Badge Link (Mobile only, when funds are selected) */}
            {selectedFunds.length > 0 && (
              <Link
                href="/porownywarka"
                className="lg:hidden relative w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-blue-500/50 bg-[#044CD0]/15 text-[#60a5fa] hover:text-white flex items-center justify-center shrink-0"
                title={`${t.nav.comparator} (${selectedFunds.length})`}
                aria-label={`${t.nav.comparator} (${selectedFunds.length})`}
              >
                <Scale className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-0.5 text-[9px] font-black rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  {selectedFunds.length}
                </span>
              </Link>
            )}

            {/* Language Switcher (Compact single button toggle EN/PL) */}
            <LanguageSwitcher />

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Accessibility Toolbar (Single instance for both mobile and desktop) */}
            <AccessibilityToolbar
              isOpen={isA11yOpen}
              onOpenChange={handleA11yOpenChange}
            />

            {/* Hamburger Button (Mobile only, < lg) */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              data-component="navbar-hamburger"
              className={`lg:hidden w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs ${
                isMobileMenuOpen
                  ? "bg-[#044CD0] text-white border-blue-400 shadow-md ring-2 ring-blue-400/30"
                  : "border-slate-300 dark:border-[#0e274d] bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-200 hover:text-[#044CD0] dark:hover:text-white"
              }`}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={isMobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-current" />
              ) : (
                <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-current" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            data-component="mobile-nav"
            className="lg:hidden border-b border-slate-200 dark:border-[#0e274d] bg-white dark:bg-[#030a16] text-slate-800 dark:text-slate-200 shadow-2xl relative z-50 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150"
          >
            <div className="max-w-7xl mx-auto px-3.5 py-3">
              {/* Portal Subpages Navigation Links Only */}
              <nav className="flex flex-col gap-1.5" aria-label={t.nav.menu}>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#044CD0] text-white shadow-md font-bold"
                          : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#071938] border border-transparent hover:border-slate-300 dark:hover:border-[#0e274d]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-[#071938] text-[#044CD0] dark:text-[#60a5fa]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{link.label}</span>
                      </div>
                      {link.badge !== undefined && link.badge > 0 && (
                        <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-black rounded-full bg-amber-400 text-slate-950 shadow-xs">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Full-viewport Mobile Backdrop Overlay with blur & darkening */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-150"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
