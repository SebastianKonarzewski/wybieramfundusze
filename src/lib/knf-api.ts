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
} from "@/types/knf";
import subfundsClassifications from "@/data/subfunds-classifications.json";
import standaloneFundsData from "@/data/standalone-funds.json";

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

// In-memory cache for subfund details to minimize repeated network calls
const subfundDetailCache = new Map<number, KNFSubfundDetail>();

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
      },
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

  async getSubfund(subfundId: number, asOf?: string): Promise<KNFSubfundDetail | null> {
    if (!asOf && subfundDetailCache.has(subfundId)) {
      return subfundDetailCache.get(subfundId)!;
    }
    const detail = await knfFetch<KNFSubfundDetail>(`/v1/subfunds/${subfundId}`, { asOf });
    if (detail && !asOf) {
      subfundDetailCache.set(subfundId, detail);
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
    const subfund = await this.getSubfund(subfundId);
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

    const classificationsMap = (subfundsClassifications || {}) as Record<
      string,
      { c: string; cat: string; fn: string }
    >;

    // Fetch the list of subfunds (up to 2000 so we cover all)
    const listRes = await this.getSubfunds({
      fundId: params?.fundId,
      fundType: activeFundTypes.length === 1 ? activeFundTypes[0] : undefined,
      includeInactive: params?.includeInactive,
      includeLiquidating: params?.includeLiquidating,
      search: params?.search,
      page: 0,
      size: 2000,
      sort: params?.sort?.startsWith("name") ? params.sort : "name,asc",
    });

    // Exclude subfunds with no public valuations in API
    const validSubfunds = listRes.content.filter((sf) => !UNQUOTED_SUBFUND_IDS.has(sf.subfundId));

    // Prepare standalone funds if general query (no specific umbrella fundId specified)
    let standalonePool: (KNFSubfund & { isFundOnly?: boolean; companyId?: number })[] = [];
    if (!params?.fundId) {
      const sTerm = (params?.search || "").toLowerCase().trim();
      standalonePool = (standaloneFundsData as any[]).filter((f) => {
        if (!sTerm) return true;
        return (
          (f.name || "").toLowerCase().includes(sTerm) ||
          (f.fullName || "").toLowerCase().includes(sTerm) ||
          (f.nationalCode || "").toLowerCase().includes(sTerm)
        );
      });
    }

    const combinedPool = [...validSubfunds, ...standalonePool];

    let filtered = combinedPool.map((sf) => {
      const meta = classificationsMap[String(sf.subfundId)];
      const fallback = inferClassificationFromName(sf.name);
      return {
        ...sf,
        classification: sf.classification || meta?.c || fallback.classification,
        category: sf.category || meta?.cat || fallback.category,
        fullName: (sf as any).fullName || meta?.fn || sf.name,
      };
    });

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

    // Handle sort if name,desc
    if (params?.sort === "name,desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name, "pl"));
    } else if (params?.sort === "name,asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startIndex = currentPage * pageSize;
    const subfundsToEnrich = filtered.slice(startIndex, startIndex + pageSize);

    // Enrich batch with full details, KID and latest valuation
    const enrichedItems: SubfundCardModel[] = await Promise.all(
      subfundsToEnrich.map(async (sf) => {
        try {
          if ((sf as any).isFundOnly) {
            // Standalone fund without segregated subfunds (e.g. Beta ETF, PZU ETF, standalone FIO/SFIO)
            const [fundDetail, kidRes, valuationsRes] = await Promise.all([
              this.getFund(sf.fundId),
              this.getKeyInformation({ fundId: sf.fundId, size: 1 }),
              this.getValuations({ fundId: sf.fundId, size: 1 }),
            ]);

            let kidDetail: KNFKeyInformationDetail | null = null;
            if (kidRes.content?.[0]) {
              kidDetail = await this.getKeyInformationDetail(kidRes.content[0].documentUuid);
            }

            const latestVal = valuationsRes.content[0];

            return {
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
              benchmark: kidDetail?.benchmark ?? null,
              latestValuation: latestVal?.valuation ?? null,
              latestValuationDate: latestVal?.date ?? null,
            };
          }

          const [details, kid, valuationsRes] = await Promise.all([
            this.getSubfund(sf.subfundId),
            this.getLatestKidForSubfund(sf.subfundId),
            this.getValuations({ subfundId: sf.subfundId, size: 1 }),
          ]);

          const latestVal = valuationsRes.content[0];

          return {
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
            benchmark: kid?.benchmark ?? null,
            latestValuation: latestVal?.valuation ?? null,
            latestValuationDate: latestVal?.date ?? null,
          };
        } catch {
          return {
            ...sf,
            riskLevel: null,
            managementFee: null,
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
};
