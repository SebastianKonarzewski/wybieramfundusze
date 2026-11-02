import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const companyId = parseInt(id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  try {
    const [company, history, fundsRes] = await Promise.all([
      knfApi.getCompany(companyId),
      knfApi.getCompanyHistory(companyId),
      knfApi.getFunds({ companyId, size: 100, includeInactive: true, includeLiquidating: true }),
    ]);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      company,
      history,
      funds: fundsRes.content,
    });
  } catch (error) {
    console.error(`API error /api/companies/${companyId}:`, error);
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}

