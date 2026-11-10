"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Scale,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  RotateCcw,
  TrendingUp,
  Coins,
  X,
  Building2,
  ShieldAlert,
  Percent,
} from "lucide-react";
import { SubfundCardModel } from "@/types/knf";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { FormattedCurrency, FormattedLargeNumber } from "./FormattedAmount";
import { useCompare } from "./CompareContext";
import { usePortfolio } from "./PortfolioContext";
import { useTranslation } from "@/lib/i18n";

interface CategoryOption {
  id: string;
  labelPl: string;
  labelEn: string;
}

interface CategoryGroup {
  classId: string;
  groupPl: string;
  groupEn: string;
  options: CategoryOption[];
}

export type ReturnPeriod = "1M" | "3M" | "6M" | "1Y" | "2Y" | "YTD";

export const RETURN_PERIODS: {
  id: ReturnPeriod;
  labelPl: string;
  labelEn: string;
  fullPl: string;
  fullEn: string;
}[] = [
  { id: "1M", labelPl: "1M", labelEn: "1M", fullPl: "1 miesiąc", fullEn: "1 month" },
  { id: "3M", labelPl: "3M", labelEn: "3M", fullPl: "3 miesiące", fullEn: "3 months" },
  { id: "6M", labelPl: "6M", labelEn: "6M", fullPl: "6 miesięcy", fullEn: "6 months" },
  { id: "1Y", labelPl: "12M", labelEn: "12M", fullPl: "12 miesięcy", fullEn: "12 months" },
  { id: "2Y", labelPl: "24M", labelEn: "24M", fullPl: "24 miesiące", fullEn: "24 months" },
  { id: "YTD", labelPl: "YTD", labelEn: "YTD", fullPl: "Od początku roku (YTD)", fullEn: "Year to date (YTD)" },
];

export const GRID_PAGE_SIZES = [24, 48, 96];
export const TABLE_PAGE_SIZES = [25, 50, 100];

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    classId: "akcji",
    groupPl: "Fundusze akcyjne",
    groupEn: "Equity funds",
    options: [
      { id: "akcji polskich", labelPl: "Akcji polskich", labelEn: "Polish equities" },
      { id: "akcji zagranicznych", labelPl: "Akcji zagranicznych i globalnych", labelEn: "Foreign & global equities" },
      { id: "akcji pozostałe", labelPl: "Akcji pozostałe", labelEn: "Other equities" },
    ],
  },
  {
    classId: "dłużn",
    groupPl: "Fundusze dłużne",
    groupEn: "Bond & fixed income funds",
    options: [
      { id: "obligacji skarbowych", labelPl: "Obligacji skarbowych", labelEn: "Treasury / government bonds" },
      { id: "obligacji korporacyjnych", labelPl: "Obligacji korporacyjnych", labelEn: "Corporate bonds" },
      { id: "obligacji uniwersalne", labelPl: "Obligacji uniwersalne", labelEn: "Universal bonds" },
      { id: "obligacji pozostałe", labelPl: "Obligacji pozostałe", labelEn: "Other bonds" },
    ],
  },
  {
    classId: "mieszan",
    groupPl: "Fundusze mieszane",
    groupEn: "Mixed & balanced funds",
    options: [
      { id: "mieszane aktywnej alokacji", labelPl: "Mieszane aktywnej alokacji", labelEn: "Active allocation mixed" },
      { id: "mieszane ograniczonej alokacji", labelPl: "Mieszane ograniczonej alokacji", labelEn: "Conservative / balanced mixed" },
      { id: "mieszane cyklu życia", labelPl: "Mieszane cyklu życia", labelEn: "Lifecycle mixed" },
      { id: "mieszane pozostałe", labelPl: "Mieszane pozostałe", labelEn: "Other mixed" },
    ],
  },
  {
    classId: "alternatyw",
    groupPl: "Fundusze alternatywne i surowce",
    groupEn: "Alternative & commodity funds",
    options: [
      { id: "rynku surowców", labelPl: "Rynku surowców i metali szlachetnych", labelEn: "Commodities & precious metals" },
      { id: "absolutnej stopy zwrotu", labelPl: "Absolutnej stopy zwrotu", labelEn: "Absolute return" },
      { id: "aktywów niepublicznych", labelPl: "Aktywów niepublicznych", labelEn: "Private assets / PE" },
      { id: "sekurytyzacyjne", labelPl: "Sekurytyzacyjne", labelEn: "Securitization" },
      { id: "nieruchomościowe", labelPl: "Nieruchomościowe", labelEn: "Real estate" },
    ],
  },
  {
    classId: "PPK",
    groupPl: "Pracownicze Plany Kapitałowe (PPK)",
    groupEn: "Employee Capital Plans (PPK)",
    options: [
      { id: "PPK zdefiniowanej daty 2020", labelPl: "PPK 2020", labelEn: "PPK 2020" },
      { id: "PPK zdefiniowanej daty 2025", labelPl: "PPK 2025", labelEn: "PPK 2025" },
      { id: "PPK zdefiniowanej daty 2030", labelPl: "PPK 2030", labelEn: "PPK 2030" },
      { id: "PPK zdefiniowanej daty 2035", labelPl: "PPK 2035", labelEn: "PPK 2035" },
      { id: "PPK zdefiniowanej daty 2040", labelPl: "PPK 2040", labelEn: "PPK 2040" },
      { id: "PPK zdefiniowanej daty 2045", labelPl: "PPK 2045", labelEn: "PPK 2045" },
      { id: "PPK zdefiniowanej daty 2050", labelPl: "PPK 2050", labelEn: "PPK 2050" },
      { id: "PPK zdefiniowanej daty 2055", labelPl: "PPK 2055", labelEn: "PPK 2055" },
      { id: "PPK zdefiniowanej daty 2060", labelPl: "PPK 2060", labelEn: "PPK 2060" },
      { id: "PPK zdefiniowanej daty 2065", labelPl: "PPK 2065", labelEn: "PPK 2065" },
      { id: "PPK zdefiniowanej daty 2070", labelPl: "PPK 2070", labelEn: "PPK 2070" },
    ],
  },
];

function getCategoryLabel(catId: string, isEn: boolean): string {
  for (const grp of CATEGORY_GROUPS) {
    for (const opt of grp.options) {
      if (opt.id === catId) {
        return isEn ? opt.labelEn : opt.labelPl;
      }
    }
  }
  return catId;
}

function getDisplayType(item: { name: string; type: string; classification?: string | null }): string {
  if (item.name.toUpperCase().includes("ETF")) return "ETF";
  if (item.name.toUpperCase().includes("PPK") || item.classification === "PPK") return "PPK";
  return item.type;
}

export const ALL_TFIS = [
  "AgioFunds TFI",
  "Alior TFI",
  "Allied Funds TFI",
  "Amathus TFI",
  "Amundi Polska TFI",
  "ARP TFI",
  "Baltic Capital TFI",
  "BEST TFI",
  "BNP Paribas TFI",
  "BPS TFI",
  "Caspar TFI",
  "Eques Investment TFI",
  "Erste TFI",
  "Esaliens TFI",
  "Forum TFI",
  "Generali Investments TFI",
  "Hoist TFI",
  "IB TFI",
  "ING TFI",
  "Insignis TFI",
  "Intrum TFI",
  "Investors TFI",
  "Ipopema TFI",
  "KRUK TFI",
  "MCI Capital TFI",
  "Mebis TFI SA",
  "Michael/Ström TFI",
  "Millennium TFI",
  "MMP TFI",
  "Mount TFI",
  "mTFI",
  "Opoka TFI",
  "OPTI TFI",
  "Origin TFI",
  "OSTOJA TFI",
  "Pekao TFI",
  "PFR TFI",
  "PKO TFI",
  "PRA Group TFI",
  "Quercus TFI",
  "Rockbridge TFI",
  "Skarbiec TFI",
  "Superfund TFI",
  "TFI AGRO",
  "TFI Allianz Polska",
  "TFI PZU SA",
  "TYR TFI",
  "Ultimo TFI",
  "Uniqa TFI",
  "VeloFunds TFI",
  "VIG/C-QUADRAT TFI",
  "White Berg TFI",
];

