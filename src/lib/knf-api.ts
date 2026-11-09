import {
  KNFListResponse,
  KNFCompany,
  KNFCompanyDetail,
  KNFFund,
  KNFFundDetail,
  KNFSubfund,
  KNFSubfundDetail,
  KNFHistoryItem,
  KNFKeyInformationDoc,
  KNFKeyInformationDetail,
  KNFValuation,
  KNFAsset,
  KNFTotalAsset,
  SubfundFullProfile,
  MarketStatistics,
  SubfundCardModel,
  RuntimeSubfundMeta,
} from "@/types/knf";
import subfundsClassifications from "@/data/subfunds-classifications.json";
import standaloneFundsData from "@/data/standalone-funds.json";
import subfundsMetrics from "@/data/subfunds-metrics.json";

const BASE_URL = "https://wybieramfundusze-api.knf.gov.pl";
const DEFAULT_REVALIDATE = 3600; // 1 hour cache

// Subfunds in KNF API with zero valuations (mostly non-public private FIZ subfunds)
const UNQUOTED_SUBFUND_IDS = new Set([
  204752, 203670, 211676, 211703, 193106, 191488, 197674, 203645, 635470, 193134, 203695, 635515,
]);

interface FetchOptions {
  revalidate?: number | false;
  cache?: RequestCache;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global runtime memory store to persist across hot reloads in Next.js development and warm serverless containers
const globalForKnf = globalThis as unknown as {
  knfRuntimeClassifications?: Map<number, RuntimeSubfundMeta>;
  knfSubfundDetailCache?: Map<number, CacheEntry<KNFSubfundDetail>>;
};

// In-memory cache for subfund details with TTL to minimize repeated network calls
const subfundDetailCache =
  globalForKnf.knfSubfundDetailCache ?? new Map<number, CacheEntry<KNFSubfundDetail>>();
if (!globalForKnf.knfSubfundDetailCache) {
  globalForKnf.knfSubfundDetailCache = subfundDetailCache;
}

// Active runtime registry of classifications, KIDs and valuations
const runtimeClassifications =
  globalForKnf.knfRuntimeClassifications ?? new Map<number, RuntimeSubfundMeta>();
if (!globalForKnf.knfRuntimeClassifications) {
  globalForKnf.knfRuntimeClassifications = runtimeClassifications;
}

// Ensure classifications and metrics are populated on initialization and hot-reloads
function ensureClassificationsPopulated() {
  // Prepopulate from static classifications JSON
  if (subfundsClassifications && typeof subfundsClassifications === "object") {
    for (const [idStr, meta] of Object.entries(
      subfundsClassifications as Record<string, { c: string; cat: string; fn: string }>
    )) {
      const id = parseInt(idStr, 10);
      if (!isNaN(id)) {
        const existing = runtimeClassifications.get(id);
        if (!existing || !existing.classification) {
          runtimeClassifications.set(id, {
            ...existing,
            classification: existing?.classification || meta.c,
            category: existing?.category || meta.cat,
            fullName: existing?.fullName || meta.fn,
          });
        }
      }
    }
  }

  // Prepopulate standalone funds (e.g. Beta ETF, PZU ETF)
  if (Array.isArray(standaloneFundsData)) {
    for (const sf of standaloneFundsData as unknown as KNFSubfund[]) {
      if (sf.subfundId) {
        const existing = runtimeClassifications.get(sf.subfundId);
        if (!existing || !existing.name) {
          runtimeClassifications.set(sf.subfundId, {
            ...existing,
            classification: existing?.classification || sf.classification || "",
            category: existing?.category || sf.category || "",
            fullName: existing?.fullName || sf.fullName || sf.name || "",
            name: existing?.name || sf.name,
            type: existing?.type || sf.type,
            isActive: existing?.isActive ?? sf.isActive,
            isLiquidating: existing?.isLiquidating ?? sf.isLiquidating,
          });
        }
      }
    }
  }

  // Prepopulate return rates, valuations, fee, and risk from baseline metrics snapshot
  if (subfundsMetrics && typeof subfundsMetrics === "object") {
    for (const [idStr, m] of Object.entries(
      subfundsMetrics as Record<
        string,
        {
          r1m: number | null;
          r3m: number | null;
          r1y: number | null;
          r2y: number | null;
          r2ya: number | null;
          r3y?: number | null;
          r3ya?: number | null;
          rytd: number | null;
          v: number | null;
          vd: string | null;
          fee?: number | null;
          risk?: number | null;
          tc?: number | null;
          a?: number | null;
          ad?: string | null;
          cur?: string | null;
        }
      >
    )) {
      const id = parseInt(idStr, 10);
      if (!isNaN(id)) {
        const existing = runtimeClassifications.get(id);
        // If not populated yet with return rates, net assets or fees, merge baseline metrics
        if (
          !existing ||
          existing.returnRate1Y === undefined ||
          existing.netAssets === undefined ||
          existing.transactionCostsRate === undefined ||
          existing.currency === undefined
        ) {
          runtimeClassifications.set(id, {
            ...existing,
            returnRate1M: existing?.returnRate1M !== undefined ? existing.returnRate1M : m.r1m,
            returnRate3M: existing?.returnRate3M !== undefined ? existing.returnRate3M : m.r3m,
            returnRate1Y: existing?.returnRate1Y !== undefined ? existing.returnRate1Y : m.r1y,
            returnRate2Y: existing?.returnRate2Y !== undefined ? existing.returnRate2Y : m.r2y,
            returnRate2YAnn: existing?.returnRate2YAnn !== undefined ? existing.returnRate2YAnn : m.r2ya,
            returnRate3Y: existing?.returnRate3Y !== undefined ? existing.returnRate3Y : (m.r3y ?? null),
            returnRate3YAnn: existing?.returnRate3YAnn !== undefined ? existing.returnRate3YAnn : (m.r3ya ?? null),
            returnRateYTD: existing?.returnRateYTD !== undefined ? existing.returnRateYTD : m.rytd,
            latestValuation: existing?.latestValuation !== undefined ? existing.latestValuation : m.v,
            latestValuationDate: existing?.latestValuationDate !== undefined ? existing.latestValuationDate : m.vd,
            currency: existing?.currency !== undefined ? existing.currency : (m.cur || "PLN"),
            managementFee: existing?.managementFee !== undefined ? existing.managementFee : (m.fee ?? null),
            riskLevel: existing?.riskLevel !== undefined ? existing.riskLevel : (m.risk ?? null),
            transactionCostsRate: existing?.transactionCostsRate !== undefined ? existing.transactionCostsRate : (m.tc ?? null),
            netAssets: existing?.netAssets !== undefined ? existing.netAssets : (m.a ?? null),
            netAssetsDate: existing?.netAssetsDate !== undefined ? existing.netAssetsDate : (m.ad ?? null),
          });
        }
      }
    }
  }
}

// Always ensure classifications and metrics are populated
ensureClassificationsPopulated();

/**
 * Updates or enriches a subfund in the global runtime registry with fresh live data.
 */
export function updateRuntimeSubfund(
  subfundId: number,
  data: Partial<RuntimeSubfundMeta>
): void {
  const existing = runtimeClassifications.get(subfundId);
  const updated: RuntimeSubfundMeta = {
    classification: data.classification !== undefined ? data.classification : existing?.classification || "",
    category: data.category !== undefined ? data.category : existing?.category || "",
    fullName: data.fullName || existing?.fullName || data.name || existing?.name || "",
    name: data.name || existing?.name,
    type: data.type || existing?.type,
    isActive: data.isActive !== undefined ? data.isActive : existing?.isActive,
    isLiquidating: data.isLiquidating !== undefined ? data.isLiquidating : existing?.isLiquidating,
    liquidationStartDate:
      data.liquidationStartDate !== undefined ? data.liquidationStartDate : existing?.liquidationStartDate,
    liquidationEndDate:
      data.liquidationEndDate !== undefined ? data.liquidationEndDate : existing?.liquidationEndDate,
    riskLevel: data.riskLevel !== undefined ? data.riskLevel : existing?.riskLevel,
    managementFee: data.managementFee !== undefined ? data.managementFee : existing?.managementFee,
    transactionCostsRate:
      data.transactionCostsRate !== undefined ? data.transactionCostsRate : existing?.transactionCostsRate,
    netAssets: data.netAssets !== undefined ? data.netAssets : existing?.netAssets,
    netAssetsDate: data.netAssetsDate !== undefined ? data.netAssetsDate : existing?.netAssetsDate,
    benchmark: data.benchmark !== undefined ? data.benchmark : existing?.benchmark,
    latestValuation: data.latestValuation !== undefined ? data.latestValuation : existing?.latestValuation,
    latestValuationDate:
      data.latestValuationDate !== undefined ? data.latestValuationDate : existing?.latestValuationDate,
    currency: data.currency !== undefined ? data.currency : existing?.currency || "PLN",
    returnRate1M: data.returnRate1M !== undefined ? data.returnRate1M : existing?.returnRate1M,
    returnRate3M: data.returnRate3M !== undefined ? data.returnRate3M : existing?.returnRate3M,
    returnRate1Y: data.returnRate1Y !== undefined ? data.returnRate1Y : existing?.returnRate1Y,
    returnRate2Y: data.returnRate2Y !== undefined ? data.returnRate2Y : existing?.returnRate2Y,
    returnRate2YAnn: data.returnRate2YAnn !== undefined ? data.returnRate2YAnn : existing?.returnRate2YAnn,
    returnRate3Y: data.returnRate3Y !== undefined ? data.returnRate3Y : existing?.returnRate3Y,
    returnRate3YAnn: data.returnRate3YAnn !== undefined ? data.returnRate3YAnn : existing?.returnRate3YAnn,
    returnRateYTD: data.returnRateYTD !== undefined ? data.returnRateYTD : existing?.returnRateYTD,
    lastUpdated: Date.now(),
  };
  runtimeClassifications.set(subfundId, updated);
}

export function getRuntimeSubfund(subfundId: number): RuntimeSubfundMeta | undefined {
  return runtimeClassifications.get(subfundId);
}

export interface CalculatedReturnRates {
  returnRate1M: number | null;
  returnRate3M: number | null;
  returnRate1Y: number | null;
  returnRate2Y: number | null;
  returnRate2YAnn: number | null;
  returnRate3Y: number | null;
  returnRate3YAnn: number | null;
  returnRateYTD: number | null;
}

/**
 * Calculates standard return rates from a list of valuations sorted by date descending.
 */
export function calculateReturnRates(valuations: KNFValuation[]): CalculatedReturnRates {
  if (!valuations || valuations.length < 2) {
    return {
      returnRate1M: null,
      returnRate3M: null,
      returnRate1Y: null,
      returnRate2Y: null,
      returnRate2YAnn: null,
      returnRate3Y: null,
      returnRate3YAnn: null,
      returnRateYTD: null,
    };
  }

  const latest = valuations[0];
  const latestDate = new Date(latest.date);
  const latestVal = latest.valuation;

  if (!latestVal || latestVal <= 0 || isNaN(latestDate.getTime())) {
    return {
      returnRate1M: null,
      returnRate3M: null,
      returnRate1Y: null,
      returnRate2Y: null,
      returnRate2YAnn: null,
      returnRate3Y: null,
      returnRate3YAnn: null,
      returnRateYTD: null,
    };
  }

  // Find closest past valuation on or before target date within margin
  const findPastValuation = (targetDate: Date, maxMarginDays: number): number | null => {
    const targetTime = targetDate.getTime();
    for (const v of valuations) {
      const vDate = new Date(v.date);
      if (isNaN(vDate.getTime())) continue;
      if (vDate.getTime() <= targetTime) {
        const diffDays = Math.abs((targetTime - vDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= maxMarginDays && v.valuation > 0) {
          return v.valuation;
        }
        return null;
      }
    }
    return null;
  };

  // 1 Month (~30 days, max 20 days margin)
  const d1M = new Date(latestDate);
  d1M.setDate(d1M.getDate() - 30);
  const v1M = findPastValuation(d1M, 20);
  const returnRate1M = v1M ? (latestVal - v1M) / v1M : null;

  // 3 Months (~91 days, max 25 days margin)
  const d3M = new Date(latestDate);
  d3M.setDate(d3M.getDate() - 91);
  const v3M = findPastValuation(d3M, 25);
  const returnRate3M = v3M ? (latestVal - v3M) / v3M : null;

  // 1 Year (~365 days, max 35 days margin)
  const d1Y = new Date(latestDate);
  d1Y.setDate(d1Y.getDate() - 365);
  const v1Y = findPastValuation(d1Y, 35);
  const returnRate1Y = v1Y ? (latestVal - v1Y) / v1Y : null;

  // 2 Years (~730 days, max 45 days margin)
  const d2Y = new Date(latestDate);
  d2Y.setDate(d2Y.getDate() - 730);
  const v2Y = findPastValuation(d2Y, 45);
  const returnRate2Y = v2Y ? (latestVal - v2Y) / v2Y : null;

  // Annualized CAGR for 2 years: (1 + R)^(1/2) - 1
  let returnRate2YAnn: number | null = null;
  if (returnRate2Y !== null) {
    const totalGrowth = 1 + returnRate2Y;
    if (totalGrowth > 0) {
      returnRate2YAnn = Math.sqrt(totalGrowth) - 1;
    }
  }

  // 3 Years (~1095 days, max 50 days margin)
  const d3Y = new Date(latestDate);
  d3Y.setDate(d3Y.getDate() - 1095);
  const v3Y = findPastValuation(d3Y, 50);
  const returnRate3Y = v3Y ? (latestVal - v3Y) / v3Y : null;

  // Annualized CAGR for 3 years: (1 + R)^(1/3) - 1
  let returnRate3YAnn: number | null = null;
  if (returnRate3Y !== null) {
    const totalGrowth = 1 + returnRate3Y;
    if (totalGrowth > 0) {
      returnRate3YAnn = Math.pow(totalGrowth, 1 / 3) - 1;
    }
  }

  // YTD (since Jan 1 of current valuation year, max 20 days margin)
  const dYTD = new Date(latestDate.getFullYear(), 0, 1);
  const vYTD = findPastValuation(dYTD, 20);
  const returnRateYTD = vYTD ? (latestVal - vYTD) / vYTD : null;

  return {
    returnRate1M,
    returnRate3M,
    returnRate1Y,
    returnRate2Y,
    returnRate2YAnn,
    returnRate3Y,
    returnRate3YAnn,
    returnRateYTD,
  };
}

export function inferClassificationFromName(name: string): { classification: string; category: string } {
  const n = (name || "").toLowerCase();
  if (n.includes("ppk") || n.includes("zdefiniowanej daty") || n.includes("emerytur")) {
    return {
      classification: "PPK",
      category: "zdefiniowanej daty (PPK)",
    };
  }
  if (
    n.includes("akcj") ||
    n.includes("equity") ||
    n.includes("spółek") ||
    n.includes("wzrost") ||
    n.includes("indeks") ||
    n.includes("tech")
  ) {
    return {
      classification: "akcji",
      category: n.includes("zagranic") || n.includes("global") ? "akcji zagranicznych" : "akcji polskich",
    };
  }
  if (
    n.includes("obligac") ||
    n.includes("dłużn") ||
    n.includes("skarb") ||
    n.includes("papierów") ||
    n.includes("rentier") ||
    n.includes("konserwatywn") ||
    n.includes("bond")
  ) {
    return {
      classification: "dłużne",
      category: n.includes("skarb") ? "obligacji skarbowych" : "obligacji uniwersalne",
    };
  }
  if (
    n.includes("mieszan") ||
    n.includes("zrównoważ") ||
    n.includes("stabilnego") ||
    n.includes("alokacji") ||
    n.includes("dynamicz")
  ) {
    return {
      classification: "mieszane",
      category: "mieszane aktywnej alokacji",
    };
  }
  if (n.includes("surowc") || n.includes("złot") || n.includes("gold") || n.includes("commodity")) {
    return {
      classification: "rynku surowców",
      category: "rynku surowców",
    };
  }
  if (n.includes("pienięż") || n.includes("gotówk") || n.includes("lokacyj") || n.includes("płynności")) {
    return {
      classification: "rynku pieniężnego",
      category: "rynku pieniężnego",
    };
  }
  return {
    classification: "alternatywne",
    category: "aktywów niepublicznych",
  };
}

/**
 * Universal fetch wrapper for KNF API with cache and error handling
 */
async function knfFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  options: FetchOptions = {}
): Promise<T | null> {
  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  try {
    const fetchInit: RequestInit = {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    };

    if (options.revalidate !== undefined) {
      fetchInit.next = { revalidate: options.revalidate };
    } else {
      fetchInit.next = { revalidate: DEFAULT_REVALIDATE };
    }

    const response = await fetch(url.toString(), fetchInit);

    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn(`[KNF API] Error ${response.status} for ${url.pathname}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[KNF API] Network or parsing error for ${url.pathname}:`, error);
    return null;
  }
}

export const knfApi = {
  // ==========================================
  // Towarzystwa (Companies / TFI)
  // ==========================================
  async getCompanies(params?: {
    includeInactive?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
    asOf?: string;
  }): Promise<KNFListResponse<KNFCompany>> {
    const res = await knfFetch<KNFListResponse<KNFCompany>>("/v1/companies", {
      includeInactive: params?.includeInactive,
      search: params?.search,
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      sort: params?.sort ?? "name,asc",
      asOf: params?.asOf,
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  async getCompany(companyId: number, asOf?: string): Promise<KNFCompanyDetail | null> {
    return knfFetch<KNFCompanyDetail>(`/v1/companies/${companyId}`, { asOf });
  },

  async getCompanyHistory(companyId: number): Promise<KNFHistoryItem<KNFCompanyDetail>[]> {
    const res = await knfFetch<KNFListResponse<KNFHistoryItem<KNFCompanyDetail>>>(
      `/v1/companies/${companyId}/history`,
      { size: 50 }
    );
    return res?.content || [];
  },

  // ==========================================
  // Fundusze (Funds)
  // ==========================================
  async getFunds(params?: {
    companyId?: number;
    includeInactive?: boolean;
    includeLiquidating?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
    asOf?: string;
  }): Promise<KNFListResponse<KNFFund>> {
    const res = await knfFetch<KNFListResponse<KNFFund>>("/v1/funds", {
      companyId: params?.companyId,
      includeInactive: params?.includeInactive,
      includeLiquidating: params?.includeLiquidating,
      search: params?.search,
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      sort: params?.sort ?? "name,asc",
      asOf: params?.asOf,
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  async getFund(fundId: number, asOf?: string): Promise<KNFFundDetail | null> {
    return knfFetch<KNFFundDetail>(`/v1/funds/${fundId}`, { asOf });
  },

  async getFundHistory(fundId: number): Promise<KNFHistoryItem<KNFFundDetail>[]> {
    const res = await knfFetch<KNFListResponse<KNFHistoryItem<KNFFundDetail>>>(
      `/v1/funds/${fundId}/history`,
      { size: 50 }
    );
    return res?.content || [];
  },

  // ==========================================
  // Subfundusze (Subfunds)
  // ==========================================
  async getSubfunds(params?: {
    fundId?: number;
    fundType?: string;
    includeInactive?: boolean;
    includeLiquidating?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
    asOf?: string;
  }): Promise<KNFListResponse<KNFSubfund>> {
    const res = await knfFetch<KNFListResponse<KNFSubfund>>("/v1/subfunds", {
      fundId: params?.fundId,
      fundType: params?.fundType,
      includeInactive: params?.includeInactive,
      includeLiquidating: params?.includeLiquidating,
      search: params?.search,
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      sort: params?.sort ?? "name,asc",
      asOf: params?.asOf,
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  async getSubfund(subfundId: number, asOf?: string, forceFresh?: boolean): Promise<KNFSubfundDetail | null> {
    const cached = subfundDetailCache.get(subfundId);
    if (!asOf && !forceFresh && cached && Date.now() - cached.timestamp < DEFAULT_REVALIDATE * 1000) {
      return cached.data;
    }
    const detail = await knfFetch<KNFSubfundDetail>(`/v1/subfunds/${subfundId}`, { asOf });
    if (detail && !asOf) {
      subfundDetailCache.set(subfundId, { data: detail, timestamp: Date.now() });
    }
    return detail;
  },

  async getSubfundHistory(subfundId: number): Promise<KNFHistoryItem<KNFSubfundDetail>[]> {
    const res = await knfFetch<KNFListResponse<KNFHistoryItem<KNFSubfundDetail>>>(
      `/v1/subfunds/${subfundId}/history`,
      { size: 50 }
    );
    return res?.content || [];
  },

  // ==========================================
  // Dokumenty KID (Key Information Document)
  // ==========================================
  async getKeyInformation(params?: {
    subfundId?: number;
    fundId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<KNFListResponse<KNFKeyInformationDoc>> {
    const res = await knfFetch<KNFListResponse<KNFKeyInformationDoc>>("/v1/key-information", {
      subfundId: params?.subfundId,
      fundId: params?.fundId,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? "publicationDate,desc",
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  async getKeyInformationDetail(documentUuid: string): Promise<KNFKeyInformationDetail | null> {
    return knfFetch<KNFKeyInformationDetail>(`/v1/key-information/${documentUuid}`);
  },

  async getLatestKidForSubfund(subfundId: number): Promise<KNFKeyInformationDetail | null> {
    const list = await this.getKeyInformation({ subfundId, size: 1 });
    if (!list.content || list.content.length === 0) return null;
    return this.getKeyInformationDetail(list.content[0].documentUuid);
  },

  // ==========================================
  // Wyceny (Valuations)
  // ==========================================
  async getValuations(params: {
    subfundId?: number;
    fundId?: number;
    date?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<KNFListResponse<KNFValuation>> {
    const res = await knfFetch<KNFListResponse<KNFValuation>>("/v1/valuations", {
      subfundId: params.subfundId,
      fundId: params.fundId,
      date: params.date,
      page: params.page ?? 0,
      size: params.size ?? 50,
      sort: params.sort ?? "date,desc",
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  // ==========================================
  // Aktywa (Assets)
  // ==========================================
  async getAssets(params: {
    subfundId?: number;
    fundId?: number;
    date?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<KNFListResponse<KNFAsset>> {
    const res = await knfFetch<KNFListResponse<KNFAsset>>("/v1/assets", {
      subfundId: params.subfundId,
      fundId: params.fundId,
      date: params.date,
      page: params.page ?? 0,
      size: params.size ?? 30,
      sort: params.sort ?? "date,desc",
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  async getTotalAssets(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<KNFListResponse<KNFTotalAsset>> {
    const res = await knfFetch<KNFListResponse<KNFTotalAsset>>("/v1/total-assets", {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? "date,desc",
    });
    return res || { content: [], page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  },

  // ==========================================
  // Statystyki całego rynku
  // ==========================================
  async getMarketStats(): Promise<MarketStatistics> {
    const [totalAssetsRes, activeFundsRes, allFundsRes, activeSubfundsRes, allSubfundsRes, companiesRes] =
      await Promise.all([
        this.getTotalAssets({ size: 12, sort: "date,desc" }),
        this.getFunds({ size: 1, includeInactive: false, includeLiquidating: false }),
        this.getFunds({ size: 1, includeInactive: true, includeLiquidating: true }),
        this.getSubfunds({ size: 1, includeInactive: false, includeLiquidating: false }),
        this.getSubfunds({ size: 1, includeInactive: true, includeLiquidating: true }),
        this.getCompanies({ size: 1, includeInactive: false }), // Only currently active TFI (54)
      ]);

    const latestMarketAsset = totalAssetsRes.content[0];
    const assetsHistory = [...(totalAssetsRes.content || [])].reverse();

    const totalFundsCount = allFundsRes.page.totalElements || 0;
    const activeFundsCount = activeFundsRes.page.totalElements || 0;
    const totalSubfundsCount = allSubfundsRes.page.totalElements || 0;
    const activeSubfundsCount = activeSubfundsRes.page.totalElements || 0;
    // Exactly 688 products with available valuations in KNF API (635 subfunds + 53 standalone funds)
    const investableProductsCount =
      activeSubfundsCount - UNQUOTED_SUBFUND_IDS.size + (standaloneFundsData?.length || 53);

    return {
      totalAssetsGross: latestMarketAsset?.assets || 0,
      totalAssetsNet: latestMarketAsset?.netAssets || 0,
      statsDate: latestMarketAsset?.date || new Date().toISOString().split("T")[0],
      totalFundsCount,
      activeFundsCount,
      liquidatingFundsCount: totalFundsCount - activeFundsCount,
      totalSubfundsCount,
      activeSubfundsCount,
      investableProductsCount,
      companiesCount: companiesRes.page.totalElements || 0,
      assetsHistory,
    };
  },

  // ==========================================
  // Pełny profil subfunduszu / funduszu (dla strony detalu)
  // ==========================================
  async getSubfundFullProfile(subfundId: number): Promise<SubfundFullProfile | null> {
    const subfund = await this.getSubfund(subfundId, undefined, true);
    if (!subfund) {
      // Check if subfundId corresponds to a standalone fund (without segregated subfunds, e.g. ETF)
      const fund = await this.getFund(subfundId);
      if (!fund) return null;

      const [history, latestKidRes, valuationsRes, assetsRes] = await Promise.all([
        this.getFundHistory(subfundId),
        this.getKeyInformation({ fundId: subfundId, size: 1 }),
        this.getValuations({ fundId: subfundId, size: 250, sort: "date,desc" }),
        this.getAssets({ fundId: subfundId, size: 50, sort: "date,desc" }),
      ]);

      let latestKid: KNFKeyInformationDetail | null = null;
      if (latestKidRes.content?.[0]) {
        latestKid = await this.getKeyInformationDetail(latestKidRes.content[0].documentUuid);
      }

      let company: KNFCompanyDetail | null = null;
      if (fund.companyId) {
        company = await this.getCompany(fund.companyId);
      }

      const valList = valuationsRes.content || [];
      const latestVal = valList[0];
      const returnRates = calculateReturnRates(valList);

      // Self-healing: refresh all runtime data from live UKNF response
      updateRuntimeSubfund(subfundId, {
        name: fund.name,
        fullName: fund.fullName || fund.name,
        classification: fund.classification || undefined,
        category: fund.category || undefined,
        type: fund.type,
        isActive: fund.isActive,
        isLiquidating: fund.isLiquidating,
        liquidationStartDate: fund.liquidationStartDate,
        liquidationEndDate: fund.liquidationEndDate,
        riskLevel: latestKid?.riskLevel ?? null,
        managementFee: latestKid?.managementAndOtherFeesRate ?? null,
        transactionCostsRate: latestKid?.transactionCostsRate ?? null,
        benchmark: latestKid?.benchmark ?? null,
        latestValuation: latestVal?.valuation ?? null,
        latestValuationDate: latestVal?.date ?? null,
        netAssets: assetsRes.content?.[0]?.netAssets ?? null,
        netAssetsDate: assetsRes.content?.[0]?.date ?? null,
        currency: latestVal?.currency || assetsRes.content?.[0]?.currency || latestKid?.currency || undefined,
        ...returnRates,
      });

      const syntheticSubfund: KNFSubfundDetail = {
        subfundId: fund.fundId,
        fundId: fund.fundId,
        nationalCode: fund.nationalCode,
        name: fund.name,
        fullName: fund.fullName || fund.name,
        type: fund.type,
        classification: fund.classification,
        category: fund.category,
        liquidationStartDate: fund.liquidationStartDate,
        liquidationEndDate: fund.liquidationEndDate,
        isLiquidating: fund.isLiquidating,
        fromDate: fund.fromDate,
        toDate: fund.toDate,
        isActive: fund.isActive,
      };

      const mappedHistory: KNFHistoryItem<KNFSubfundDetail>[] = history.map((h) => ({
        historyId: h.historyId,
        validFrom: h.validFrom,
        validTo: h.validTo,
        data: {
          subfundId: h.data.fundId,
          fundId: h.data.fundId,
          nationalCode: h.data.nationalCode,
          name: h.data.name,
          fullName: h.data.fullName || h.data.name,
          type: h.data.type,
          classification: h.data.classification,
          category: h.data.category,
          liquidationStartDate: h.data.liquidationStartDate,
          liquidationEndDate: h.data.liquidationEndDate,
          isLiquidating: h.data.isLiquidating,
          fromDate: h.data.fromDate,
          toDate: h.data.toDate,
          isActive: h.data.isActive,
        },
      }));

      return {
        subfund: syntheticSubfund,
        fund,
        company,
        latestKid,
        valuations: valuationsRes.content || [],
        assets: assetsRes.content || [],
        history: mappedHistory,
      };
    }

    const [fund, history, latestKid, valuationsRes, assetsRes] = await Promise.all([
      subfund.fundId ? this.getFund(subfund.fundId) : Promise.resolve(null),
      this.getSubfundHistory(subfundId),
      this.getLatestKidForSubfund(subfundId),
      this.getValuations({ subfundId, size: 250, sort: "date,desc" }),
      this.getAssets({ subfundId, size: 50, sort: "date,desc" }),
    ]);

    let company: KNFCompanyDetail | null = null;
    if (fund?.companyId) {
      company = await this.getCompany(fund.companyId);
    }

    const valList = valuationsRes.content || [];
    const latestVal = valList[0];
    const returnRates = calculateReturnRates(valList);

    // Self-healing: refresh all runtime data from live UKNF response
    updateRuntimeSubfund(subfundId, {
      name: subfund.name,
      fullName: subfund.fullName || subfund.name,
      classification: subfund.classification || undefined,
      category: subfund.category || undefined,
      type: subfund.type,
      isActive: subfund.isActive,
      isLiquidating: subfund.isLiquidating,
      liquidationStartDate: subfund.liquidationStartDate,
      liquidationEndDate: subfund.liquidationEndDate,
      riskLevel: latestKid?.riskLevel ?? null,
      managementFee: latestKid?.managementAndOtherFeesRate ?? null,
      transactionCostsRate: latestKid?.transactionCostsRate ?? null,
      benchmark: latestKid?.benchmark ?? null,
      latestValuation: latestVal?.valuation ?? null,
      latestValuationDate: latestVal?.date ?? null,
      netAssets: assetsRes.content?.[0]?.netAssets ?? null,
      netAssetsDate: assetsRes.content?.[0]?.date ?? null,
      currency: latestVal?.currency || assetsRes.content?.[0]?.currency || latestKid?.currency || undefined,
      ...returnRates,
    });

    return {
      subfund,
      fund,
      company,
      latestKid,
      valuations: valuationsRes.content || [],
      assets: assetsRes.content || [],
      history: history || [],
    };
  },

  // ==========================================
  // Wzbogacone subfundusze dla katalogu z pełną klasyfikacją
  // ==========================================
  async getEnrichedSubfunds(params?: {
    fundId?: number;
    fundType?: string;
    fundTypes?: string[];
    classification?: string;
    classifications?: string[];
    category?: string;
    categories?: string[];
    includeInactive?: boolean;
    includeLiquidating?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ items: SubfundCardModel[]; page: KNFListResponse<KNFSubfund>["page"] }> {
    const pageSize = params?.size ?? 24;
    const currentPage = params?.page ?? 0;

    // Normalize classifications array
    const activeClassifications: string[] = [];
    if (params?.classifications && params.classifications.length > 0) {
      activeClassifications.push(...params.classifications.filter((c) => c && c !== "ALL"));
    } else if (params?.classification && params.classification !== "ALL") {
      activeClassifications.push(params.classification);
    }

    // Normalize fundTypes array
    const activeFundTypes: string[] = [];
    if (params?.fundTypes && params.fundTypes.length > 0) {
      activeFundTypes.push(...params.fundTypes.filter((t) => t && t !== "ALL"));
    } else if (params?.fundType && params.fundType !== "ALL") {
      activeFundTypes.push(params.fundType);
    }

    // Fetch the list of subfunds (up to 2000 so we cover all)
    const listRes = await this.getSubfunds({
      fundId: params?.fundId,
      fundType: activeFundTypes.length === 1 ? activeFundTypes[0] : undefined,
      includeInactive: params?.includeInactive,
      includeLiquidating: params?.includeLiquidating,
      page: 0,
      size: 2000,
      sort: params?.sort?.startsWith("name") ? params.sort : "name,asc",
    });

    let subfundSource = listRes.content;
    // Fallback to static snapshot if KNF API returned 0 items (e.g. offline, rate limited, DNS error)
    if (subfundSource.length === 0 && subfundsClassifications && typeof subfundsClassifications === "object") {
      subfundSource = Object.entries(
        subfundsClassifications as Record<string, { c: string; cat: string; fn: string; n?: string; t?: string }>
      ).map(([idStr, meta]) => {
        const id = parseInt(idStr, 10);
        const runtime = runtimeClassifications.get(id);
        const derivedName = meta.fn.replace(/^Subfundusz\s+/i, "");
        return {
          subfundId: id,
          fundId: 0,
          name: runtime?.name || derivedName,
          fullName: runtime?.fullName || meta.fn,
          classification: runtime?.classification || meta.c,
          category: runtime?.category || meta.cat,
          type: runtime?.type || meta.t || "FIO",
          isActive: runtime?.isActive ?? true,
          isLiquidating: runtime?.isLiquidating ?? false,
          nationalCode: "",
          startDate: null,
          liquidationStartDate: null,
          liquidationEndDate: null,
          lastValuationDate: null,
        } as unknown as KNFSubfund;
      });
    }

    // Exclude subfunds with no public valuations in API
    const validSubfunds = subfundSource.filter((sf) => !UNQUOTED_SUBFUND_IDS.has(sf.subfundId));

    // Prepare standalone funds if general query (no specific umbrella fundId specified)
    let standalonePool: KNFSubfund[] = [];
    if (!params?.fundId && Array.isArray(standaloneFundsData)) {
      standalonePool = (standaloneFundsData as unknown as KNFSubfund[]).filter(
        (sf) => sf.subfundId && !UNQUOTED_SUBFUND_IDS.has(sf.subfundId)
      );
    }

    const combinedPool = [...validSubfunds, ...standalonePool];

    let filtered = combinedPool.map((sf) => {
      const meta = runtimeClassifications.get(sf.subfundId);
      const fallback = inferClassificationFromName(sf.name);
      return {
        ...sf,
        classification: sf.classification || meta?.classification || fallback.classification,
        category: sf.category || meta?.category || fallback.category,
        fullName: sf.fullName || meta?.fullName || sf.name,
        riskLevel: meta?.riskLevel ?? null,
        managementFee: meta?.managementFee ?? null,
        transactionCostsRate: meta?.transactionCostsRate ?? null,
        netAssets: meta?.netAssets ?? null,
        netAssetsDate: meta?.netAssetsDate ?? null,
        latestValuation: meta?.latestValuation ?? null,
        latestValuationDate: meta?.latestValuationDate ?? null,
        currency: meta?.currency || sf.currency || "PLN",
        returnRate1M: meta?.returnRate1M ?? null,
        returnRate3M: meta?.returnRate3M ?? null,
        returnRate1Y: meta?.returnRate1Y ?? null,
        returnRate2Y: meta?.returnRate2Y ?? null,
        returnRate2YAnn: meta?.returnRate2YAnn ?? null,
        returnRate3Y: meta?.returnRate3Y ?? null,
        returnRate3YAnn: meta?.returnRate3YAnn ?? null,
        returnRateYTD: meta?.returnRateYTD ?? null,
      };
    });

    // Filter by search terms across name, fullName, nationalCode, classification, category, type
    if (params?.search && params.search.trim()) {
      const searchTerms = params.search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((sf) => {
        const haystack = [
          sf.name,
          sf.fullName,
          sf.nationalCode,
          sf.classification,
          sf.category,
          sf.type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchTerms.every((term) => haystack.includes(term));
      });
    }

    // Filter by multiple fund types if selected
    if (activeFundTypes.length > 0) {
      filtered = filtered.filter((sf) => {
        return activeFundTypes.some((selectedType) => {
          if (selectedType === "ETF") {
            return sf.type === "ETF" || (sf.name || "").toUpperCase().includes("ETF");
          }
          return sf.type === selectedType;
        });
      });
    }

    // Filter by multiple classifications if selected
    if (activeClassifications.length > 0) {
      filtered = filtered.filter((sf) => {
        const cls = (sf.classification || "").toLowerCase();
        const cat = (sf.category || "").toLowerCase();
        const name = (sf.name || "").toLowerCase();

        return activeClassifications.some((classFilter) => {
          if (classFilter === "akcji") {
            return cls.includes("akcj") || cat.includes("akcj") || name.includes("akcj") || name.includes("equity");
          }
          if (classFilter === "dłużn") {
            return (
              cls.includes("dłużn") ||
              cat.includes("dłużn") ||
              cat.includes("skarb") ||
              cat.includes("obligac") ||
              name.includes("obligac") ||
              name.includes("dłużn")
            );
          }
          if (classFilter === "mieszan") {
            return (
              cls.includes("mieszan") ||
              cat.includes("mieszan") ||
              name.includes("mieszan") ||
              name.includes("zrównoważ")
            );
          }
          if (classFilter === "PPK") {
            return (
              cls.toUpperCase().includes("PPK") ||
              cat.toUpperCase().includes("PPK") ||
              name.toUpperCase().includes("PPK")
            );
          }
          if (classFilter === "alternatyw") {
            return (
              cls.includes("alternatyw") ||
              cls.includes("surowc") ||
              cls.includes("absolut") ||
              cat.includes("surowc") ||
              cat.includes("alternatyw") ||
              name.includes("surowc") ||
              name.includes("złot")
            );
          }
          return cls.includes(classFilter.toLowerCase()) || cat.includes(classFilter.toLowerCase());
        });
      });
    }

    // Filter by specific category/categories if provided
    const activeCategories = (
      params?.categories && params.categories.length > 0
        ? params.categories
        : params?.category && params.category !== "ALL"
        ? [params.category]
        : []
    )
      .filter((c) => c && c !== "ALL")
      .map((c) => c.toLowerCase().replace(/\s+/g, " ").trim());

    if (activeCategories.length > 0) {
      filtered = filtered.filter((sf) => {
        const cat = (sf.category || "").toLowerCase().replace(/\s+/g, " ").trim();
        return activeCategories.some(
          (targetCat) => cat.includes(targetCat) || targetCat.includes(cat)
        );
      });
    }

    // Handle sort if name,desc / return rates
    if (params?.sort === "name,desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name, "pl"));
    } else if (params?.sort === "name,asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    } else if (params?.sort === "return1M,desc") {
      filtered.sort((a, b) => (b.returnRate1M ?? -9999) - (a.returnRate1M ?? -9999));
    } else if (params?.sort === "return1M,asc") {
      filtered.sort((a, b) => (a.returnRate1M ?? 9999) - (b.returnRate1M ?? 9999));
    } else if (params?.sort === "return3M,desc") {
      filtered.sort((a, b) => (b.returnRate3M ?? -9999) - (a.returnRate3M ?? -9999));
    } else if (params?.sort === "return3M,asc") {
      filtered.sort((a, b) => (a.returnRate3M ?? 9999) - (b.returnRate3M ?? 9999));
    } else if (params?.sort === "return1Y,desc") {
      filtered.sort((a, b) => (b.returnRate1Y ?? -9999) - (a.returnRate1Y ?? -9999));
    } else if (params?.sort === "return1Y,asc") {
      filtered.sort((a, b) => (a.returnRate1Y ?? 9999) - (b.returnRate1Y ?? 9999));
    } else if (params?.sort === "return2Y,desc") {
      filtered.sort((a, b) => (b.returnRate2Y ?? -9999) - (a.returnRate2Y ?? -9999));
    } else if (params?.sort === "return2Y,asc") {
      filtered.sort((a, b) => (a.returnRate2Y ?? 9999) - (b.returnRate2Y ?? 9999));
    } else if (params?.sort === "return3Y,desc") {
      filtered.sort((a, b) => (b.returnRate3Y ?? -9999) - (a.returnRate3Y ?? -9999));
    } else if (params?.sort === "return3Y,asc") {
      filtered.sort((a, b) => (a.returnRate3Y ?? 9999) - (b.returnRate3Y ?? 9999));
    } else if (params?.sort === "returnYTD,desc") {
      filtered.sort((a, b) => (b.returnRateYTD ?? -9999) - (a.returnRateYTD ?? -9999));
    } else if (params?.sort === "returnYTD,asc") {
      filtered.sort((a, b) => (a.returnRateYTD ?? 9999) - (b.returnRateYTD ?? 9999));
    } else if (params?.sort === "fee,asc") {
      filtered.sort((a, b) => (a.managementFee ?? 999) - (b.managementFee ?? 999));
    } else if (params?.sort === "fee,desc") {
      filtered.sort((a, b) => (b.managementFee ?? -1) - (a.managementFee ?? -1));
    } else if (params?.sort === "risk,asc") {
      filtered.sort((a, b) => (a.riskLevel ?? 999) - (b.riskLevel ?? 999));
    } else if (params?.sort === "risk,desc") {
      filtered.sort((a, b) => (b.riskLevel ?? -1) - (a.riskLevel ?? -1));
    } else if (params?.sort === "valuation,asc") {
      filtered.sort((a, b) => (a.latestValuation ?? 9999999) - (b.latestValuation ?? 9999999));
    } else if (params?.sort === "valuation,desc") {
      filtered.sort((a, b) => (b.latestValuation ?? -1) - (a.latestValuation ?? -1));
    } else if (params?.sort === "assets,asc") {
      filtered.sort((a, b) => (a.netAssets ?? 9999999999999) - (b.netAssets ?? 9999999999999));
    } else if (params?.sort === "assets,desc") {
      filtered.sort((a, b) => (b.netAssets ?? -1) - (a.netAssets ?? -1));
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startIndex = currentPage * pageSize;
    const subfundsToEnrich = filtered.slice(startIndex, startIndex + pageSize);

    // Enrich batch with full details, KID and latest valuation
    const enrichedItems: SubfundCardModel[] = await Promise.all(
      subfundsToEnrich.map(async (sf) => {
        try {
          if (sf.isFundOnly) {
            // Standalone fund without segregated subfunds (e.g. Beta ETF, PZU ETF, standalone FIO/SFIO)
            const [fundDetail, kidRes, valuationsRes] = await Promise.all([
              this.getFund(sf.fundId),
              this.getKeyInformation({ fundId: sf.fundId, size: 1 }),
              this.getValuations({ fundId: sf.fundId, size: 780 }),
            ]);

            let kidDetail: KNFKeyInformationDetail | null = null;
            if (kidRes.content?.[0]) {
              kidDetail = await this.getKeyInformationDetail(kidRes.content[0].documentUuid);
            }

            const valList = valuationsRes.content || [];
            const latestVal = valList[0];
            const returnRates = calculateReturnRates(valList);

            const cardItem: SubfundCardModel = {
              ...sf,
              isFundOnly: true,
              classification: fundDetail?.classification || sf.classification,
              category: fundDetail?.category || sf.category,
              fullName: fundDetail?.fullName || sf.fullName || sf.name,
              isActive: fundDetail?.isActive ?? sf.isActive ?? true,
              isLiquidating: fundDetail?.isLiquidating ?? sf.isLiquidating ?? false,
              liquidationStartDate: fundDetail?.liquidationStartDate ?? null,
              liquidationEndDate: fundDetail?.liquidationEndDate ?? null,
              riskLevel: kidDetail?.riskLevel ?? null,
              managementFee: kidDetail?.managementAndOtherFeesRate ?? null,
              transactionCostsRate: kidDetail?.transactionCostsRate ?? sf.transactionCostsRate ?? null,
              netAssets: sf.netAssets ?? null,
              netAssetsDate: sf.netAssetsDate ?? null,
              benchmark: kidDetail?.benchmark ?? null,
              latestValuation: latestVal?.valuation ?? null,
              latestValuationDate: latestVal?.date ?? null,
              ...returnRates,
            };

            updateRuntimeSubfund(sf.subfundId, {
              classification: cardItem.classification,
              category: cardItem.category,
              fullName: cardItem.fullName || cardItem.name,
              name: cardItem.name,
              type: cardItem.type,
              isActive: cardItem.isActive,
              isLiquidating: cardItem.isLiquidating,
              riskLevel: cardItem.riskLevel,
              managementFee: cardItem.managementFee,
              transactionCostsRate: cardItem.transactionCostsRate,
              netAssets: cardItem.netAssets,
              netAssetsDate: cardItem.netAssetsDate,
              benchmark: cardItem.benchmark,
              latestValuation: cardItem.latestValuation,
              latestValuationDate: cardItem.latestValuationDate,
              ...returnRates,
            });

            return cardItem;
          }

          const [details, kid, valuationsRes] = await Promise.all([
            this.getSubfund(sf.subfundId),
            this.getLatestKidForSubfund(sf.subfundId),
            this.getValuations({ subfundId: sf.subfundId, size: 780 }),
          ]);

          const valList = valuationsRes.content || [];
          const latestVal = valList[0];
          const returnRates = calculateReturnRates(valList);

          const cardItem: SubfundCardModel = {
            ...sf,
            classification: details?.classification || sf.classification,
            category: details?.category || sf.category,
            fullName: details?.fullName || sf.fullName || sf.name,
            isActive: details?.isActive ?? sf.isActive,
            isLiquidating: details?.isLiquidating ?? sf.isLiquidating,
            liquidationStartDate: details?.liquidationStartDate ?? sf.liquidationStartDate,
            liquidationEndDate: details?.liquidationEndDate ?? sf.liquidationEndDate,
            riskLevel: kid?.riskLevel ?? null,
            managementFee: kid?.managementAndOtherFeesRate ?? null,
            transactionCostsRate: kid?.transactionCostsRate ?? sf.transactionCostsRate ?? null,
            netAssets: sf.netAssets ?? null,
            netAssetsDate: sf.netAssetsDate ?? null,
            benchmark: kid?.benchmark ?? null,
            latestValuation: latestVal?.valuation ?? null,
            latestValuationDate: latestVal?.date ?? null,
            ...returnRates,
          };

          updateRuntimeSubfund(sf.subfundId, {
            classification: cardItem.classification,
            category: cardItem.category,
            fullName: cardItem.fullName || cardItem.name,
            name: cardItem.name,
            type: cardItem.type,
            isActive: cardItem.isActive,
            isLiquidating: cardItem.isLiquidating,
            riskLevel: cardItem.riskLevel,
            managementFee: cardItem.managementFee,
            transactionCostsRate: cardItem.transactionCostsRate,
            netAssets: cardItem.netAssets,
            netAssetsDate: cardItem.netAssetsDate,
            benchmark: cardItem.benchmark,
            latestValuation: cardItem.latestValuation,
            latestValuationDate: cardItem.latestValuationDate,
            ...returnRates,
          });

          return cardItem;
        } catch {
          return {
            ...sf,
            riskLevel: null,
            managementFee: null,
            transactionCostsRate: null,
            netAssets: null,
            netAssetsDate: null,
            benchmark: null,
            latestValuation: null,
            latestValuationDate: null,
          };
        }
      })
    );

    return {
      items: enrichedItems,
      page: {
        size: pageSize,
        totalElements,
        totalPages,
        number: currentPage,
      },
    };
  },

  // ==========================================
  // Nocna synchronizacja / odświeżanie danych (Cron Sync)
  // ==========================================
  async syncFunds(options?: {
    mode?: "quick" | "full";
    limit?: number;
    delayMs?: number;
  }): Promise<{ updatedCount: number; durationMs: number }> {
    const startTime = Date.now();
    const mode = options?.mode ?? "full";
    const delayMs = options?.delayMs ?? 25;
    const isFull = mode === "full";
    const limit = options?.limit ?? (isFull ? 2000 : 50);

    // 1. Fetch active subfunds list
    const listRes = await this.getSubfunds({
      size: Math.min(limit, 2000),
      includeInactive: false,
      includeLiquidating: false,
      sort: "name,asc",
    });

    const subfundsToSync: Array<KNFSubfund & { isFundOnly?: boolean }> = listRes.content.filter(
      (sf) => !UNQUOTED_SUBFUND_IDS.has(sf.subfundId)
    );

    // In full mode, also include standalone funds (e.g. Beta ETF, PZU ETF)
    if (isFull && Array.isArray(standaloneFundsData)) {
      for (const fund of standaloneFundsData as unknown as Array<KNFSubfund & { isFundOnly?: boolean }>) {
        if (fund.subfundId && !UNQUOTED_SUBFUND_IDS.has(fund.subfundId)) {
          subfundsToSync.push({ ...fund, isFundOnly: true });
        }
      }
    }

    let updatedCount = 0;

    // Process in sequential chunks of 20 concurrent requests
    const chunkSize = 20;
    for (let i = 0; i < subfundsToSync.length; i += chunkSize) {
      const chunk = subfundsToSync.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (sf) => {
          try {
            if (sf.isFundOnly) {
              const [fundDetail, kidRes, valuationsRes, assetsRes] = await Promise.all([
                this.getFund(sf.fundId),
                this.getKeyInformation({ fundId: sf.fundId, size: 1 }),
                this.getValuations({ fundId: sf.fundId, size: 780 }),
                this.getAssets({ fundId: sf.fundId, size: 1, sort: "date,desc" }),
              ]);

              let kidDetail: KNFKeyInformationDetail | null = null;
              if (kidRes.content?.[0]) {
                kidDetail = await this.getKeyInformationDetail(kidRes.content[0].documentUuid);
              }

              const valList = valuationsRes.content || [];
              const latestVal = valList[0];
              const latestAsset = assetsRes?.content?.[0];
              const returnRates = calculateReturnRates(valList);

              updateRuntimeSubfund(sf.subfundId, {
                name: sf.name,
                fullName: fundDetail?.fullName || sf.fullName || sf.name,
                classification: fundDetail?.classification || sf.classification || undefined,
                category: fundDetail?.category || sf.category || undefined,
                type: sf.type,
                isActive: fundDetail?.isActive ?? sf.isActive ?? true,
                isLiquidating: fundDetail?.isLiquidating ?? sf.isLiquidating ?? false,
                liquidationStartDate: fundDetail?.liquidationStartDate ?? null,
                liquidationEndDate: fundDetail?.liquidationEndDate ?? null,
                riskLevel: kidDetail?.riskLevel ?? null,
                managementFee: kidDetail?.managementAndOtherFeesRate ?? null,
                transactionCostsRate: kidDetail?.transactionCostsRate ?? null,
                netAssets: latestAsset?.netAssets ?? null,
                netAssetsDate: latestAsset?.date ?? null,
                benchmark: kidDetail?.benchmark ?? null,
                latestValuation: latestVal?.valuation ?? null,
                latestValuationDate: latestVal?.date ?? null,
                currency: latestVal?.currency || latestAsset?.currency || kidDetail?.currency || "PLN",
                ...returnRates,
              });

              updatedCount++;
              return;
            }

            const [details, kid, valuationsRes, assetsRes] = await Promise.all([
              this.getSubfund(sf.subfundId, undefined, true),
              this.getLatestKidForSubfund(sf.subfundId),
              this.getValuations({ subfundId: sf.subfundId, size: 780 }),
              this.getAssets({ subfundId: sf.subfundId, size: 1, sort: "date,desc" }),
            ]);

            const valList = valuationsRes.content || [];
            const latestVal = valList[0];
            const latestAsset = assetsRes?.content?.[0];
            const returnRates = calculateReturnRates(valList);

            updateRuntimeSubfund(sf.subfundId, {
              name: sf.name,
              fullName: details?.fullName || sf.fullName || sf.name,
              classification: details?.classification || sf.classification || undefined,
              category: details?.category || sf.category || undefined,
              type: sf.type,
              isActive: details?.isActive ?? sf.isActive,
              isLiquidating: details?.isLiquidating ?? sf.isLiquidating,
              liquidationStartDate: details?.liquidationStartDate ?? sf.liquidationStartDate,
              liquidationEndDate: details?.liquidationEndDate ?? sf.liquidationEndDate,
              riskLevel: kid?.riskLevel ?? null,
              managementFee: kid?.managementAndOtherFeesRate ?? null,
              transactionCostsRate: kid?.transactionCostsRate ?? null,
              netAssets: latestAsset?.netAssets ?? null,
              netAssetsDate: latestAsset?.date ?? null,
              benchmark: kid?.benchmark ?? null,
              latestValuation: latestVal?.valuation ?? null,
              latestValuationDate: latestVal?.date ?? null,
              currency: latestVal?.currency || latestAsset?.currency || kid?.currency || "PLN",
              ...returnRates,
            });

            updatedCount++;
          } catch (err) {
            console.warn(`[Sync] Failed to sync subfund ${sf.subfundId}:`, err);
          }
        })
      );

      if (delayMs > 0 && i + chunkSize < subfundsToSync.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return {
      updatedCount,
      durationMs: Date.now() - startTime,
    };
  },
};
