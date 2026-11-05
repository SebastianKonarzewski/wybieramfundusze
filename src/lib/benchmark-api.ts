export interface BenchmarkPoint {
  date: string;
  value: number;
}

export interface BenchmarkSeries {
  symbol: string;
  name: string;
  category: "akcji" | "dłużne";
  points: BenchmarkPoint[];
}

export const VALID_BENCHMARK_RANGES = ["1mo", "3mo", "6mo", "1y", "3y", "5y", "max"] as const;
export type BenchmarkRange = (typeof VALID_BENCHMARK_RANGES)[number];

const BENCHMARK_MAP: Record<string, { ticker: string; name: string; category: "akcji" | "dłużne" }> = {
  WIG: { ticker: "ETFBW20TR.WA", name: "WIG20 TR (Polskie Akcje)", category: "akcji" },
  MWIG40: { ticker: "ETFBM40TR.WA", name: "mWIG40 TR (Średnie Spółki)", category: "akcji" },
  TBSP: { ticker: "ETFBTBSP.WA", name: "TBSP (Polskie Obligacje Skarbowe)", category: "dłużne" },
};

// In-memory cache for benchmark points (12 hours) with max entries protection
const cache: Record<string, { timestamp: number; data: BenchmarkSeries }> = {};
const CACHE_TTL = 12 * 3600 * 1000;
const MAX_CACHE_ENTRIES = 50;

export async function getBenchmarkData(
  symbol: string,
  rawRange: string = "3y"
): Promise<BenchmarkSeries | null> {
  const normKey = (symbol || "").toUpperCase().trim();
  const benchmarkConfig = BENCHMARK_MAP[normKey] || BENCHMARK_MAP["WIG"];
  if (!benchmarkConfig) return null;

  const range: BenchmarkRange = VALID_BENCHMARK_RANGES.includes(rawRange as BenchmarkRange)
    ? (rawRange as BenchmarkRange)
    : "3y";

  const cacheKey = `${normKey}_${range}`;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return cache[cacheKey].data;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${benchmarkConfig.ticker}?range=${range}&interval=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 * 6 },
    });

    if (!response.ok) {
      console.warn(`[Benchmark API] Failed to fetch ${benchmarkConfig.ticker}: ${response.status}`);
      return null;
    }

    const json = await response.json();
    const result = json.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return null;
    }

    const timestamps: number[] = result.timestamp;
    const closes: (number | null)[] = result.indicators.quote[0].close;

    const points: BenchmarkPoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i];
      if (close !== null && close !== undefined && !isNaN(close)) {
        const d = new Date(timestamps[i] * 1000);
        const dateStr = d.toISOString().split("T")[0];
        points.push({
          date: dateStr,
          value: parseFloat(close.toFixed(2)),
        });
      }
    }

    const seriesData: BenchmarkSeries = {
      symbol: normKey,
      name: benchmarkConfig.name,
      category: benchmarkConfig.category,
      points,
    };

    // Purge stale or excessive cache entries if limit reached
    const keys = Object.keys(cache);
    if (keys.length >= MAX_CACHE_ENTRIES) {
      delete cache[keys[0]];
    }

    cache[cacheKey] = {
      timestamp: now,
      data: seriesData,
    };

    return seriesData;
  } catch (error) {
    console.error(`[Benchmark API] Error fetching ${normKey}:`, error);
    return null;
  }
}
