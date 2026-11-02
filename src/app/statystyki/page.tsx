import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareProvider } from "@/components/CompareContext";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
import { StatsView } from "@/components/StatsView";
import { knfApi } from "@/lib/knf-api";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const [stats, totalAssetsHistoryRes] = await Promise.all([
    knfApi.getMarketStats(),
    knfApi.getTotalAssets({ size: 24, sort: "date,desc" }),
  ]);

  const history = totalAssetsHistoryRes.content || [];

  return (
    <CompareProvider>
      <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
        <Navbar />

        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsView stats={stats} history={history} />
        </main>

        <Footer />
        <CompareFloatingBar />
      </div>
    </CompareProvider>
  );
}
