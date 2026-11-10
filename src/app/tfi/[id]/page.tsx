import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { knfApi } from "@/lib/knf-api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanyDetailView } from "@/components/CompanyDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const companyId = parseInt(id, 10);
  if (isNaN(companyId)) return { title: "Towarzystwo TFI" };

  const company = await knfApi.getCompany(companyId);
  if (!company) return { title: "Towarzystwo TFI" };

  return {
    title: company.name,
    description: `Profil Towarzystwa Funduszy Inwestycyjnych ${company.name} w rejestrze UKNF.`,
  };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    notFound();
  }

  const [company, history, fundsRes] = await Promise.all([
    knfApi.getCompany(companyId),
    knfApi.getCompanyHistory(companyId),
    knfApi.getFunds({ companyId, size: 100, includeInactive: true, includeLiquidating: true }),
  ]);

  if (!company) {
    notFound();
  }

  const funds = fundsRes.content || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#030a16] text-slate-100">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyDetailView company={company} history={history} funds={funds} />
      </main>

      <Footer />
    </div>
  );
}
