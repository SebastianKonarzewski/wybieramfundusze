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

const BENCHMARK_MAP: Record<string, { ticker: string; name: string; category: "akcji" | "dłużne" }> = {
  WIG: { ticker: "ETFBW20TR.WA", name: "WIG20 TR (Polskie Akcje)", category: "akcji" },
  MWIG40: { ticker: "ETFBM40TR.WA", name: "mWIG40 TR (Średnie Spółki)", category: "akcji" },
  TBSP: { ticker: "ETFBTBSP.WA", name: "TBSP (Polskie Obligacje Skarbowe)", category: "dłużne" },
};

// In-memory cache for benchmark points (12 hours)
const cache: Record<string, { timestamp: number; data: BenchmarkSeries }> = {};
const CACHE_TTL = 12 * 3600 * 1000;

export async function getBenchmarkData(
  symbol: string,
  range: "1mo" | "3mo" | "6mo" | "1y" | "3y" | "5y" | "max" = "3y"
): Promise<BenchmarkSeries | null> {
  const normKey = symbol.toUpperCase();
  const benchmarkConfig = BENCHMARK_MAP[normKey] || BENCHMARK_MAP["WIG"];
  if (!benchmarkConfig) return null;

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
