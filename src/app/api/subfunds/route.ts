import { NextRequest, NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = Math.min(parseInt(searchParams.get("size") || "24", 10), 50);
  const sort = searchParams.get("sort") || "name,asc";
  const includeInactive = searchParams.get("includeInactive") === "true";
  const includeLiquidating = searchParams.get("includeLiquidating") === "true";
  const fundId = searchParams.get("fundId") ? parseInt(searchParams.get("fundId")!, 10) : undefined;
  const enriched = searchParams.get("enriched") !== "false"; // default true for better UI cards

  try {
    if (enriched) {
      const data = await knfApi.getEnrichedSubfunds({
        search,
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

