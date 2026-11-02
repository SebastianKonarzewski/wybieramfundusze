import { NextRequest, NextResponse } from "next/server";
import { getBenchmarkData } from "@/lib/benchmark-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol") || "WIG";
  const range = (searchParams.get("range") || "3y") as any;

  try {
    const data = await getBenchmarkData(symbol, range);
    if (!data) {
      return NextResponse.json({ error: "Benchmark not found or unavailable" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error /api/benchmarks:", error);
    return NextResponse.json({ error: "Failed to fetch benchmark" }, { status: 500 });
  }
}

