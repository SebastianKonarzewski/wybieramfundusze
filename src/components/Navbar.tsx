"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Layers, Building2, BarChart2, Scale, ArrowRight } from "lucide-react";
import { useCompare } from "./CompareContext";

export function Navbar() {
  const pathname = usePathname();
  const { selectedFunds } = useCompare();

  const navLinks = [
    { href: "/", label: "Katalog Funduszy", icon: Layers },
    { href: "/porownywarka", label: "Porównywarka", icon: Scale, badge: selectedFunds.length },
    { href: "/tfi", label: "Towarzystwa (TFI)", icon: Building2 },
    { href: "/statystyki", label: "Rynek i Statystyki", icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">
                Wybieram<span className="text-emerald-400">Fundusze</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UKNF API
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Oficjalna porównywarka i baza funduszy
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 border border-slate-700/80 shadow-xs"
                    : "text-slate-300 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-emerald-500 text-slate-950 shadow-xs">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

