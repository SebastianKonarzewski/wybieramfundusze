import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { knfApi } from "@/lib/knf-api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareFloatingBar } from "@/components/CompareFloatingBar";
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

  return (
    <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubfundDetailView profile={profile} />
      </main>

      <Footer />
      <CompareFloatingBar />
    </div>
  );
}
