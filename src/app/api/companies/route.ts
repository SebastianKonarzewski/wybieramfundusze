import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const rawSearch = searchParams.get("search");
  const search = rawSearch ? rawSearch.slice(0, 100).trim() || undefined : undefined;
  const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10) || 0);
  const size = Math.max(1, Math.min(parseInt(searchParams.get("size") || "50", 10) || 50, 100));
  const rawSort = searchParams.get("sort") || "name,asc";
  const sort = ["name,asc", "name,desc"].includes(rawSort) ? rawSort : "name,asc";
  const includeInactive = searchParams.get("includeInactive") === "true";

  try {
    const data = await knfApi.getCompanies({
      search,
      page,
      size,
      sort,
      includeInactive,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error /api/companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies from KNF" }, { status: 500 });
  }
}

