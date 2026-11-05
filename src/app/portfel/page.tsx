"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PortfolioSimulator } from "@/components/PortfolioSimulator";
import { useTranslation } from "@/lib/i18n";

export default function PortfolioPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {t.portfolio.pageTitle}
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            {t.portfolio.pageDesc}
          </p>
        </div>

        <PortfolioSimulator />
      </main>

      <Footer />
    </div>
  );
}
