import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MarketHero } from "@/components/MarketHero";
import { SubfundsCatalog } from "@/components/SubfundsCatalog";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
import { knfApi } from "@/lib/knf-api";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; fundId?: string; fundName?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialSearch = typeof resolvedParams?.search === "string" ? resolvedParams.search : "";
  const initialFundId = resolvedParams?.fundId && !isNaN(parseInt(resolvedParams.fundId, 10))
    ? parseInt(resolvedParams.fundId, 10)
    : undefined;
  const initialFundName = typeof resolvedParams?.fundName === "string" ? resolvedParams.fundName : undefined;

  const [stats, initialSubfunds] = await Promise.all([
    knfApi.getMarketStats(),
    knfApi.getEnrichedSubfunds({
      size: 24,
      sort: "name,asc",
      search: initialSearch || undefined,
      fundId: initialFundId,
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top market hero metrics */}
        <MarketHero stats={stats} />

        {/* Main interactive subfunds catalog */}
        <SubfundsCatalog
          initialItems={initialSubfunds.items}
          initialPage={initialSubfunds.page}
          initialSearch={initialSearch}
          initialFundId={initialFundId}
          initialFundName={initialFundName}
        />
      </main>

      <Footer />
      <CompareFloatingBar />
    </div>
  );
}
