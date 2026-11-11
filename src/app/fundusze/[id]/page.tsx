import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { knfApi } from "@/lib/knf-api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubfundDetailView } from "@/components/SubfundDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const subfundId = parseInt(id, 10);
  if (isNaN(subfundId)) return { title: "Fundusz" };

  const subfund = await knfApi.getSubfund(subfundId);
  if (!subfund) return { title: "Fundusz" };

  return {
    title: subfund.name,
    description: `Profil i wyceny funduszu ${subfund.name} (${subfund.type}) w rejestrze UKNF.`,
  };
}

export default async function SubfundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subfundId = parseInt(id, 10);

  if (isNaN(subfundId)) {
    notFound();
  }

  const profile = await knfApi.getSubfundFullProfile(subfundId);

  if (!profile) {
    notFound();
  }

  // Fetch similar funds from the same classification or category
  let similarFunds: import("@/types/knf").SubfundCardModel[] = [];
  const classification = profile.subfund.classification || profile.fund?.classification;
  if (classification) {
    try {
      const similarRes = await knfApi.getEnrichedSubfunds({
        classification,
        size: 10,
        sort: "return1Y,desc",
      });
      similarFunds = (similarRes.items || [])
        .filter((item) => item.subfundId !== subfundId)
        .slice(0, 4);
    } catch {
      // ignore
    }
  }

  // Fallback if no similar by classification: look for funds from the same company
  if (similarFunds.length === 0 && profile.company?.name) {
    try {
      const compRes = await knfApi.getEnrichedSubfunds({
        company: profile.company.name,
        size: 8,
        sort: "return1Y,desc",
      });
      similarFunds = (compRes.items || [])
        .filter((item) => item.subfundId !== subfundId)
        .slice(0, 4);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030a16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubfundDetailView profile={profile} similarFunds={similarFunds} />
      </main>

      <Footer />
    </div>
  );
}
