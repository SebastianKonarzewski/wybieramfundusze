import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = Math.min(parseInt(searchParams.get("size") || "100", 10), 100);
  const sort = searchParams.get("sort") || "name,asc";
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

