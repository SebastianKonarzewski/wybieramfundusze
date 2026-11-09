import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const rawSearch = searchParams.get("search");
  const search = rawSearch ? rawSearch.slice(0, 100).trim() || undefined : undefined;
  
  // Support both multi 'classifications' and single 'classification'
  const classParam = searchParams.get("classifications") || searchParams.get("classification") || undefined;
  const classifications = classParam
    ? classParam.split(",").map((s) => s.slice(0, 50).trim()).filter((s) => s && s !== "ALL")
    : undefined;

  // Support both multi 'fundTypes' and single 'fundType'
  const typeParam = searchParams.get("fundTypes") || searchParams.get("fundType") || undefined;
  const fundTypes = typeParam
    ? typeParam.split(",").map((s) => s.slice(0, 20).trim()).filter((s) => s && s !== "ALL")
    : undefined;

  // Support both multi 'categories' and single 'category'
  const categoryParam = searchParams.get("categories") || searchParams.get("category") || undefined;
  const categories = categoryParam
    ? categoryParam.split(",").map((s) => s.slice(0, 80).trim()).filter((s) => s && s !== "ALL")
    : undefined;

  const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10) || 0);
  const size = Math.max(1, Math.min(parseInt(searchParams.get("size") || "24", 10) || 24, 100));
  const rawSort = searchParams.get("sort") || "name,asc";
  const allowedSorts = [
    "name,asc",
    "name,desc",
    "return1M,asc",
    "return1M,desc",
    "return3M,asc",
    "return3M,desc",
    "return1Y,asc",
    "return1Y,desc",
    "return3Y,asc",
    "return3Y,desc",
    "returnYTD,asc",
    "returnYTD,desc",
  ];
  const sort = allowedSorts.includes(rawSort) ? rawSort : "name,asc";
  const includeInactive = searchParams.get("includeInactive") === "true";
  const includeLiquidating = searchParams.get("includeLiquidating") === "true";
  const rawFundId = searchParams.get("fundId");
  const fundId = rawFundId && !isNaN(parseInt(rawFundId, 10)) && parseInt(rawFundId, 10) > 0 ? parseInt(rawFundId, 10) : undefined;
  const enriched = searchParams.get("enriched") !== "false";

  try {
    if (enriched) {
      const data = await knfApi.getEnrichedSubfunds({
        search,
        classifications,
        fundTypes,
        categories,
        page,
        size,
        sort,
        includeInactive,
        includeLiquidating,
        fundId,
      });
      return NextResponse.json(data);
    } else {
      const data = await knfApi.getSubfunds({
        search,
        fundType: fundTypes && fundTypes.length === 1 ? fundTypes[0] : undefined,
        page,
        size,
        sort,
        includeInactive,
        includeLiquidating,
        fundId,
      });
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("API error /api/subfunds:", error);
    return NextResponse.json({ error: "Failed to fetch subfunds from KNF" }, { status: 500 });
  }
}
