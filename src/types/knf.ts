/**
 * Complete TypeScript definitions for KNF "Wybieram Fundusze" API
 * Source: https://wybieramfundusze-api.knf.gov.pl/openapi.json
 */

export interface KNFLink {
  href: string;
  rel: string;
}

export interface KNFPageInfo {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface KNFListResponse<T> {
  content: T[];
  page: KNFPageInfo;
  _links?: KNFLink[];
}

// ==========================================
// 1. Towarzystwa (Companies / TFI)
// ==========================================
export interface KNFCompany {
  companyId: number;
  nationalCode: string;
  name: string;
  fromDate?: string | null;
  toDate?: string | null;
  isActive?: boolean;
  _links?: KNFLink[];
}

export interface KNFCompanyDetail {
  companyId: number;
  nationalCode: string;
  krs?: string | null;
  regon?: string | null;
  name: string;
  fullName?: string | null;
  postCode?: string | null;
  city?: string | null;
  street?: string | null;
  website?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  isActive: boolean;
  _links?: KNFLink[];
}

// ==========================================
// 2. Fundusze (Funds)
// ==========================================
export interface KNFFund {
  fundId: number;
  companyId: number;
  nationalCode: string;
  name: string;
  type: string; // "FIO" | "SFIO" | "FIZ" | "ETF"
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  isLiquidating?: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  isActive?: boolean;
  _links?: KNFLink[];
}

export interface KNFFundDetail {
  fundId: number;
  companyId: number;
  nationalCode: string;
  name: string;
  fullName?: string | null;
  type: string;
  classification?: string | null;
  category?: string | null;
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  isLiquidating: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  isActive: boolean;
  _links?: KNFLink[];
}

// ==========================================
// 3. Subfundusze (Subfunds)
// ==========================================
export interface KNFSubfund {
  subfundId: number;
  fundId: number;
  nationalCode: string;
  name: string;
  fullName?: string | null;
  type: string;
  classification?: string | null;
  category?: string | null;
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  isLiquidating?: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  isActive?: boolean;
  isFundOnly?: boolean;
  companyId?: number;
  companyName?: string;
  currency?: string | null;
  _links?: KNFLink[];
}

export interface KNFSubfundDetail {
  subfundId: number;
  fundId: number;
  nationalCode: string;
  name: string;
  fullName?: string | null;
  type: string;
  classification?: string | null; // np. "akcji", "dłużne", "mieszane"
  category?: string | null;       // np. "akcji zagranicznych", "skarbowy"
  currency?: string | null;
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  isLiquidating: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  isActive: boolean;
  _links?: KNFLink[];
}

// ==========================================
// 4. Historia zmian (History)
// ==========================================
export interface KNFHistoryItem<T> {
  historyId: number;
  validFrom: string;
  validTo: string;
  data: T;
}

// ==========================================
// 5. Dokumenty KID (Key Information Document)
// ==========================================
export interface KNFScenarioResult {
  period: number; // np. 1.0 dla 1 roku, 5.0 dla 5 lat
  returnRate: number; // np. 0.126 dla 12.6%
}

export interface KNFScenario {
  name: string; // "scenariusz korzystny" | "scenariusz umiarkowany" | "scenariusz niekorzystny" | "scenariusz warunków skrajnych"
  results: KNFScenarioResult[];
}

export interface KNFKeyInformationDoc {
  documentUuid: string;
  subfundId?: number | null;
  fundId?: number | null;
  publicationDate: string;
  filename: string;
  _links?: KNFLink[];
}

export interface KNFKeyInformationDetail {
  documentUuid: string;
  subfundId?: number | null;
  fundId?: number | null;
  unit?: string | null;
  currency: string;
  isPrimary?: boolean;
  publicationDate: string;
  filename: string;
  riskLevel?: number | null; // SRI 1-7
  maxEntryFeeRate?: number | null; // opłata wstępna
  maxExitFeeRate?: number | null;  // opłata za umorzenie
  managementAndOtherFeesRate?: number | null; // opłata stała za zarządzanie
  transactionCostsRate?: number | null; // koszty transakcyjne
  hasSuccessFee?: boolean;
  successFee?: string | null;
  hasBenchmark?: boolean;
  benchmark?: string | null;
  scenarios?: KNFScenario[];
  isActive?: boolean;
  _links?: KNFLink[];
}

// ==========================================
// 6. Wyceny i jednostki (Valuations)
// ==========================================
export interface KNFValuation {
  valuationUuid: string;
  subfundId?: number | null;
  fundId?: number | null;
  currency: string;
  date: string;
  valuation: number;
  _links?: KNFLink[];
}

export interface KNFValuationUnit {
  valuationUnitUuid: string;
  valuationUuid: string;
  subfundId?: number | null;
  fundId?: number | null;
  unit: string;
  currency: string;
  isPrimary: boolean;
  isArticle83?: boolean;
  date: string;
  valuation: number;
  _links?: KNFLink[];
}

// ==========================================
// 7. Aktywa (Assets)
// ==========================================
export interface KNFAsset {
  assetUuid: string;
  subfundId?: number | null;
  fundId?: number | null;
  currency: string;
  date: string;
  assets: number;
  netAssets: number;
  _links?: KNFLink[];
}

export interface KNFTotalAsset {
  date: string;
  assets: number;
  netAssets: number;
  _links?: KNFLink[];
}

// ==========================================
// Złożone modele dla frontendu
// ==========================================
export interface SubfundCardModel extends KNFSubfund {
  isFundOnly?: boolean;
  companyName?: string;
  companyId?: number;
  fundName?: string;
  riskLevel?: number | null;
  managementFee?: number | null;
  transactionCostsRate?: number | null;
  netAssets?: number | null;
  netAssetsDate?: string | null;
  benchmark?: string | null;
  latestValuation?: number | null;
  latestValuationDate?: string | null;
  currency?: string | null;
  netAssetsPln?: number | null;
  latestValuationPln?: number | null;
  fxRate?: number | null;
  returnRate1M?: number | null;
  returnRate3M?: number | null;
  returnRate1Y?: number | null;
  returnRate2Y?: number | null;
  returnRate2YAnn?: number | null;
  returnRate3Y?: number | null;
  returnRate3YAnn?: number | null;
  returnRateYTD?: number | null;
}

export interface SubfundFullProfile {
  subfund: KNFSubfundDetail;
  fund?: KNFFundDetail | null;
  company?: KNFCompanyDetail | null;
  latestKid?: KNFKeyInformationDetail | null;
  valuations: KNFValuation[];
  assets: KNFAsset[];
  history: KNFHistoryItem<KNFSubfundDetail>[];
}

export interface MarketStatistics {
  totalAssetsGross: number;
  totalAssetsNet: number;
  statsDate: string;
  totalFundsCount: number;
  activeFundsCount: number;
  liquidatingFundsCount: number;
  totalSubfundsCount: number;
  activeSubfundsCount: number;
  investableProductsCount?: number;
  companiesCount: number;
  assetsHistory?: KNFTotalAsset[];
}

export interface RuntimeSubfundMeta {
  classification?: string | null;
  category?: string | null;
  fullName?: string | null;
  name?: string;
  type?: string;
  isActive?: boolean;
  isLiquidating?: boolean;
  liquidationStartDate?: string | null;
  liquidationEndDate?: string | null;
  riskLevel?: number | null;
  managementFee?: number | null;
  transactionCostsRate?: number | null;
  netAssets?: number | null;
  netAssetsDate?: string | null;
  benchmark?: string | null;
  latestValuation?: number | null;
  latestValuationDate?: string | null;
  currency?: string | null;
  netAssetsPln?: number | null;
  latestValuationPln?: number | null;
  fxRate?: number | null;
  returnRate1M?: number | null;
  returnRate3M?: number | null;
  returnRate1Y?: number | null;
  returnRate2Y?: number | null;
  returnRate2YAnn?: number | null;
  returnRate3Y?: number | null;
  returnRate3YAnn?: number | null;
  returnRateYTD?: number | null;
  lastUpdated?: number;
}

