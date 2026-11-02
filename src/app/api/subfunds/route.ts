import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get("search") || undefined;
  const classification = searchParams.get("classification") || undefined;
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = Math.min(parseInt(searchParams.get("size") || "24", 10), 50);
  const sort = searchParams.get("sort") || "name,asc";
  const includeInactive = searchParams.get("includeInactive") === "true";
  const includeLiquidating = searchParams.get("includeLiquidating") === "true";
  const fundId = searchParams.get("fundId") ? parseInt(searchParams.get("fundId")!, 10) : undefined;
  const fundType = searchParams.get("fundType") && searchParams.get("fundType") !== "ALL" ? searchParams.get("fundType")! : undefined;
  const enriched = searchParams.get("enriched") !== "false";

  try {
    if (enriched) {
      const data = await knfApi.getEnrichedSubfunds({
        search,
        classification,
        fundType,
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
        fundType,
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
