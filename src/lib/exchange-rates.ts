/**
 * NBP (Narodowy Bank Polski) Currency Exchange Rates Service
 * 
 * Fetches official Table A mid exchange rates from NBP public API.
 * Uses in-memory caching with 4-hour TTL and robust fallback rates.
 */

export interface ExchangeRates {
  [code: string]: number;
}

export interface NBPRateItem {
  currency: string;
  code: string;
  mid: number;
}

export interface NBPTableResponse {
  table: string;
  no: string;
  effectiveDate: string;
  rates: NBPRateItem[];
}

export interface ExchangeRatesState {
  rates: ExchangeRates;
  effectiveDate: string | null;
  lastFetchedAt: number;
}

const FALLBACK_RATES: ExchangeRates = {
  PLN: 1.0,
  USD: 3.92,
  EUR: 4.39,
  CHF: 4.70,
  GBP: 5.15,
};

const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

let cachedState: ExchangeRatesState = {
  rates: { ...FALLBACK_RATES },
  effectiveDate: null,
  lastFetchedAt: 0,
};

/**
 * Fetch latest exchange rates from NBP API with caching
 */
export async function getExchangeRates(forceRefresh = false): Promise<ExchangeRatesState> {
  const now = Date.now();

  if (
    !forceRefresh &&
    cachedState.lastFetchedAt > 0 &&
    now - cachedState.lastFetchedAt < CACHE_TTL_MS
  ) {
    return cachedState;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch("https://api.nbp.pl/api/exchangerates/tables/a/?format=json", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 14400 }, // 4h ISR cache
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data: NBPTableResponse[] = await res.json();
      if (Array.isArray(data) && data[0]?.rates) {
        const rates: ExchangeRates = { PLN: 1.0 };
        for (const r of data[0].rates) {
          rates[r.code] = r.mid;
        }

        cachedState = {
          rates,
          effectiveDate: data[0].effectiveDate,
          lastFetchedAt: now,
        };
        return cachedState;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[NBP API] Could not fetch live exchange rates, using cached/fallback:", msg);
  }

  // Fallback to existing cache or default rates
  if (cachedState.lastFetchedAt === 0) {
    cachedState = {
      rates: { ...FALLBACK_RATES },
      effectiveDate: null,
      lastFetchedAt: now,
    };
  }

  return cachedState;
}

/**
 * Synchronous getter returning latest cached or fallback exchange rates
 */
export function getExchangeRatesSync(): ExchangeRates {
  return cachedState.rates;
}

/**
 * Convert an amount in a given currency to its PLN equivalent
 */
export function convertToPln(
  amount: number | null | undefined,
  currency: string = "PLN",
  rates: ExchangeRates = cachedState.rates
): number | null {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return null;
  }

  const code = currency ? currency.toUpperCase() : "PLN";
  if (code === "PLN" || code === "ZŁ") {
    return amount;
  }

  const rate = rates[code] || FALLBACK_RATES[code] || 1.0;
  return amount * rate;
}

/**
 * Get exchange rate for a given currency to PLN
 */
export function getRateForCurrency(
  currency: string = "PLN",
  rates: ExchangeRates = cachedState.rates
): number {
  const code = currency ? currency.toUpperCase() : "PLN";
  if (code === "PLN" || code === "ZŁ") {
    return 1.0;
  }
  return rates[code] || FALLBACK_RATES[code] || 1.0;
}
