import { NextRequest, NextResponse } from "next/server";
import { getBenchmarkData, BenchmarkRange, VALID_BENCHMARK_RANGES } from "@/lib/benchmark-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawSymbol = searchParams.get("symbol") || "WIG";
  const rawRange = searchParams.get("range") || "3y";

  const symbol = rawSymbol.slice(0, 20).trim();
  const range: BenchmarkRange = VALID_BENCHMARK_RANGES.includes(rawRange as BenchmarkRange)
    ? (rawRange as BenchmarkRange)
    : "3y";

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

