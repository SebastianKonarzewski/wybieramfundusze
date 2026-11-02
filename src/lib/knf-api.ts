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

const BASE_URL = "https://wybieramfundusze-api.knf.gov.pl";
const DEFAULT_REVALIDATE = 3600; // 1 hour cache

interface FetchOptions {
  revalidate?: number | false;
  cache?: RequestCache;
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
    return knfFetch<KNFSubfundDetail>(`/v1/subfunds/${subfundId}`, { asOf });
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
        this.getTotalAssets({ size: 1 }),
        this.getFunds({ size: 1, includeInactive: false, includeLiquidating: false }),
        this.getFunds({ size: 1, includeInactive: true, includeLiquidating: true }),
        this.getSubfunds({ size: 1, includeInactive: false, includeLiquidating: false }),
        this.getSubfunds({ size: 1, includeInactive: true, includeLiquidating: true }),
        this.getCompanies({ size: 1, includeInactive: false }), // Only currently active TFI (54)
      ]);

    const latestMarketAsset = totalAssetsRes.content[0];

    const totalFundsCount = allFundsRes.page.totalElements || 0;
    const activeFundsCount = activeFundsRes.page.totalElements || 0;
    const totalSubfundsCount = allSubfundsRes.page.totalElements || 0;
    const activeSubfundsCount = activeSubfundsRes.page.totalElements || 0;

    return {
      totalAssetsGross: latestMarketAsset?.assets || 0,
      totalAssetsNet: latestMarketAsset?.netAssets || 0,
      statsDate: latestMarketAsset?.date || new Date().toISOString().split("T")[0],
      totalFundsCount,
      activeFundsCount,
      liquidatingFundsCount: totalFundsCount - activeFundsCount,
      totalSubfundsCount,
      activeSubfundsCount,
      companiesCount: companiesRes.page.totalElements || 0,
    };
  },

  // ==========================================
  // Pełny profil subfunduszu (dla strony detalu)
  // ==========================================
  async getSubfundFullProfile(subfundId: number): Promise<SubfundFullProfile | null> {
    const subfund = await this.getSubfund(subfundId);
    if (!subfund) return null;

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
  // Wzbogacone subfundusze dla katalogu
  // ==========================================
  async getEnrichedSubfunds(params?: {
    fundId?: number;
    includeInactive?: boolean;
    includeLiquidating?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{ items: SubfundCardModel[]; page: KNFListResponse<KNFSubfund>["page"] }> {
    const listRes = await this.getSubfunds(params);
    const subfunds = listRes.content;

    // Enrich batch with KID and latest valuation in parallel (max 20 per page)
    const enrichedItems: SubfundCardModel[] = await Promise.all(
      subfunds.map(async (sf) => {
        try {
          const [kid, valuationsRes] = await Promise.all([
            this.getLatestKidForSubfund(sf.subfundId),
            this.getValuations({ subfundId: sf.subfundId, size: 1 }),
          ]);

          const latestVal = valuationsRes.content[0];

          return {
            ...sf,
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
      page: listRes.page,
    };
  },
};

