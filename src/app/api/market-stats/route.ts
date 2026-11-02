import { NextResponse } from "next/server";
import { knfApi } from "@/lib/knf-api";

export async function GET() {
  try {
    const stats = await knfApi.getMarketStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("API error /api/market-stats:", error);
    return NextResponse.json({ error: "Failed to fetch market stats" }, { status: 500 });
  }
}

