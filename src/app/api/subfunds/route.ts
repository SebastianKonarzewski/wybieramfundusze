import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get("search") || undefined;
  
  // Support both multi 'classifications' and single 'classification'
  const classParam = searchParams.get("classifications") || searchParams.get("classification") || undefined;
  const classifications = classParam
    ? classParam.split(",").map((s) => s.trim()).filter((s) => s && s !== "ALL")
    : undefined;

  // Support both multi 'fundTypes' and single 'fundType'
  const typeParam = searchParams.get("fundTypes") || searchParams.get("fundType") || undefined;
  const fundTypes = typeParam
    ? typeParam.split(",").map((s) => s.trim()).filter((s) => s && s !== "ALL")
    : undefined;

  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = Math.min(parseInt(searchParams.get("size") || "24", 10), 100);
  const sort = searchParams.get("sort") || "name,asc";
  const includeInactive = searchParams.get("includeInactive") === "true";
  const includeLiquidating = searchParams.get("includeLiquidating") === "true";
  const fundId = searchParams.get("fundId") ? parseInt(searchParams.get("fundId")!, 10) : undefined;
  const enriched = searchParams.get("enriched") !== "false";

  try {
    if (enriched) {
      const data = await knfApi.getEnrichedSubfunds({
        search,
        classifications,
        fundTypes,
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