const SRI_LEVELS = [
  { level: 1, label: "1", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-400" },
  { level: 2, label: "2", color: "bg-green-500", text: "text-green-700 dark:text-green-300", border: "border-green-400" },
  { level: 3, label: "3", color: "bg-lime-500", text: "text-lime-700 dark:text-lime-300", border: "border-lime-400" },
  { level: 4, label: "4", color: "bg-yellow-400", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-400" },
  { level: 5, label: "5", color: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", border: "border-amber-400" },
  { level: 6, label: "6", color: "bg-orange-500", text: "text-orange-700 dark:text-orange-300", border: "border-orange-400" },
  { level: 7, label: "7", color: "bg-rose-600", text: "text-rose-700 dark:text-rose-300", border: "border-rose-400" },
];

interface SubfundsCatalogProps {
  initialItems: SubfundCardModel[];
  initialPage: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
  initialSearch?: string;
  initialFundId?: number;
  initialFundName?: string;
}

export function SubfundsCatalog({
  initialItems,
  initialPage,
  initialSearch = "",
  initialFundId,
  initialFundName,
}: SubfundsCatalogProps) {
  const { toggleFund, isSelected } = useCompare();
  const { toggleFund: togglePortfolioFund, isInPortfolio } = usePortfolio();
  const { t, locale, formatCurrency, formatPercent, formatDate, formatNumber, formatLargeNumber } = useTranslation();

  const [items, setItems] = useState<SubfundCardModel[]>(initialItems);
  const [pageInfo, setPageInfo] = useState(initialPage);
  const [isPending, startTransition] = useTransition();

  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [fundId, setFundId] = useState<number | undefined>(initialFundId);
  const [fundName, setFundName] = useState<string | undefined>(initialFundName);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeLiquidating, setIncludeLiquidating] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Multi-select state for fund types and asset classes
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced filters state: TFI, SRI, Max fee, Only profitable
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isTfiOpen, setIsTfiOpen] = useState(false);
  const [tfiSearchTerm, setTfiSearchTerm] = useState("");
  const tfiDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedSri, setSelectedSri] = useState<number[]>([]);
  const [maxFee, setMaxFee] = useState<number | null>(null);
  const [onlyProfitable, setOnlyProfitable] = useState(false);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<"name" | "fee" | "risk" | "valuation" | "return" | "assets">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [returnPeriod, setReturnPeriod] = useState<ReturnPeriod>("1Y");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [hasUserToggledView, setHasUserToggledView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gridPageSize, setGridPageSize] = useState<number>(24);
  const [tablePageSize, setTablePageSize] = useState<number>(25);

  const currentPageSize = viewMode === "grid" ? gridPageSize : tablePageSize;
  const pageSizeOptions = viewMode === "grid" ? GRID_PAGE_SIZES : TABLE_PAGE_SIZES;

  const activePeriodLabel = useMemo(() => {
    const p = RETURN_PERIODS.find((item) => item.id === returnPeriod);
    return locale === "en" ? p?.labelEn ?? returnPeriod : p?.labelPl ?? returnPeriod;
  }, [returnPeriod, locale]);

  const activePeriodFullLabel = useMemo(() => {
    const p = RETURN_PERIODS.find((item) => item.id === returnPeriod);
    return locale === "en" ? p?.fullEn ?? returnPeriod : p?.fullPl ?? returnPeriod;
  }, [returnPeriod, locale]);

  const renderReturnBadge = (item: SubfundCardModel, period: ReturnPeriod) => {
    let rate: number | null | undefined = null;
    switch (period) {
      case "1M":
        rate = item.returnRate1M;
        break;
      case "3M":
        rate = item.returnRate3M;
        break;
      case "6M":
        rate = item.returnRate6M;
        break;
      case "1Y":
        rate = item.returnRate1Y;
        break;
      case "2Y":
        rate = item.returnRate2Y;
        break;
      case "YTD":
        rate = item.returnRateYTD;
        break;
    }

    if (rate === null || rate === undefined || isNaN(rate)) {
      return <span className="text-slate-400 dark:text-slate-600 font-medium text-xs">—</span>;
    }

    const isPositive = rate > 0;
    const isNegative = rate < 0;
    const sign = isPositive ? "+" : "";
    const formattedRate = `${sign}${formatPercent(rate)}`;

    return (
      <div className="flex flex-col items-start leading-tight">
        <span
          className={`text-xs sm:text-sm font-bold ${
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : isNegative
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {formattedRate}
        </span>
        {period === "2Y" && item.returnRate2YAnn !== null && item.returnRate2YAnn !== undefined && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
            {t.catalog.table.annualizedSubtitle.replace(
              "{rate}",
              `${item.returnRate2YAnn > 0 ? "+" : ""}${formatPercent(item.returnRate2YAnn)}`
            )}
          </span>
        )}
      </div>
    );
  };

  // Sync if initialSearch or initialFundId props change (e.g. from TFI deep link navigation or navigation back to /)
  useEffect(() => {
    startTransition(() => {
      setSearchTerm(initialSearch || "");
      setFundId(initialFundId);
      setFundName(initialFundName);
      setCurrentPage(0);
    });
  }, [initialSearch, initialFundId, initialFundName]);

  // Set default view: "table" on full desktop (>=1280px), "grid" on mobile, tablet & intermediate (<1280px)
  // and track mobile viewport for responsive input placeholders
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (!hasUserToggledView) {
        const isFullDesktop = window.innerWidth >= 1280;
        setViewMode(isFullDesktop ? "table" : "grid");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasUserToggledView]);

  const handleViewModeChange = (mode: "grid" | "table") => {
    if (mode === viewMode) return;
    setHasUserToggledView(true);
    setViewMode(mode);

    // Keep approximate scroll/item position
    const oldSize = viewMode === "grid" ? gridPageSize : tablePageSize;
    const newSize = mode === "grid" ? gridPageSize : tablePageSize;
    const currentFirstIndex = currentPage * oldSize;
    const newPage = Math.floor(currentFirstIndex / newSize);
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    if (newSize === currentPageSize) return;
    const currentFirstIndex = currentPage * currentPageSize;
    if (viewMode === "grid") {
      setGridPageSize(newSize);
    } else {
      setTablePageSize(newSize);
    }
    const newPage = Math.floor(currentFirstIndex / newSize);
    setCurrentPage(newPage);
  };

  // Toggle helpers for multi-select
  const toggleClassification = (id: string) => {
    setCurrentPage(0);
    if (id === "ALL") {
      setSelectedClassifications([]);
      setSelectedCategories([]);
      return;
    }
    setSelectedClassifications((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      if (next.length > 0) {
        const nextGroups = CATEGORY_GROUPS.filter((grp) => next.includes(grp.classId));
        setSelectedCategories((prevCats) =>
          prevCats.filter((cat) =>
            nextGroups.some((grp) => grp.options.some((opt) => opt.id === cat))
          )
        );
      }
      return next;
    });
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters((prev) => {
      if (prev) setIsCategoryOpen(false);
      return !prev;
    });
  };

  const toggleType = (type: string) => {
    setCurrentPage(0);
    if (type === "ALL") {
      setSelectedTypes([]);
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Helper to toggle currency in multi-select (e.g. PLN, USD, EUR)
  const toggleCurrency = (currency: string) => {
    setCurrentPage(0);
    if (currency === "ALL") {
      setSelectedCurrencies([]);
      return;
    }
    setSelectedCurrencies((prev) =>
      prev.includes(currency) ? prev.filter((c) => c !== currency) : [...prev, currency]
    );
  };

  // Filter category groups by currently active asset classes / legal types if any are selected
  const visibleCategoryGroups = useMemo(() => {
    let groups = CATEGORY_GROUPS;
    if (selectedClassifications.length > 0) {
      groups = groups.filter(
        (grp) =>
          selectedClassifications.includes(grp.classId) ||
          (grp.classId === "PPK" && selectedTypes.includes("PPK"))
      );
    } else if (selectedTypes.length > 0 && !selectedTypes.includes("PPK")) {
      groups = groups.filter((grp) => grp.classId !== "PPK");
    }
    return groups;
  }, [selectedClassifications, selectedTypes]);

  // Helper to toggle a category in multi-select
  const toggleCategory = (catId: string) => {
    if (catId === "ALL") {
      setSelectedCategories([]);
      setCurrentPage(0);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
    setCurrentPage(0);
  };

  const categoryTriggerTitle = useMemo(() => {
    if (selectedCategories.length === 0) return t.catalog.allCategories;
    return selectedCategories.map((c) => getCategoryLabel(c, locale === "en")).join(", ");
  }, [selectedCategories, t.catalog.allCategories, locale]);

  // Close category dropdown on click outside or Escape
  useEffect(() => {
    if (!isCategoryOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryOpen]);

  // Close TFI dropdown on click outside or Escape
  useEffect(() => {
    if (!isTfiOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tfiDropdownRef.current &&
        !tfiDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTfiOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTfiOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTfiOpen]);

  const filteredTfis = useMemo(() => {
    if (!tfiSearchTerm.trim()) return ALL_TFIS;
    const term = tfiSearchTerm.toLowerCase();
    return ALL_TFIS.filter((tfi) => tfi.toLowerCase().includes(term));
  }, [tfiSearchTerm]);

  const toggleCompany = (company: string) => {
    if (company === "ALL") {
      setSelectedCompanies([]);
      setCurrentPage(0);
      return;
    }
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
    setCurrentPage(0);
  };

  const tfiTriggerTitle = useMemo(() => {
    if (selectedCompanies.length === 0) return t.catalog.allTfi;
    return selectedCompanies.join(", ");
  }, [selectedCompanies, t.catalog.allTfi]);

  const toggleSri = (level: number) => {
    if (level === 0) {
      setSelectedSri([]);
      setCurrentPage(0);
      return;
    }
    setSelectedSri((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setCurrentPage(0);
  };

  // Close sort dropdown on click outside or Escape
  useEffect(() => {
    if (!isSortOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSortOpen]);

  const hasActiveAdvancedFilters =
    selectedCompanies.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSri.length > 0 ||
    maxFee !== null ||
    onlyProfitable ||
    includeInactive ||
    includeLiquidating;

  const activeAdvancedFiltersCount =
    selectedCompanies.length +
    selectedCategories.length +
    selectedSri.length +
    (maxFee !== null ? 1 : 0) +
    (onlyProfitable ? 1 : 0) +
    (includeInactive ? 1 : 0) +
    (includeLiquidating ? 1 : 0);

  const hasAnyActiveFilters =
    searchTerm.trim() !== "" ||
    Boolean(fundId) ||
    selectedClassifications.length > 0 ||
    selectedTypes.length > 0 ||
    selectedCurrencies.length > 0 ||
    hasActiveAdvancedFilters;

  const activeFiltersCount =
    (searchTerm.trim() !== "" ? 1 : 0) +
    (fundId ? 1 : 0) +
    selectedClassifications.length +
    selectedTypes.length +
    selectedCurrencies.length +
    activeAdvancedFiltersCount;

  const clearUmbrellaFundFilter = () => {
    setFundId(undefined);
    setFundName(undefined);
    setCurrentPage(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("fundId");
      url.searchParams.delete("fundName");
      const newQuery = url.searchParams.toString();
      window.history.replaceState(null, "", url.pathname + (newQuery ? `?${newQuery}` : ""));
    }
  };

  const resetAdvancedFilters = () => {
    setSelectedCompanies([]);
    setSelectedCategories([]);
    setSelectedSri([]);
    setMaxFee(null);
    setOnlyProfitable(false);
    setIncludeInactive(false);
    setIncludeLiquidating(false);
    setCurrentPage(0);
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setFundId(undefined);
    setFundName(undefined);
    setSelectedClassifications([]);
    setSelectedTypes([]);
    setSelectedCurrencies([]);
    setSelectedCategories([]);
    setSelectedCompanies([]);
    setSelectedSri([]);
    setMaxFee(null);
    setOnlyProfitable(false);
    setIncludeInactive(false);
    setIncludeLiquidating(false);
    setCurrentPage(0);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("fundId");
      url.searchParams.delete("fundName");
      url.searchParams.delete("search");
      const newQuery = url.searchParams.toString();
      window.history.replaceState(null, "", url.pathname + (newQuery ? `?${newQuery}` : ""));
    }
  };

  // Fetch data on filter changes
  useEffect(() => {
    const fetchFiltered = async () => {
      startTransition(async () => {
        try {
          const params = new URLSearchParams();
          if (searchTerm) params.set("search", searchTerm);
          if (fundId) params.set("fundId", String(fundId));
          if (selectedClassifications.length > 0) {
            params.set("classifications", selectedClassifications.join(","));
          }
          if (selectedTypes.length > 0) {
            params.set("fundTypes", selectedTypes.join(","));
          }
          if (selectedCurrencies.length > 0) {
            params.set("currencies", selectedCurrencies.join(","));
          }
          if (selectedCompanies.length > 0) {
            params.set("companies", selectedCompanies.join(","));
          }
          if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","));
          }
          if (selectedSri.length > 0) {
            params.set("sri", selectedSri.join(","));
          }
          if (maxFee !== null) {
            params.set("maxFee", String(maxFee));
          }
          if (onlyProfitable) {
            params.set("onlyProfitable", "true");
          }
          if (includeInactive) params.set("includeInactive", "true");
          if (includeLiquidating) params.set("includeLiquidating", "true");
          params.set("returnPeriod", returnPeriod);
          params.set("page", String(currentPage));
          params.set("size", String(currentPageSize));
          if (sortField === "name") {
            params.set("sort", `name,${sortOrder}`);
          } else if (sortField === "return") {
            params.set("sort", `return${returnPeriod},${sortOrder}`);
          } else if (sortField === "assets") {
            params.set("sort", `assets,${sortOrder}`);
          } else {
            params.set("sort", `${sortField},${sortOrder}`);
          }
          params.set("enriched", "true");

          const res = await fetch(`/api/subfunds?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setItems(data.items || []);
            setPageInfo(data.page || { size: currentPageSize, totalElements: 0, totalPages: 0, number: 0 });
          }
        } catch (error) {
          console.error("Error fetching subfunds:", error);
        }
      });
    };

    const timer = setTimeout(() => {
      fetchFiltered();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    fundId,
    selectedClassifications,
    selectedTypes,
    selectedCurrencies,
    selectedCompanies,
    selectedCategories,
    selectedSri,
    maxFee,
    onlyProfitable,
    includeInactive,
    includeLiquidating,
    currentPage,
    currentPageSize,
    sortField,
    sortOrder,
    returnPeriod,
  ]);

  // Handle period change (resets page to 0 if sorted by return so user sees top performers)
  const handlePeriodChange = (newPeriod: ReturnPeriod) => {
    setReturnPeriod(newPeriod);
    if (sortField === "return") {
      setCurrentPage(0);
    }
  };

  // Handle header click sorting
  const handleSort = (field: "name" | "fee" | "risk" | "valuation" | "return" | "assets") => {
    setCurrentPage(0);
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "valuation" || field === "return" || field === "assets" ? "desc" : "asc");
    }
  };

  // Handle combined sort dropdown change
  const handleCombinedSortChange = (combinedValue: string) => {
    const [field, order] = combinedValue.split("_") as [
      "name" | "fee" | "risk" | "valuation" | "return" | "assets",
      "asc" | "desc"
    ];
    if (field && order) {
      setCurrentPage(0);
      setSortField(field);
      setSortOrder(order);
    }
  };

  const sortGroups = useMemo(() => [
    {
      id: "name",
      options: [
        {
          value: "name_asc",
          label: t.catalog.sort.nameAsc,
        },
        {
          value: "name_desc",
          label: t.catalog.sort.nameDesc,
        },
      ],
    },
    {
      id: "risk",
      options: [
        {
          value: "risk_asc",
          label: t.catalog.sort.riskAsc,
        },
        {
          value: "risk_desc",
          label: t.catalog.sort.riskDesc,
        },
      ],
    },
    {
      id: "fee",
      options: [
        {
          value: "fee_asc",
          label: t.catalog.sort.feeAsc,
        },
        {
          value: "fee_desc",
          label: t.catalog.sort.feeDesc,
        },
      ],
    },
    {
      id: "return",
      options: [
        {
          value: "return_desc",
          label: `${t.catalog.sort.returnDesc} (${activePeriodLabel})`,
        },
        {
          value: "return_asc",
          label: `${t.catalog.sort.returnAsc} (${activePeriodLabel})`,
        },
      ],
    },
    {
      id: "valuation",
      options: [
        {
          value: "valuation_desc",
          label: t.catalog.sort.valuationDesc,
        },
        {
          value: "valuation_asc",
          label: t.catalog.sort.valuationAsc,
        },
      ],
    },
    {
      id: "assets",
      options: [
        {
          value: "assets_desc",
          label: t.catalog.sort.assetsDesc,
        },
        {
          value: "assets_asc",
          label: t.catalog.sort.assetsAsc,
        },
      ],
    },
  ], [t, activePeriodLabel]);

  const currentSortValue = `${sortField}_${sortOrder}`;

  const currentSortLabel = useMemo(() => {
    for (const grp of sortGroups) {
      for (const opt of grp.options) {
        if (opt.value === currentSortValue) {
          return opt.label;
        }
      }
    }
    return t.catalog.sort.nameAsc;
  }, [sortGroups, currentSortValue, t.catalog.sort.nameAsc]);

  // Handle page change with smooth scroll to results header
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (resultsTopRef.current) {
      const topOffset = resultsTopRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  };

  // Custom sort for enriched columns on the fetched page
  const processedItems = useMemo(() => {
    const result = [...items];

    if (sortField === "fee") {
      result.sort((a, b) => {
        const fa = a.managementFee ?? (sortOrder === "asc" ? 999 : -1);
        const fb = b.managementFee ?? (sortOrder === "asc" ? 999 : -1);
        return sortOrder === "asc" ? fa - fb : fb - fa;
      });
    } else if (sortField === "risk") {
      result.sort((a, b) => {
        const ra = a.riskLevel ?? (sortOrder === "asc" ? 999 : -1);
        const rb = b.riskLevel ?? (sortOrder === "asc" ? 999 : -1);
        return sortOrder === "asc" ? ra - rb : rb - ra;
      });
    } else if (sortField === "valuation") {
      result.sort((a, b) => {
        const va = a.latestValuationPln ?? a.latestValuation ?? -1;
        const vb = b.latestValuationPln ?? b.latestValuation ?? -1;
        return sortOrder === "asc" ? va - vb : vb - va;
      });
    } else if (sortField === "assets") {
      result.sort((a, b) => {
        const aa = a.netAssetsPln ?? a.netAssets ?? (sortOrder === "asc" ? 9999999999999 : -1);
        const ab = b.netAssetsPln ?? b.netAssets ?? (sortOrder === "asc" ? 9999999999999 : -1);
        return sortOrder === "asc" ? aa - ab : ab - aa;
      });
    } else if (sortField === "return") {
      const getRate = (item: SubfundCardModel) => {
        switch (returnPeriod) {
          case "1M": return item.returnRate1M;
          case "3M": return item.returnRate3M;
          case "6M": return item.returnRate6M;
          case "1Y": return item.returnRate1Y;
          case "2Y": return item.returnRate2Y;
          case "YTD": return item.returnRateYTD;
          default: return item.returnRate1Y;
        }
      };
      result.sort((a, b) => {
        const ra = getRate(a);
        const rb = getRate(b);
        const valA = ra ?? (sortOrder === "asc" ? 9999 : -9999);
        const valB = rb ?? (sortOrder === "asc" ? 9999 : -9999);
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [items, sortField, sortOrder, returnPeriod]);

  const classificationOptions = [
    { id: "ALL", label: t.catalog.classes.ALL },
    { id: "akcji", label: t.catalog.classes.akcji },
    { id: "dłużn", label: t.catalog.classes.dłużn },
    { id: "mieszan", label: t.catalog.classes.mieszan },
    { id: "alternatyw", label: t.catalog.classes.alternatyw },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
        {/* Search input (full width) */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isMobile ? t.catalog.searchPlaceholderMobile : t.catalog.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 dark:bg-[#030c1c] border border-slate-300/80 dark:border-[#0e274d] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-[#044CD0] focus:ring-2 focus:ring-[#044CD0]/15 transition-all shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              aria-label="Wyczyść szukanie"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Rows: Asset Class & Legal Type */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#0e274d] space-y-3">
          {/* Row 1: Asset Class */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700 dark:text-slate-300 sm:w-[124px] shrink-0 font-semibold flex items-center gap-1.5 select-none">
              <Compass className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6] shrink-0" />
              {t.catalog.assetClass}
            </span>
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#030c1c] border border-slate-200/80 dark:border-[#0e274d]/80 gap-1 flex-wrap">
              {classificationOptions.map((cls) => {
                const isSelected =
                  cls.id === "ALL"
                    ? selectedClassifications.length === 0
                    : selectedClassifications.includes(cls.id);

                return (
                  <button
                    key={cls.id}
                    onClick={() => toggleClassification(cls.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#044CD0] text-white shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#081a38]"
                    }`}
                  >
                    {isSelected && cls.id !== "ALL" && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    {cls.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Legal Type */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700 dark:text-slate-300 sm:w-[124px] shrink-0 font-semibold flex items-center gap-1.5 select-none">
              <Scale className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6] shrink-0" />
              {t.catalog.legalType}
            </span>
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#030c1c] border border-slate-200/80 dark:border-[#0e274d]/80 gap-1 flex-wrap">
              {["ALL", "FIO", "SFIO", "FIZ", "ETF", "PPK"].map((type) => {
                const isSelected =
                  type === "ALL"
                    ? selectedTypes.length === 0
                    : selectedTypes.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#044CD0] text-white shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#081a38]"
                    }`}
                  >
                    {isSelected && type !== "ALL" && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    {type === "ALL" ? t.catalog.allTypes : type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Currency & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-700 dark:text-slate-300 sm:w-[124px] shrink-0 font-semibold flex items-center gap-1.5 select-none">
                <Coins className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6] shrink-0" />
                {t.catalog.currencyLabel}
              </span>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#030c1c] border border-slate-200/80 dark:border-[#0e274d]/80 gap-1 flex-wrap">
                {["ALL", "PLN", "USD", "EUR"].map((curr) => {
                  const isSelected =
                    curr === "ALL"
                      ? selectedCurrencies.length === 0
                      : selectedCurrencies.includes(curr);

                  return (
                    <button
                      key={curr}
                      onClick={() => toggleCurrency(curr)}
                      aria-pressed={isSelected}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#044CD0] text-white shadow-xs font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#081a38]"
                      }`}
                    >
                      {isSelected && curr !== "ALL" && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      {curr === "ALL" ? t.catalog.allCurrencies : curr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions: Clear All Filters & Advanced Options Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              {hasAnyActiveFilters && (
                <button
                  type="button"
                  data-component="clear-filters-btn"
                  onClick={resetAllFilters}
                  className="h-[38px] inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-xl border border-rose-300/80 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100/90 dark:hover:bg-rose-900/50 hover:border-rose-400 dark:hover:border-rose-700 hover:text-rose-800 dark:hover:text-rose-200 font-medium transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                  title={t.catalog.clearAllFilters}
                  aria-label={t.catalog.clearAllFilters}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover:-rotate-45 transition-transform" />
                  <span>{t.catalog.clearAllFilters}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 text-[11px] font-bold border border-rose-300/80 dark:border-rose-800 transition-colors">
                    {activeFiltersCount}
                  </span>
                </button>
              )}

              {/* Toggle Button for Advanced Options */}
              <button
                onClick={toggleAdvancedFilters}
                className={`h-[38px] inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-xl border transition-all cursor-pointer ${
                  hasActiveAdvancedFilters
                    ? "text-[#044CD0] dark:text-blue-300 border-blue-400 dark:border-blue-500/50 bg-blue-50/90 dark:bg-[#044CD0]/15 hover:bg-blue-100/90 dark:hover:bg-[#044CD0]/25 font-semibold shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#044CD0] dark:hover:text-slate-200 border-slate-300 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-slate-600 bg-white dark:bg-transparent hover:bg-blue-50/70 dark:hover:bg-[#071938]"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6]" />
                <span>{t.catalog.advancedFilters}</span>
                {hasActiveAdvancedFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#044CD0] dark:bg-blue-400 animate-pulse" />
                )}
                {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-[#030a16] border border-slate-200 dark:border-[#0e274d] space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 animate-in fade-in duration-150 relative z-20 shadow-inner">
            {/* Header with active count & quick reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#0e274d]/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#044CD0] dark:text-[#3b82f6]" />
                <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {t.catalog.advancedFilters}
                </span>
                {activeAdvancedFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-[#044CD0]/30 text-[#044CD0] dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                    {activeAdvancedFiltersCount} {t.catalog.activeFiltersCount}
                  </span>
                )}
              </div>
              {hasActiveAdvancedFilters && (
                <button
                  type="button"
                  onClick={resetAdvancedFilters}
                  className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.common.clear}</span>
                </button>
              )}
            </div>

            {/* 2-Column Responsive Grid for Main Advanced Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Column 1: Entities & Detailed Category */}
              <div className="space-y-3.5 bg-white dark:bg-[#051329] p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-[#0e274d]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#3b82f6]" />
                  <span>{t.catalog.filterSectionEntities}</span>
                </div>

                {/* 1. Towarzystwo (TFI) */}
                <div className="space-y-1.5">
                  <label id="tfi-select-label" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.catalog.tfiLabel}
                  </label>
                  <div ref={tfiDropdownRef} className="relative w-full">
                    <div
                      className={`h-[38px] w-full bg-white dark:bg-[#030a16] border ${
                        isTfiOpen
                          ? "border-[#044CD0] ring-2 ring-[#044CD0]/20"
                          : selectedCompanies.length > 0
                          ? "border-blue-400 dark:border-[#044CD0]/60 bg-blue-50/70 dark:bg-[#044CD0]/10"
                          : "border-slate-300 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-[#19407a]"
                      } text-slate-800 dark:text-slate-200 font-sans font-medium text-xs sm:text-sm rounded-xl pl-3 pr-2.5 flex items-center justify-between gap-1 transition-all select-none shadow-2xs`}
                    >
                      <button
                        type="button"
                        id="tfi-select-btn"
                        aria-labelledby="tfi-select-label"
                        aria-haspopup="listbox"
                        aria-expanded={isTfiOpen}
                        onClick={() => setIsTfiOpen((prev) => !prev)}
                        className="flex-1 min-w-0 h-full flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
                      >
                        <span className="truncate" title={tfiTriggerTitle}>
                          {selectedCompanies.length === 0
                            ? t.catalog.allTfi
                            : selectedCompanies[0]}
                        </span>
                        {selectedCompanies.length > 1 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#044CD0] text-white text-[10px] font-bold shrink-0">
                            +{selectedCompanies.length - 1}
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1 shrink-0 text-slate-400">
                        {selectedCompanies.length > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedCompanies([]);
                                setCurrentPage(0);
                                setIsTfiOpen(false);
                              }}
                              title={t.catalog.clearTfi}
                              className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/60 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
                              aria-label={t.catalog.clearTfi}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-3.5 bg-slate-300 dark:bg-[#0e274d]" />
                          </>
                        )}
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-hidden="true"
                          onClick={() => setIsTfiOpen((prev) => !prev)}
                          className="p-1 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center focus:outline-none"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isTfiOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* TFI Popover */}
                    {isTfiOpen && (
                      <div
                        role="listbox"
                        aria-labelledby="tfi-select-label"
                        aria-multiselectable="true"
                        className="absolute top-full left-0 mt-1.5 w-full bg-white dark:bg-[#030c1c] border border-slate-200 dark:border-[#0e274d] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                      >
                        {/* Search TFI input */}
                        <div className="p-2 border-b border-slate-200 dark:border-[#0e274d] bg-slate-50/70 dark:bg-[#051329]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              placeholder={t.catalog.searchTfiPlaceholder}
                              value={tfiSearchTerm}
                              onChange={(e) => setTfiSearchTerm(e.target.value)}
                              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white dark:bg-[#030a16] border border-slate-300 dark:border-[#0e274d] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#044CD0]"
                            />
                            {tfiSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setTfiSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* TFI List */}
                        <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                          {/* All TFI option */}
                          <button
                            type="button"
                            role="option"
                            aria-selected={selectedCompanies.length === 0}
                            onClick={() => {
                              setSelectedCompanies([]);
                              setCurrentPage(0);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                              selectedCompanies.length === 0
                                ? "bg-blue-50 dark:bg-[#044CD0]/25 text-[#044CD0] dark:text-blue-300 font-semibold"
                                : "text-slate-700 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors ${
                                  selectedCompanies.length === 0
                                    ? "bg-[#044CD0] border border-[#044CD0] text-white"
                                    : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#051329]"
                                }`}
                              >
                                {selectedCompanies.length === 0 && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{t.catalog.allTfi}</span>
                            </div>
                          </button>

                          {filteredTfis.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-slate-400">
                              {locale === "en" ? "No matching TFI found" : "Brak wyników dla podanej frazy"}
                            </div>
                          ) : (
                            filteredTfis.map((company) => {
                              const isSelected = selectedCompanies.includes(company);
                              return (
                                <button
                                  key={company}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => toggleCompany(company)}
                                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                                    isSelected
                                      ? "bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-200 font-semibold"
                                      : "text-slate-700 dark:text-slate-300 hover:bg-blue-50/70 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                                    <div
                                      className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? "bg-[#044CD0] border border-[#044CD0] text-white"
                                          : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#051329]"
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span className="truncate">{company}</span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>

                        {/* TFI Footer */}
                        <div className="px-3 py-2 bg-slate-50 dark:bg-[#051329] border-t border-slate-200 dark:border-[#0e274d] flex items-center justify-between text-xs shrink-0 select-none">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {locale === "en" ? "Selected:" : "Wybrano:"}{" "}
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {selectedCompanies.length === 0
                                ? locale === "en"
                                  ? "All"
                                  : "Wszystkie"
                                : selectedCompanies.length}
                            </strong>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {selectedCompanies.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompanies([]);
                                  setCurrentPage(0);
                                }}
                                className="px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                              >
                                {t.common.clear}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setIsTfiOpen(false)}
                              className="px-3 py-1 rounded-lg bg-[#044CD0] hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer shadow-xs"
                            >
                              {locale === "en" ? "Done" : "Gotowe"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Kategoria szczegółowa */}
                <div className="space-y-1.5">
                  <label id="detailed-category-label" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.catalog.detailedCategory}
                  </label>
                  <div ref={categoryDropdownRef} className="relative w-full">
                {/* Custom Trigger Container */}
                <div
                  className={`h-[38px] w-full bg-white dark:bg-[#051329] border ${
                    isCategoryOpen
                      ? "border-[#044CD0] ring-2 ring-[#044CD0]/20"
                      : selectedCategories.length > 0
                      ? "border-blue-400 dark:border-[#044CD0]/60 bg-blue-50/70 dark:bg-[#044CD0]/10"
                      : "border-slate-300 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-[#19407a]"
                  } text-slate-800 dark:text-slate-200 font-sans font-medium text-xs sm:text-sm rounded-xl pl-3 pr-2.5 flex items-center justify-between gap-1 transition-all select-none shadow-2xs`}
                >
                  {/* Left Clickable Area: Opens/Closes Dropdown */}
                  <button
                    type="button"
                    id="detailed-category-select"
                    aria-labelledby="detailed-category-label"
                    aria-haspopup="listbox"
                    aria-expanded={isCategoryOpen}
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className="flex-1 min-w-0 h-full flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="truncate" title={categoryTriggerTitle}>
                      {selectedCategories.length === 0
                        ? t.catalog.allCategories
                        : getCategoryLabel(selectedCategories[0], locale === "en")}
                    </span>
                    {selectedCategories.length > 1 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#044CD0] text-white text-[10px] font-bold shrink-0">
                        +{selectedCategories.length - 1}
                      </span>
                    )}
                  </button>

                  {/* Right Actions Area: Separate Clear Button & Chevron */}
                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {selectedCategories.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedCategories([]);
                            setCurrentPage(0);
                            setIsCategoryOpen(false);
                          }}
                          title={t.catalog.clearCategory}
                          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/60 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
                          aria-label={t.catalog.clearCategory}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3.5 bg-slate-300 dark:bg-[#0e274d]" />
                      </>
                    )}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={() => setIsCategoryOpen((prev) => !prev)}
                      className="p-1 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center focus:outline-none"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isCategoryOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu Popover */}
                {isCategoryOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="detailed-category-label"
                    aria-multiselectable="true"
                    className="absolute top-full left-0 mt-1.5 w-full sm:w-[420px] bg-white dark:bg-[#030c1c] border border-slate-200 dark:border-[#0e274d] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Scrollable Items Container */}
                    <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                      {/* Option: All categories (resets multi-selection) */}
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCategories.length === 0}
                        onClick={() => {
                          setSelectedCategories([]);
                          setCurrentPage(0);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                          selectedCategories.length === 0
                            ? "bg-blue-50 dark:bg-[#044CD0]/25 text-[#044CD0] dark:text-blue-300 font-semibold"
                            : "text-slate-700 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors ${
                              selectedCategories.length === 0
                                ? "bg-[#044CD0] border border-[#044CD0] text-white"
                                : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#051329]"
                            }`}
                          >
                            {selectedCategories.length === 0 && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{t.catalog.allCategories}</span>
                        </div>
                      </button>

                      {/* Grouped categories */}
                      {visibleCategoryGroups.map((grp) => (
                        <div key={grp.classId} className="pt-1.5 border-t border-slate-100 dark:border-[#0e274d]/50 first:border-t-0">
                          {/* Group Header - unclickable, highlighted and distinct for eye scanning */}
                          <div className="px-3 py-1.5 text-[11px] font-bold text-[#044CD0] dark:text-[#60a5fa] uppercase tracking-wide select-none">
                            {locale === "en" ? grp.groupEn : grp.groupPl}
                          </div>

                          {/* Options under this group */}
                          <div className="space-y-0.5">
                            {grp.options.map((opt) => {
                              const isSelected = selectedCategories.includes(opt.id);
                              const label = locale === "en" ? opt.labelEn : opt.labelPl;

                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => toggleCategory(opt.id)}
                                  className={`w-full text-left pl-3 pr-3 py-1.5 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                                    isSelected
                                      ? "bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-200 font-semibold"
                                      : "text-slate-700 dark:text-slate-300 hover:bg-blue-50/70 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                                    <div
                                      className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? "bg-[#044CD0] border border-[#044CD0] text-white"
                                          : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#051329]"
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span className="truncate">{label}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Popover solid footer pinned to bottom (no gap, no bleed) */}
                    <div data-component="category-dropdown-footer" className="px-3 py-2 bg-slate-50 dark:bg-[#051329] border-t border-slate-200 dark:border-[#0e274d] flex items-center justify-between text-xs shrink-0 select-none">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {locale === "en" ? "Selected:" : "Wybrano:"}{" "}
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {selectedCategories.length === 0
                            ? locale === "en"
                              ? "All"
                              : "Wszystkie"
                            : selectedCategories.length}
                        </strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {selectedCategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategories([]);
                              setCurrentPage(0);
                            }}
                            className="px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                          >
                            {t.common.clear}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsCategoryOpen(false)}
                          className="px-3 py-1 rounded-lg bg-[#044CD0] hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer shadow-xs"
                        >
                          {locale === "en" ? "Done" : "Gotowe"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: SRI Risk Profile & Cost Slider */}
          <div className="space-y-3.5 bg-white dark:bg-[#051329] p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-[#0e274d]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#3b82f6]" />
              <span>{t.catalog.filterSectionRiskFee}</span>
            </div>

            {/* SRI Risk Profile (Pills 1 to 7) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.catalog.sriFilterLabel}
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {t.catalog.sriFilterHint}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => toggleSri(0)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSri.length === 0
                      ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-[#030a16] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#0e274d]"
                  }`}
                >
                  {t.catalog.sriAll}
                </button>
                {SRI_LEVELS.map((sri) => {
                  const isSelected = selectedSri.includes(sri.level);
                  return (
                    <button
                      key={sri.level}
                      type="button"
                      onClick={() => toggleSri(sri.level)}
                      aria-pressed={isSelected}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? `${sri.color} text-white shadow-md scale-105 ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-[#051329]`
                          : `bg-slate-100 dark:bg-[#030a16] ${sri.text} hover:opacity-100 opacity-80 border border-slate-200 dark:border-[#0e274d]`
                      }`}
                      title={`SRI ${sri.level}`}
                    >
                      {sri.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Management Fee Max Slider + Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#3b82f6]" />
                  <span>{t.catalog.feeFilterLabel}</span>
                </label>
                <span className="text-xs font-bold text-[#044CD0] dark:text-blue-300">
                  {maxFee === null
                    ? t.catalog.feeAny
                    : t.catalog.feeSliderValue.replace("{val}", maxFee.toFixed(2).replace(".", ","))}
                </span>
              </div>

              {/* Range Slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={maxFee === null ? 3.0 : maxFee}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMaxFee(val >= 3.0 ? null : val);
                    setCurrentPage(0);
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#044CD0]"
                />
              </div>

              {/* Quick Fee Presets */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setMaxFee(null);
                    setCurrentPage(0);
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    maxFee === null
                      ? "bg-[#044CD0] text-white shadow-xs font-bold"
                      : "bg-slate-100 dark:bg-[#030a16] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#0e274d]"
                  }`}
                >
                  {t.catalog.feePresets.any}
                </button>
                {[0.5, 1.0, 1.5, 2.0].map((presetVal) => {
                  const isSelected = maxFee === presetVal;
                  return (
                    <button
                      key={presetVal}
                      type="button"
                      onClick={() => {
                        setMaxFee(isSelected ? null : presetVal);
                        setCurrentPage(0);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#044CD0] text-white shadow-xs font-bold"
                          : "bg-slate-100 dark:bg-[#030a16] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#0e274d]"
                      }`}
                    >
                      ≤ {presetVal.toFixed(1).replace(".", ",")}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Status & Profitability Toggles */}
        <div className="pt-2 border-t border-slate-200 dark:border-[#0e274d]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#3b82f6]" />
            <span>{t.catalog.filterSectionStatus}</span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            {/* 1. Only profitable funds toggle */}
            <label
              className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm cursor-pointer select-none transition-all shadow-2xs ${
                onlyProfitable
                  ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30"
                  : "border-slate-200/90 dark:border-[#0e274d] bg-white dark:bg-[#030a16]/60 hover:bg-slate-50 dark:hover:bg-[#071938] hover:border-slate-300 dark:hover:border-[#1e3a6a]"
              }`}
              title={t.catalog.onlyProfitableDesc.replace("{period}", activePeriodLabel)}
            >
              <input
                type="checkbox"
                checked={onlyProfitable}
                onChange={(e) => {
                  setOnlyProfitable(e.target.checked);
                  setCurrentPage(0);
                }}
                className="sr-only peer"
              />
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 ${
                  onlyProfitable ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    onlyProfitable ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`whitespace-nowrap transition-colors ${
                  onlyProfitable
                    ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium"
                }`}
              >
                {t.catalog.onlyProfitable} ({activePeriodLabel})
              </span>
            </label>

            {/* 2. Fundusze w likwidacji */}
            <label
              className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm cursor-pointer select-none transition-all shadow-2xs ${
                includeLiquidating
                  ? "border-blue-300 dark:border-blue-800/80 bg-blue-50/60 dark:bg-[#044CD0]/15"
                  : "border-slate-200/90 dark:border-[#0e274d] bg-white dark:bg-[#030a16]/60 hover:bg-slate-50 dark:hover:bg-[#071938] hover:border-slate-300 dark:hover:border-[#1e3a6a]"
              }`}
            >
              <input
                type="checkbox"
                checked={includeLiquidating}
                onChange={(e) => {
                  setIncludeLiquidating(e.target.checked);
                  setCurrentPage(0);
                }}
                className="sr-only peer"
              />
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out peer-focus-visible:ring-2 peer-focus-visible:ring-[#044CD0] peer-focus-visible:ring-offset-2 ${
                  includeLiquidating ? "bg-[#044CD0]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    includeLiquidating ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`whitespace-nowrap transition-colors ${
                  includeLiquidating
                    ? "text-[#044CD0] dark:text-blue-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium"
                }`}
              >
                {t.catalog.showLiquidating}
              </span>
            </label>

            {/* 3. Fundusze nieaktywne */}
            <label
              className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm cursor-pointer select-none transition-all shadow-2xs ${
                includeInactive
                  ? "border-blue-300 dark:border-blue-800/80 bg-blue-50/60 dark:bg-[#044CD0]/15"
                  : "border-slate-200/90 dark:border-[#0e274d] bg-white dark:bg-[#030a16]/60 hover:bg-slate-50 dark:hover:bg-[#071938] hover:border-slate-300 dark:hover:border-[#1e3a6a]"
              }`}
            >
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => {
                  setIncludeInactive(e.target.checked);
                  setCurrentPage(0);
                }}
                className="sr-only peer"
              />
              <div
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out peer-focus-visible:ring-2 peer-focus-visible:ring-[#044CD0] peer-focus-visible:ring-offset-2 ${
                  includeInactive ? "bg-[#044CD0]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    includeInactive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`whitespace-nowrap transition-colors ${
                  includeInactive
                    ? "text-[#044CD0] dark:text-blue-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium"
                }`}
              >
                {t.catalog.showInactive}
              </span>
            </label>
          </div>
        </div>
      </div>
    )}
      </div>

      {/* Results Header & Presentation Controls */}
      <div ref={resultsTopRef} className="space-y-2.5 px-1 scroll-mt-24">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {/* Left: Results Count, Page Info & Filtering Status */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <span>
              {t.catalog.foundCount}{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {formatNumber(pageInfo.totalElements, 0)}
              </strong>{" "}
              {t.catalog.subfundsCount}
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              {t.common.page}{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-medium">
                {pageInfo.number + 1}
              </strong>{" "}
              {t.common.of}{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-medium">
                {Math.max(1, pageInfo.totalPages)}
              </strong>
            </span>
            {isPending && (
              <span className="inline-flex items-center gap-1 text-[#3b82f6]">
                <RefreshCw className="w-3 h-3 animate-spin" /> {t.common.filtering}
              </span>
            )}
          </div>

          {/* Right: Integrated Sort Dropdown & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full xl:w-auto justify-between sm:justify-start xl:justify-end">
            {/* Period Switcher */}
            <div className="h-[38px] w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-white dark:bg-[#030a16] border border-slate-300 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-[#044CD0]/60 px-2 sm:px-2.5 rounded-xl transition-colors shadow-2xs">
              <div className="flex items-center gap-1 select-none shrink-0" title={t.catalog.returnPeriodLabel}>
                <TrendingUp className="w-3.5 h-3.5 text-[#044CD0] shrink-0" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {t.catalog.returnPeriodLabel}
                </span>
              </div>
              <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
                {RETURN_PERIODS.map((p) => {
                  const isSelected = returnPeriod === p.id;
                  const label = locale === "en" ? p.labelEn : p.labelPl;
                  const fullLabel = locale === "en" ? p.fullEn : p.fullPl;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePeriodChange(p.id)}
                      aria-pressed={isSelected}
                      className={`px-1.5 sm:px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-[#044CD0] text-white shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#071938]"
                      }`}
                      title={fullLabel}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls Cluster: Sort Dropdown + View Mode Switcher */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
              {/* Modern Custom Sort Dropdown */}
              <div ref={sortDropdownRef} className="relative flex-1 sm:flex-none">
                <button
                  type="button"
                  id="catalog-sort-button"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className={`h-[38px] w-full sm:w-auto flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl border transition-all cursor-pointer select-none shadow-2xs ${
                    isSortOpen
                      ? "border-[#044CD0] ring-2 ring-[#044CD0]/20 bg-blue-50/50 dark:bg-[#044CD0]/15"
                      : "bg-white dark:bg-[#030a16] border-slate-300 dark:border-[#0e274d] hover:border-[#044CD0] dark:hover:border-[#044CD0]/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#044CD0] shrink-0" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden 2xl:inline whitespace-nowrap">
                      {t.catalog.sort.label}:
                    </span>
                    <span
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[185px] text-left"
                      title={currentSortLabel}
                    >
                      {currentSortLabel}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isSortOpen ? "rotate-180 text-[#044CD0] dark:text-[#3b82f6]" : ""
                    }`}
                  />
                </button>

                {/* Popover Listbox */}
                {isSortOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="catalog-sort-button"
                    data-component="catalog-sort-popover"
                    className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1.5 w-full sm:w-[285px] bg-white dark:bg-[#030c1c] border border-slate-200 dark:border-[#0e274d] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] sm:max-h-96 overflow-y-auto p-1.5"
                  >
                    {sortGroups.map((grp) => (
                      <div
                        key={grp.id}
                        className="border-t border-slate-100 dark:border-[#0e274d]/50 first:border-t-0 pt-1 mt-1 first:pt-0 first:mt-0 space-y-0.5 bg-transparent"
                      >
                        {grp.options.map((opt) => {
                          const isSelected = currentSortValue === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                handleCombinedSortChange(opt.value);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-200 font-semibold"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white"
                              }`}
                            >
                              <span className="truncate pr-2">{opt.label}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 stroke-[3] text-[#044CD0] dark:text-[#3b82f6] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white dark:bg-[#030a16] p-1 rounded-xl border border-slate-300 dark:border-[#0e274d] shrink-0 shadow-2xs">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  aria-pressed={viewMode === "grid"}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#044CD0] text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-[#044CD0] dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#071938]"
                  }`}
                  title={t.catalog.viewModeGrid}
                  aria-label={t.catalog.viewModeGrid}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange("table")}
                  aria-pressed={viewMode === "table"}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-[#044CD0] text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-[#044CD0] dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#071938]"
                  }`}
                  title={t.catalog.viewModeTable}
                  aria-label={t.catalog.viewModeTable}
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips (one-click dismissible tags) */}
        {hasAnyActiveFilters && (
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            {/* Umbrella fund (Parasol) chip */}
            {fundId && (
              <button
                type="button"
                onClick={clearUmbrellaFundFilter}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${fundName || `Parasol ID ${fundId}`}`}
              >
                <span className="truncate max-w-[200px] sm:max-w-[260px]">
                  Parasol: {fundName || `ID ${fundId}`}
                </span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            {/* Classification chips */}
            {selectedClassifications.map((clsId) => {
              const label =
                clsId === "akcji"
                  ? t.catalog.classes.akcji
                  : clsId === "dłużn"
                  ? t.catalog.classes.dłużn
                  : clsId === "mieszan"
                  ? t.catalog.classes.mieszan
                  : clsId === "PPK"
                  ? t.catalog.classes.PPK
                  : t.catalog.classes.alternatyw;
              return (
                <button
                  key={clsId}
                  type="button"
                  onClick={() => toggleClassification(clsId)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                  title={`Usuń: ${label}`}
                >
                  <span>{label}</span>
                  <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                </button>
              );
            })}

            {/* Legal Type chips */}
            {selectedTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${type}`}
              >
                <span>{type}</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            ))}

            {/* Currency chips */}
            {selectedCurrencies.map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => toggleCurrency(curr)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${curr}`}
              >
                <span>{curr}</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            ))}

            {/* Category chips */}
            {selectedCategories.map((catId) => (
              <button
                key={catId}
                type="button"
                onClick={() => toggleCategory(catId)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${getCategoryLabel(catId, locale === "en")}`}
              >
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {getCategoryLabel(catId, locale === "en")}
                </span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            ))}

            {/* TFI Company chips */}
            {selectedCompanies.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => toggleCompany(comp)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${comp}`}
              >
                <span className="truncate max-w-[150px] sm:max-w-[220px]">
                  {t.catalog.tfiTagLabel} {comp}
                </span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            ))}

            {/* SRI risk chips */}
            {selectedSri.map((sri) => (
              <button
                key={sri}
                type="button"
                onClick={() => toggleSri(sri)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: SRI ${sri}`}
              >
                <span>{t.catalog.sriTagLabel} {sri}</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            ))}

            {/* Max fee chip */}
            {maxFee !== null && (
              <button
                type="button"
                onClick={() => {
                  setMaxFee(null);
                  setCurrentPage(0);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title="Usuń limit opłaty"
              >
                <span>{t.catalog.feeTagLabel} ≤ {maxFee.toFixed(2).replace(".", ",")}%</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            {/* Only profitable funds chip */}
            {onlyProfitable && (
              <button
                type="button"
                onClick={() => {
                  setOnlyProfitable(false);
                  setCurrentPage(0);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title="Usuń filtr dodatniego wyniku"
              >
                <span>{t.catalog.profitableTagLabel} ({activePeriodLabel})</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            {/* Liquidating & Inactive chips */}
            {includeLiquidating && (
              <button
                type="button"
                onClick={() => {
                  setIncludeLiquidating(false);
                  setCurrentPage(0);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200/80 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${t.catalog.showLiquidating}`}
              >
                <span>{t.catalog.showLiquidating}</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            {includeInactive && (
              <button
                type="button"
                onClick={() => {
                  setIncludeInactive(false);
                  setCurrentPage(0);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-[#044CD0]/20 text-[#044CD0] dark:text-blue-300 border border-blue-200/80 dark:border-[#044CD0]/40 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group shadow-2xs"
                title={`Usuń: ${t.catalog.showInactive}`}
              >
                <span>{t.catalog.showInactive}</span>
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            {/* Reset All Filters button */}
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold hover:underline cursor-pointer ml-1 select-none py-1 px-1.5"
              title={t.catalog.clearAllFilters}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.catalog.clearAllFilters}</span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode: Empty State / Cards Grid / Interactive Table */}
      {processedItems.length === 0 ? (
        <div className="bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-[#071938] flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.catalog.noResultsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.catalog.noResultsDesc}
            </p>
          </div>
          {hasAnyActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#044CD0] hover:bg-blue-600 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.catalog.clearAllFilters}</span>
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedItems.map((item) => {
            const inCompare = isSelected(item.subfundId);
            const inPortfolio = isInPortfolio(item.subfundId);

            return (
              <div
                key={item.subfundId}
                className="catalog-grid-card group relative bg-white dark:bg-[#051329] hover:bg-slate-50/70 dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] hover:border-[#044CD0]/60 rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-md dark:shadow-md dark:hover:shadow-xl"
              >
                <div>
                  {/* Top Header: Fund Name + Status Badge in Top-Right Corner */}
                  <div className="flex items-start justify-between gap-2.5 mb-1.5">
                    <Link
                      href={`/fundusze/${item.subfundId}`}
                      title={item.name}
                      className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-[#044CD0] dark:group-hover:text-[#60a5fa] transition-colors line-clamp-2 leading-snug break-words flex-1 min-w-0"
                    >
                      {item.name}
                    </Link>

                    <div className="shrink-0 pt-0.5">
                      <StatusBadge
                        compact={true}
                        isActive={item.isActive}
                        isLiquidating={item.isLiquidating}
                        liquidationStartDate={item.liquidationStartDate}
                        liquidationEndDate={item.liquidationEndDate}
                      />
                    </div>
                  </div>

                  {/* Typ funduszu + Nazwa TFI + Parasol */}
                  <div className="flex items-center gap-1.5 mb-2 leading-normal flex-wrap">
                    <span className="fund-type-badge inline-flex items-center font-bold text-[10px] leading-none bg-slate-100 dark:bg-[#030a16] border border-slate-300/80 dark:border-[#0e274d] px-1.5 py-0.5 rounded text-black dark:text-blue-300 shadow-2xs shrink-0 uppercase tracking-wider">
                      {getDisplayType(item)}
                    </span>
                    {item.companyName && (
                      <span
                        title={item.companyName}
                        className="text-[11px] sm:text-xs leading-normal font-medium text-slate-600 dark:text-slate-300 truncate max-w-[180px] sm:max-w-[220px]"
                      >
                        {item.companyName}
                      </span>
                    )}
                    {item.fundName && !item.isFundOnly && item.fundName.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600 text-xs select-none">•</span>
                        <span
                          title={item.fundName}
                          className="text-[11px] sm:text-xs leading-normal font-normal text-slate-400 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[220px]"
                        >
                          {item.fundName}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Klasa aktywów i kategoria w jednej linii */}
                  <div className="flex items-center gap-1.5 mb-3.5 leading-normal flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100/90 dark:bg-[#030a16] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-[#0e274d] shadow-2xs shrink-0">
                      <Compass className="w-3 h-3 text-[#044CD0] dark:text-[#3b82f6] shrink-0" />
                      <span className="capitalize">
                        {item.classification || item.category || (locale === "en" ? "Fund" : "Fundusz")}
                      </span>
                    </span>

                    {item.category && item.classification && item.category.trim().toLowerCase() !== item.classification.trim().toLowerCase() && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600 text-xs select-none">•</span>
                        <span
                          title={item.category || undefined}
                          className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[190px] sm:max-w-[230px]"
                        >
                          {item.category}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Metrics Box: 3 Key Indicators + Valuation & AUM */}
                  <div className="bg-slate-50/70 dark:bg-[#030a16]/60 border border-slate-200/70 dark:border-[#0e274d]/70 rounded-xl p-3 mb-4 space-y-2.5">
                    {/* Top 3 Indicators: Risk, Fee, Return */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {/* 1. Risk (SRI stacked dots and level matching table) */}
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] block truncate font-medium">
                          {t.catalog.card.riskProfile}
                        </span>
                        <div className="mt-1">
                          <RiskBadge level={item.riskLevel} showLabel={false} showSriPrefix={false} stacked={true} align="start" size="sm" />
                        </div>
                      </div>

                      {/* 2. Management Fee */}
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] block truncate font-medium">
                          {t.catalog.card.ongoingCharge}
                        </span>
                        <div className="mt-1">
                          <span
                            className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                            title={t.catalog.table.ongoingFeeTooltip}
                          >
                            {formatPercent(item.managementFee)}
                          </span>
                          {item.transactionCostsRate !== null && item.transactionCostsRate !== undefined && (
                            <span
                              className="block text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5"
                              title={t.catalog.table.transactionCostsTooltip}
                            >
                              +{formatPercent(item.transactionCostsRate)} tr.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3. Return Rate */}
                      <div>
                        <span
                          className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] block truncate font-medium cursor-help"
                          title={activePeriodFullLabel}
                        >
                          {locale === "en" ? "Return" : "Wynik"}{" "}
                          <span className="font-semibold text-slate-500 dark:text-slate-400">({activePeriodLabel})</span>
                        </span>
                        <div className="mt-1">
                          {renderReturnBadge(item, returnPeriod)}
                        </div>
                      </div>
                    </div>

                    {/* Valuation & Net Assets (AUM) */}
                    {(item.latestValuation !== null || item.netAssets !== null) && (
                      <div className="border-t border-slate-200/80 dark:border-[#0e274d]/80 pt-2 space-y-1.5 text-[11px]">
                        {/* Latest Valuation */}
                        {item.latestValuation !== null && item.latestValuation !== undefined && (
                          <div className="flex items-center justify-between gap-1 text-slate-500 dark:text-slate-400">
                            <span className="truncate">{t.catalog.card.latestValuation}</span>
                            <span className="inline-flex items-baseline gap-1 shrink-0">
                              <FormattedCurrency
                                value={item.latestValuation}
                                currency={item.currency}
                                valueClassName="font-bold text-slate-900 dark:text-slate-200 text-xs"
                                unitClassName="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                              />
                              {item.latestValuationDate && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  ({formatDate(item.latestValuationDate)})
                                </span>
                              )}
                              {item.currency && item.currency !== "PLN" && item.latestValuationPln && (
                                <span
                                  className="text-[10px] text-blue-600 dark:text-blue-400 font-medium ml-0.5"
                                  title={
                                    item.fxRate
                                      ? t.catalog.fxTooltip
                                          .replace("{curr}", item.currency)
                                          .replace("{rate}", formatNumber(item.fxRate, 4))
                                      : undefined
                                  }
                                >
                                  (≈ {formatCurrency(item.latestValuationPln, "PLN")})
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Net Assets (AUM) */}
                        {item.netAssets !== null && item.netAssets !== undefined && (
                          <div className="flex items-center justify-between gap-1 text-slate-500 dark:text-slate-400">
                            <span className="truncate">{t.catalog.card.netAssets}</span>
                            <span className="inline-flex items-baseline gap-1 shrink-0">
                              <FormattedLargeNumber
                                value={item.netAssets}
                                currency={item.currency}
                                valueClassName="font-bold text-slate-900 dark:text-slate-200 text-xs"
                                unitClassName="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                              />
                              {item.netAssetsDate && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  ({formatDate(item.netAssetsDate)})
                                </span>
                              )}
                              {item.currency && item.currency !== "PLN" && item.netAssetsPln && (
                                <span
                                  className="text-[10px] text-blue-600 dark:text-blue-400 font-medium ml-0.5"
                                  title={
                                    item.fxRate
                                      ? t.catalog.fxTooltip
                                          .replace("{curr}", item.currency)
                                          .replace("{rate}", formatNumber(item.fxRate, 4))
                                      : undefined
                                  }
                                >
                                  (≈ {formatLargeNumber(item.netAssetsPln, "PLN")})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-[#0e274d]/80 mt-auto">
                  <Link
                    href={`/fundusze/${item.subfundId}`}
                    data-component="fund-details-btn"
                    className="flex-1 h-10 flex items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50/70 dark:bg-[#030a16] dark:hover:bg-[#071938] text-slate-800 dark:text-slate-200 hover:text-[#044CD0] dark:hover:text-white border border-slate-200 dark:border-[#0e274d] hover:border-blue-300 dark:hover:border-slate-600 transition-all shadow-2xs cursor-pointer"
                  >
                    {t.catalog.card.fundDetails}
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      toggleFund({
                        subfundId: item.subfundId,
                        name: item.name,
                        type: getDisplayType(item),
                        category: item.category,
                      })
                    }
                    aria-pressed={inCompare}
                    className={`table-action-btn w-10 h-10 flex items-center justify-center rounded-xl text-xs font-medium border transition-all shadow-2xs shrink-0 cursor-pointer ${
                      inCompare
                        ? "bg-[#044CD0] text-white border-[#044CD0] shadow-xs"
                        : "bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-400 border-slate-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-[#044CD0] dark:hover:border-blue-500/50 hover:bg-blue-50/70 dark:hover:bg-[#071938]"
                    }`}
                    title={inCompare ? t.catalog.card.removeFromCompare : t.catalog.card.addToCompare}
                    aria-label={inCompare ? t.catalog.card.removeFromCompare : t.catalog.card.addToCompare}
                  >
                    <Scale className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      togglePortfolioFund({
                        subfundId: item.subfundId,
                        name: item.name,
                        type: getDisplayType(item),
                        category: item.category,
                      })
                    }
                    aria-pressed={inPortfolio}
                    className={`table-action-btn w-10 h-10 flex items-center justify-center rounded-xl text-xs font-medium border transition-all shadow-2xs shrink-0 cursor-pointer ${
                      inPortfolio
                        ? "bg-[#044CD0] text-white border-[#044CD0] shadow-xs"
                        : "bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-400 border-slate-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-[#044CD0] dark:hover:border-blue-500/50 hover:bg-blue-50/70 dark:hover:bg-[#071938]"
                    }`}
                    title={inPortfolio ? t.portfolio.removeFromPortfolio : t.portfolio.addToPortfolio}
                    aria-label={inPortfolio ? t.portfolio.removeFromPortfolio : t.portfolio.addToPortfolio}
                  >
                    <Briefcase className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: Interactive Table with Clickable Column Headers */
        <div className="catalog-table-container relative bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
          {/* Mobile horizontal scroll hint */}
          <div className="md:hidden px-3.5 py-2 bg-slate-50 dark:bg-[#030a16] border-b border-slate-200 dark:border-[#0e274d] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-[#044CD0] dark:text-[#60a5fa]">↔</span>
              <span>{t.catalog.horizontalScrollHint}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse bg-transparent">
              <thead className="bg-slate-50 dark:bg-[#030a16] text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#0e274d]">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3 px-3.5 sm:px-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group min-w-[240px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.catalog.table.name}</span>
                      {sortField === "name" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3 font-bold leading-tight min-w-[120px] max-w-[160px]">
                    <div>
                      <span>{locale === "en" ? "Asset" : "Klasa"}</span>
                      <span className="block">{locale === "en" ? "Class" : "aktywów"}</span>
                    </div>
                  </th>
                  <th className="py-3 px-2 font-bold whitespace-nowrap text-center w-[54px] min-w-[54px]">{t.catalog.table.status}</th>
                  <th
                    onClick={() => handleSort("risk")}
                    className="py-3 px-2 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group leading-tight w-[72px] min-w-[72px] text-center"
                    title={`${locale === "en" ? "Risk Level" : "Poziom ryzyka"} (SRI 1-7)`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-center font-bold">
                        <span>{locale === "en" ? "Risk" : "Ryzyko"}</span>
                        <span className="block font-bold">(SRI)</span>
                      </div>
                      {sortField === "risk" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("fee")}
                    className="py-3 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group leading-tight min-w-[85px]"
                    title={
                      locale === "en"
                        ? "Fees: ongoing + transaction"
                        : "Opłaty: stała + transakcyjna"
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span>{t.catalog.table.fee}</span>
                      {sortField === "fee" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("return")}
                    className="py-3 px-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group leading-tight min-w-[88px]"
                    title={`${t.catalog.table.returnRate} (${activePeriodFullLabel})`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="leading-tight">
                        <span>{locale === "en" ? "Return" : "Wynik"}</span>
                        <span className="block font-bold">
                          ({activePeriodLabel})
                        </span>
                      </div>
                      {sortField === "return" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("valuation")}
                    className="py-3 px-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group leading-tight min-w-[105px]"
                  >
                    <div className="flex items-center gap-1">
                      <div>
                        <span>{locale === "en" ? "Latest" : "Ostatnia"}</span>
                        <span className="block">{locale === "en" ? "NAV" : "wycena"}</span>
                      </div>
                      {sortField === "valuation" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("assets")}
                    className="py-3 px-3.5 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group leading-tight min-w-[105px]"
                    title={t.catalog.table.netAssets}
                  >
                    <div className="flex items-center gap-1">
                      <div>
                        <span>{locale === "en" ? "Net" : "Aktywa"}</span>
                        <span className="block">{locale === "en" ? "Assets" : "netto"}</span>
                      </div>
                      {sortField === "assets" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#60a5fa] stroke-[2.5] shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-right font-bold whitespace-nowrap w-[136px] min-w-[136px]">
                    <span className="sr-only">{t.catalog.table.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#0e274d]/70 text-slate-800 dark:text-slate-300">
                {processedItems.map((item) => {
                  const inCompare = isSelected(item.subfundId);
                  const inPortfolio = isInPortfolio(item.subfundId);

                  return (
                    <tr
                      key={item.subfundId}
                      className="bg-white dark:bg-transparent hover:bg-blue-50/60 dark:hover:bg-[#071938]/70 transition-colors group"
                    >
                      <td className="py-3 px-3.5 sm:px-4 min-w-[240px]">
                        <Link
                          href={`/fundusze/${item.subfundId}`}
                          title={item.name}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#044CD0] dark:hover:text-[#60a5fa] transition-colors block line-clamp-2 leading-snug break-words text-xs sm:text-sm"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1.5 leading-normal flex-wrap">
                          <span className="fund-type-badge inline-flex items-center font-bold text-[10px] leading-none bg-slate-100 dark:bg-[#030a16] border border-slate-300/80 dark:border-[#0e274d] px-1.5 py-0.5 rounded text-black dark:text-blue-300 shadow-2xs shrink-0 uppercase tracking-wider">
                            {getDisplayType(item)}
                          </span>
                          {item.companyName && (
                            <span
                              title={item.companyName}
                              className="text-[11px] sm:text-xs leading-normal font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px] sm:max-w-[210px]"
                            >
                              {item.companyName}
                            </span>
                          )}
                          {item.fundName && !item.isFundOnly && item.fundName.trim().toLowerCase() !== item.name.trim().toLowerCase() && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600 text-xs select-none">•</span>
                              <span
                                title={item.fundName}
                                className="text-[11px] sm:text-xs leading-normal font-normal text-slate-400 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[230px]"
                              >
                                {item.fundName}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 min-w-[120px] max-w-[160px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs capitalize leading-tight">
                          {item.classification || "—"}
                        </div>
                        {item.category && item.category.trim().toLowerCase() !== (item.classification || "").trim().toLowerCase() && (
                          <div
                            title={item.category}
                            className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2 break-words"
                          >
                            {item.category}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap w-[54px] min-w-[54px]">
                        <StatusBadge
                          compact={true}
                          isActive={item.isActive}
                          isLiquidating={item.isLiquidating}
                          liquidationStartDate={item.liquidationStartDate}
                          liquidationEndDate={item.liquidationEndDate}
                        />
                      </td>
                      <td className="py-3 px-2 text-center whitespace-nowrap w-[72px] min-w-[72px]">
                        <RiskBadge level={item.riskLevel} showLabel={false} showSriPrefix={false} stacked={true} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap min-w-[85px]">
                        <div
                          className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-tight"
                          title={t.catalog.table.ongoingFeeTooltip}
                        >
                          {formatPercent(item.managementFee)}
                        </div>
                        {item.transactionCostsRate !== null && item.transactionCostsRate !== undefined && (
                          <div
                            className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap leading-tight"
                            title={t.catalog.table.transactionCostsTooltip}
                          >
                            +{formatPercent(item.transactionCostsRate)} tr.
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap min-w-[88px]">
                        {renderReturnBadge(item, returnPeriod)}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap min-w-[105px]">
                        {item.latestValuation ? (
                          <div>
                            <FormattedCurrency
                              value={item.latestValuation}
                              currency={item.currency}
                              valueClassName="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                              unitClassName="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                            />
                            {item.currency && item.currency !== "PLN" && item.latestValuationPln && (
                              <div
                                className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-tight mt-0.5"
                                title={
                                  item.fxRate
                                    ? t.catalog.fxTooltip
                                        .replace("{curr}", item.currency)
                                        .replace("{rate}", formatNumber(item.fxRate, 4))
                                    : undefined
                                }
                              >
                                ≈ {formatCurrency(item.latestValuationPln, "PLN")}
                              </div>
                            )}
                            {item.latestValuationDate && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                                {formatDate(item.latestValuationDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap min-w-[105px]">
                        {item.netAssets !== null && item.netAssets !== undefined ? (
                          <div>
                            <FormattedLargeNumber
                              value={item.netAssets}
                              currency={item.currency}
                              valueClassName="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
                              unitClassName="text-[10px] font-medium text-slate-500 dark:text-slate-400"
                            />
                            {item.currency && item.currency !== "PLN" && item.netAssetsPln && (
                              <div
                                className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-tight mt-0.5"
                                title={
                                  item.fxRate
                                    ? t.catalog.fxTooltip
                                        .replace("{curr}", item.currency)
                                        .replace("{rate}", formatNumber(item.fxRate, 4))
                                    : undefined
                                }
                              >
                                ≈ {formatLargeNumber(item.netAssetsPln, "PLN")}
                              </div>
                            )}
                            {item.netAssetsDate && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                                {formatDate(item.netAssetsDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap w-[136px] min-w-[136px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleFund({
                                subfundId: item.subfundId,
                                name: item.name,
                                type: getDisplayType(item),
                                category: item.category,
                              })
                            }
                            aria-pressed={inCompare}
                            className={`table-action-btn w-9 h-9 flex items-center justify-center rounded-xl border text-xs transition-all shadow-2xs cursor-pointer ${
                              inCompare
                                ? "bg-[#044CD0] text-white border-[#044CD0] shadow-xs"
                                : "bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-400 border-slate-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-[#044CD0] dark:hover:border-blue-500/50 hover:bg-blue-50/70 dark:hover:bg-[#071938]"
                            }`}
                            title={inCompare ? t.catalog.card.removeFromCompare : t.common.compare}
                            aria-label={inCompare ? t.catalog.card.removeFromCompare : t.common.compare}
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              togglePortfolioFund({
                                subfundId: item.subfundId,
                                name: item.name,
                                type: getDisplayType(item),
                                category: item.category,
                              })
                            }
                            aria-pressed={inPortfolio}
                            className={`table-action-btn w-9 h-9 flex items-center justify-center rounded-xl border text-xs transition-all shadow-2xs cursor-pointer ${
                              inPortfolio
                                ? "bg-[#044CD0] text-white border-[#044CD0] shadow-xs"
                                : "bg-white dark:bg-[#030a16] text-slate-700 dark:text-slate-400 border-slate-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-[#044CD0] dark:hover:border-blue-500/50 hover:bg-blue-50/70 dark:hover:bg-[#071938]"
                            }`}
                            title={inPortfolio ? t.portfolio.removeFromPortfolio : t.portfolio.addToPortfolio}
                            aria-label={inPortfolio ? t.portfolio.removeFromPortfolio : t.portfolio.addToPortfolio}
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/fundusze/${item.subfundId}`}
                            data-component="fund-details-btn"
                            className="table-action-btn w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-blue-50/70 dark:bg-[#030a16] dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] text-slate-700 dark:text-slate-400 hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-[#044CD0] dark:hover:border-blue-500/50 transition-all shadow-2xs cursor-pointer"
                            title={t.common.profile}
                            aria-label={t.common.profile}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-[#0e274d]">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 w-full md:w-auto justify-between sm:justify-start">
          <div>
            {t.catalog.displayingPage} <strong className="text-slate-800 dark:text-slate-200">{pageInfo.number + 1}</strong> {t.common.of}{" "}
            <strong className="text-slate-800 dark:text-slate-200">{Math.max(1, pageInfo.totalPages)}</strong> ({t.catalog.totalItems}{" "}
            {formatNumber(pageInfo.totalElements, 0)} {t.common.items})
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-[#0e274d] pt-2 sm:pt-0 sm:pl-4 select-none">
            <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {viewMode === "grid" ? t.catalog.cardsPerPage : t.catalog.rowsPerPage}
            </span>
            <div className="inline-flex items-center bg-slate-100 dark:bg-[#030a16] p-0.5 rounded-lg border border-slate-300/80 dark:border-[#0e274d] shadow-2xs">
              {pageSizeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handlePageSizeChange(opt)}
                  aria-pressed={currentPageSize === opt}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    currentPageSize === opt
                      ? "bg-[#044CD0] text-white shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#071938]"
                  }`}
                  title={`${locale === "en" ? "Show" : "Pokaż"} ${opt} ${locale === "en" ? (viewMode === "grid" ? "cards per page" : "rows per page") : (viewMode === "grid" ? "kafelków na stronę" : "wierszy na stronę")}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(0, pageInfo.number - 1))}
            disabled={pageInfo.number === 0 || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#030a16] border border-slate-300 dark:border-[#0e274d] text-slate-700 dark:text-slate-300 hover:bg-blue-50/70 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white hover:border-[#044CD0] dark:hover:border-[#044CD0]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.common.previous}
          </button>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
            {pageInfo.number + 1} / {Math.max(1, pageInfo.totalPages)}
          </span>

          <button
            onClick={() => handlePageChange(pageInfo.number + 1)}
            disabled={pageInfo.number + 1 >= pageInfo.totalPages || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#030a16] border border-slate-300 dark:border-[#0e274d] text-slate-700 dark:text-slate-300 hover:bg-blue-50/70 dark:hover:bg-[#071938] hover:text-[#044CD0] dark:hover:text-white hover:border-[#044CD0] dark:hover:border-[#044CD0]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          >
            {t.common.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
