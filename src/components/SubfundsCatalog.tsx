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
  TrendingUp,
  Percent,
  Compass,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Layers,
  X,
} from "lucide-react";
import { SubfundCardModel } from "@/types/knf";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
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
    groupPl: "Fundusze dłużne (obligacji)",
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
      { id: "absolutnej stopy zwrotu", labelPl: "Absolutnej stopy zwrotu (Absolute Return)", labelEn: "Absolute return" },
      { id: "aktywów niepublicznych", labelPl: "Aktywów niepublicznych (Private Equity)", labelEn: "Private assets / PE" },
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

interface SubfundsCatalogProps {
  initialItems: SubfundCardModel[];
  initialPage: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export function SubfundsCatalog({ initialItems, initialPage }: SubfundsCatalogProps) {
  const { toggleFund, isSelected } = useCompare();
  const { toggleFund: togglePortfolioFund, isInPortfolio } = usePortfolio();
  const { t, locale, formatCurrency, formatPercent, formatDate, formatNumber } = useTranslation();

  const [items, setItems] = useState<SubfundCardModel[]>(initialItems);
  const [pageInfo, setPageInfo] = useState(initialPage);
  const [isPending, startTransition] = useTransition();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeLiquidating, setIncludeLiquidating] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Multi-select state for fund types and asset classes
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<"name" | "fee" | "risk" | "valuation">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [hasUserToggledView, setHasUserToggledView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    setHasUserToggledView(true);
    setViewMode(mode);
  };

  // Toggle helpers for multi-select
  const toggleClassification = (id: string) => {
    setCurrentPage(0);
    if (id === "ALL") {
      setSelectedClassifications([]);
      return;
    }
    setSelectedClassifications((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
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

  // Filter category groups by currently active asset classes if any are selected
  const visibleCategoryGroups = useMemo(() => {
    if (selectedClassifications.length === 0) {
      return CATEGORY_GROUPS;
    }
    return CATEGORY_GROUPS.filter((grp) => selectedClassifications.includes(grp.classId));
  }, [selectedClassifications]);

  // Reset selectedCategory if parent classification is deselected
  useEffect(() => {
    if (selectedCategory !== "ALL" && selectedClassifications.length > 0) {
      const isCategoryStillValid = visibleCategoryGroups.some((grp) =>
        grp.options.some((opt) => opt.id === selectedCategory)
      );
      if (!isCategoryStillValid) {
        setSelectedCategory("ALL");
      }
    }
  }, [selectedClassifications, visibleCategoryGroups, selectedCategory]);

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

  // Close category dropdown when advanced filters are collapsed
  useEffect(() => {
    if (!showAdvancedFilters) {
      setIsCategoryOpen(false);
    }
  }, [showAdvancedFilters]);

  const hasActiveAdvancedFilters =
    selectedCategory !== "ALL" || includeInactive || includeLiquidating;

  // Fetch data on filter changes
  useEffect(() => {
    const fetchFiltered = async () => {
      startTransition(async () => {
        try {
          const params = new URLSearchParams();
          if (searchTerm) params.set("search", searchTerm);
          if (selectedClassifications.length > 0) {
            params.set("classifications", selectedClassifications.join(","));
          }
          if (selectedTypes.length > 0) {
            params.set("fundTypes", selectedTypes.join(","));
          }
          if (selectedCategory && selectedCategory !== "ALL") {
            params.set("category", selectedCategory);
          }
          if (includeInactive) params.set("includeInactive", "true");
          if (includeLiquidating) params.set("includeLiquidating", "true");
          params.set("page", String(currentPage));
          params.set("size", "24");
          params.set("sort", sortField === "name" ? `name,${sortOrder}` : "name,asc");
          params.set("enriched", "true");

          const res = await fetch(`/api/subfunds?${params.toString()}`);
          if (res.ok) {
            const data = await res.json();
            setItems(data.items || []);
            setPageInfo(data.page || { size: 24, totalElements: 0, totalPages: 0, number: 0 });
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
    selectedClassifications,
    selectedTypes,
    selectedCategory,
    includeInactive,
    includeLiquidating,
    currentPage,
    sortField,
    sortOrder,
  ]);

  // Handle header click sorting
  const handleSort = (field: "name" | "fee" | "risk" | "valuation") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "valuation" ? "desc" : "asc");
    }
  };

  // Custom sort for enriched columns on the fetched page
  const processedItems = useMemo(() => {
    let result = [...items];

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
        const va = a.latestValuation ?? -1;
        const vb = b.latestValuation ?? -1;
        return sortOrder === "asc" ? va - vb : vb - va;
      });
    }

    return result;
  }, [items, sortField, sortOrder]);

  const classificationOptions = [
    { id: "ALL", label: t.catalog.classes.ALL },
    { id: "akcji", label: t.catalog.classes.akcji },
    { id: "dłużn", label: t.catalog.classes.dłużn },
    { id: "mieszan", label: t.catalog.classes.mieszan },
    { id: "PPK", label: t.catalog.classes.PPK },
    { id: "alternatyw", label: t.catalog.classes.alternatyw },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-[#051329] border border-[#0e274d] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        {/* Top line: Search input & View mode toggle & Sort select */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isMobile ? t.catalog.searchPlaceholderMobile : t.catalog.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030a16] border border-[#0e274d] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-[#044CD0] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#030a16] p-1 rounded-xl border border-[#0e274d] shrink-0">
              <button
                onClick={() => handleViewModeChange("grid")}
                aria-pressed={viewMode === "grid"}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#044CD0] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
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
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={t.catalog.viewModeTable}
                aria-label={t.catalog.viewModeTable}
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Controls: Field Dropdown + 1-Click Direction Toggle */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-0">
              {/* Field Select */}
              <div className="h-[38px] flex-1 sm:flex-initial flex items-center gap-1.5 bg-[#030a16] border border-[#0e274d] px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm min-w-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#044CD0] shrink-0" />
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  aria-label={t.catalog.sort.field}
                  className="bg-transparent text-slate-200 font-sans font-medium text-xs sm:text-sm focus:outline-hidden cursor-pointer w-full truncate"
                >
                  <option value="name" className="bg-[#030a16] text-slate-200">{t.catalog.sort.fields.name}</option>
                  <option value="fee" className="bg-[#030a16] text-slate-200">{t.catalog.sort.fields.fee}</option>
                  <option value="risk" className="bg-[#030a16] text-slate-200">{t.catalog.sort.fields.risk}</option>
                  <option value="valuation" className="bg-[#030a16] text-slate-200">{t.catalog.sort.fields.valuation}</option>
                </select>
              </div>

              {/* Direction Toggle Button */}
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                aria-label={sortOrder === "asc" ? t.catalog.sort.toggleDirectionAsc : t.catalog.sort.toggleDirectionDesc}
                title={sortOrder === "asc" ? t.catalog.sort.toggleDirectionAsc : t.catalog.sort.toggleDirectionDesc}
                className="h-[38px] px-2.5 sm:px-3 flex items-center justify-center gap-1.5 bg-[#030a16] hover:bg-[#071938] border border-[#0e274d] hover:border-[#044CD0]/60 text-slate-200 font-sans font-medium text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs shrink-0 select-none group"
              >
                {sortOrder === "asc" ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 text-[#044CD0] group-hover:scale-110 transition-transform" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">{t.catalog.sort.ascending}</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-[#044CD0] group-hover:scale-110 transition-transform" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">{t.catalog.sort.descending}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Rows: Asset Class & Legal Type */}
        <div className="pt-3 border-t border-[#0e274d] space-y-3">
          {/* Row 1: Asset Class */}
          <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <span className="text-slate-400 sm:w-[116px] shrink-0 font-medium font-sans flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#3b82f6] shrink-0" />
              {t.catalog.assetClass}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
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
                    className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#044CD0] text-white shadow-md font-bold scale-102 border border-blue-400/50"
                        : "bg-[#030a16] text-slate-300 border border-[#0e274d] hover:text-white hover:border-[#044CD0]/60"
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

          {/* Row 2: Legal Type & Advanced Filters toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 sm:w-[116px] shrink-0 font-medium font-sans flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#3b82f6] shrink-0" />
                {t.catalog.legalType}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["ALL", "FIO", "SFIO", "FIZ", "ETF"].map((type) => {
                  const isSelected =
                    type === "ALL"
                      ? selectedTypes.length === 0
                      : selectedTypes.includes(type);

                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      aria-pressed={isSelected}
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#044CD0] text-white shadow-xs font-bold border border-blue-400/60"
                          : "bg-[#030a16] text-slate-300 border border-[#0e274d] hover:text-white hover:border-[#044CD0]/60"
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

            {/* Toggle Button for Advanced Options */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-[38px] inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-xl border transition-colors cursor-pointer self-start sm:self-auto shrink-0 ${
                hasActiveAdvancedFilters
                  ? "text-blue-300 border-blue-500/50 bg-[#044CD0]/15 hover:bg-[#044CD0]/25 font-medium"
                  : "text-slate-400 hover:text-slate-200 border-[#0e274d] hover:border-slate-600"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-[#3b82f6]" />
              <span>{t.catalog.advancedFilters}</span>
              {hasActiveAdvancedFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              )}
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#030a16] border border-[#0e274d] flex flex-col xl:flex-row xl:items-center justify-between gap-4 text-xs sm:text-sm text-slate-300 animate-in fade-in duration-150 relative z-20">
            {/* Detailed Category Custom Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 min-w-0">
              <label
                id="detailed-category-label"
                className="text-slate-400 sm:w-[155px] font-medium font-sans flex items-center gap-1.5 shrink-0"
              >
                <Layers className="w-4 h-4 text-[#3b82f6] shrink-0" />
                <span>{t.catalog.detailedCategory}</span>
              </label>

              <div ref={categoryDropdownRef} className="relative min-w-0 w-full sm:w-[280px]">
                {/* Custom Trigger Button */}
                <button
                  type="button"
                  id="detailed-category-select"
                  aria-labelledby="detailed-category-label"
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryOpen}
                  onClick={() => setIsCategoryOpen((prev) => !prev)}
                  className={`h-[38px] w-full bg-[#051329] border ${
                    isCategoryOpen
                      ? "border-[#044CD0] ring-1 ring-[#044CD0]/30"
                      : "border-[#0e274d] hover:border-[#19407a]"
                  } text-slate-200 font-sans font-medium text-xs sm:text-sm rounded-xl pl-3 pr-2.5 py-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer text-left select-none`}
                >
                  <span
                    className="truncate flex-1"
                    title={
                      selectedCategory === "ALL"
                        ? t.catalog.allCategories
                        : getCategoryLabel(selectedCategory, locale === "en")
                    }
                  >
                    {selectedCategory === "ALL"
                      ? t.catalog.allCategories
                      : getCategoryLabel(selectedCategory, locale === "en")}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    {selectedCategory !== "ALL" && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory("ALL");
                          setCurrentPage(0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setSelectedCategory("ALL");
                            setCurrentPage(0);
                          }
                        }}
                        title={t.catalog.clearCategory}
                        className="p-0.5 hover:text-white hover:bg-slate-700/60 rounded transition-colors cursor-pointer"
                        aria-label={t.catalog.clearCategory}
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isCategoryOpen ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu Popover */}
                {isCategoryOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="detailed-category-label"
                    className="absolute top-full left-0 mt-1.5 w-full sm:w-[320px] max-h-72 sm:max-h-80 overflow-y-auto bg-[#030c1c] border border-[#0e274d] rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Option: All categories */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedCategory === "ALL"}
                      onClick={() => {
                        setSelectedCategory("ALL");
                        setCurrentPage(0);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCategory === "ALL"
                          ? "bg-[#044CD0]/25 text-blue-300 font-semibold"
                          : "text-slate-200 hover:bg-[#071938] hover:text-white"
                      }`}
                    >
                      <span>{t.catalog.allCategories}</span>
                      {selectedCategory === "ALL" && (
                        <Check className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                      )}
                    </button>

                    {/* Grouped categories */}
                    {visibleCategoryGroups.map((grp) => (
                      <div key={grp.classId} className="pt-1.5 border-t border-[#0e274d]/50 first:border-t-0">
                        {/* Group Header - unclickable, highlighted and distinct for eye scanning */}
                        <div className="px-3 py-1.5 text-[11px] font-bold text-[#60a5fa] uppercase tracking-wider select-none">
                          ── {locale === "en" ? grp.groupEn : grp.groupPl} ──
                        </div>

                        {/* Options under this group */}
                        <div className="space-y-0.5">
                          {grp.options.map((opt) => {
                            const isSelected = selectedCategory === opt.id;
                            const label = locale === "en" ? opt.labelEn : opt.labelPl;

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setSelectedCategory(opt.id);
                                  setCurrentPage(0);
                                  setIsCategoryOpen(false);
                                }}
                                className={`w-full text-left pl-4 pr-3 py-1.5 text-xs sm:text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#044CD0]/25 text-blue-200 font-semibold"
                                    : "text-slate-300 hover:bg-[#071938] hover:text-white"
                                }`}
                              >
                                <span className="truncate mr-2">{label}</span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Explicit Clear Button next to input */}
              {selectedCategory !== "ALL" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setCurrentPage(0);
                  }}
                  title={t.catalog.clearCategory}
                  className="h-[38px] inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 rounded-xl bg-[#0e274d] hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.common.clear}</span>
                </button>
              )}
            </div>

            <div className="hidden xl:block w-px h-6 bg-[#0e274d] shrink-0" />

            {/* Legal Registry Checkboxes */}
            <div className="flex items-center flex-wrap gap-4 sm:gap-6 pt-3 xl:pt-0 border-t xl:border-t-0 border-[#0e274d]">
              <span className="text-slate-400 font-medium font-sans shrink-0">{t.catalog.legalRegistry}</span>

              <label className="flex items-center gap-2 cursor-pointer select-none group font-medium">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => {
                    setIncludeInactive(e.target.checked);
                    setCurrentPage(0);
                  }}
                  className="w-4 h-4 rounded bg-[#051329] border-slate-700 text-[#044CD0] accent-[#044CD0] cursor-pointer"
                />
                <span className="group-hover:text-slate-100 transition-colors">
                  {t.catalog.showInactive}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none group font-medium">
                <input
                  type="checkbox"
                  checked={includeLiquidating}
                  onChange={(e) => {
                    setIncludeLiquidating(e.target.checked);
                    setCurrentPage(0);
                  }}
                  className="w-4 h-4 rounded bg-[#051329] border-slate-700 text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="group-hover:text-slate-100 transition-colors">
                  {t.catalog.showLiquidating}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 px-1">
        <div>
          {t.catalog.foundCount} <strong className="text-slate-200">{formatNumber(pageInfo.totalElements, 0)}</strong> {t.catalog.subfundsCount}
          {(selectedClassifications.length > 0 || selectedTypes.length > 0 || selectedCategory !== "ALL") && (
            <span className="ml-1 text-[#60a5fa]">
              ({[
                selectedClassifications.length > 0
                  ? `${t.catalog.classesTagLabel} ${selectedClassifications
                      .map((c) =>
                        c === "akcji"
                          ? t.catalog.classes.akcji
                          : c === "dłużn"
                          ? t.catalog.classes.dłużn
                          : c === "mieszan"
                          ? t.catalog.classes.mieszan
                          : c === "PPK"
                          ? t.catalog.classes.PPK
                          : t.catalog.classes.alternatyw
                      )
                      .join(", ")}`
                  : null,
                selectedTypes.length > 0
                  ? `${t.catalog.typesTagLabel} ${selectedTypes.join(", ")}`
                  : null,
                selectedCategory !== "ALL"
                  ? `${t.catalog.categoryTagLabel} ${getCategoryLabel(selectedCategory, locale === "en")}`
                  : null,
              ]
                .filter(Boolean)
                .join(" • ")})
            </span>
          )}
          {isPending && (
            <span className="ml-2 inline-flex items-center gap-1 text-[#3b82f6]">
              <RefreshCw className="w-3 h-3 animate-spin" /> {t.common.filtering}
            </span>
          )}
        </div>
        <div>
          {t.common.page} <strong className="text-slate-200">{pageInfo.number + 1}</strong> {t.common.of}{" "}
          <strong className="text-slate-200">{Math.max(1, pageInfo.totalPages)}</strong>
        </div>
      </div>

      {/* View Mode: Cards Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedItems.map((item) => {
            const inCompare = isSelected(item.subfundId);
            const inPortfolio = isInPortfolio(item.subfundId);

            return (
              <div
                key={item.subfundId}
                className="catalog-grid-card group relative bg-white dark:bg-[#051329]/90 hover:bg-slate-50 dark:hover:bg-[#071938] border border-slate-200 dark:border-[#0e274d] hover:border-[#044CD0]/60 rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-md dark:shadow-md dark:hover:shadow-xl"
              >
                <div>
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-[#030a16] text-[#044CD0] dark:text-blue-300 border border-blue-200/90 dark:border-[#0e274d] shadow-2xs">
                        {item.name.toUpperCase().includes("ETF") ? "ETF" : item.type}
                      </span>
                      {item.nationalCode && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.nationalCode}
                        </span>
                      )}
                    </div>
                    <StatusBadge
                      isActive={item.isActive}
                      isLiquidating={item.isLiquidating}
                      liquidationStartDate={item.liquidationStartDate}
                      liquidationEndDate={item.liquidationEndDate}
                    />
                  </div>

                  {/* Fund Name */}
                  <Link
                    href={`/fundusze/${item.subfundId}`}
                    className="block font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-[#044CD0] dark:group-hover:text-[#60a5fa] transition-colors line-clamp-2 leading-snug mb-3"
                  >
                    {item.name}
                  </Link>

                  {/* Category & Classification */}
                  {(item.classification || item.category) && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5 bg-white/80 dark:bg-[#030a16]/60 p-2 rounded-xl border border-blue-200/80 dark:border-[#0e274d]/80 shadow-2xs">
                      <Compass className="w-3.5 h-3.5 text-[#044CD0] dark:text-[#3b82f6] shrink-0" />
                      <span className="truncate capitalize font-medium">
                        {item.classification}
                        {item.category ? ` • ${item.category}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-200/80 dark:border-[#0e274d] mb-4 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{t.catalog.card.riskProfile}</span>
                      <RiskBadge level={item.riskLevel} showLabel={false} size="sm" />
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{t.catalog.card.ongoingCharge}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatPercent(item.managementFee)}
                      </span>
                    </div>

                    {item.latestValuation !== null && item.latestValuation !== undefined && (
                      <div className="col-span-2 pt-1 flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                        <span>{t.catalog.card.latestValuation}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200">
                          {formatCurrency(item.latestValuation)}
                          {item.latestValuationDate && (
                            <span className="text-[10px] text-slate-500 font-normal ml-1">
                              ({formatDate(item.latestValuationDate)})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-blue-200/80 dark:border-[#0e274d]/80 mt-auto">
                  <Link
                    href={`/fundusze/${item.subfundId}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50 dark:bg-[#030a16] dark:hover:bg-[#044CD0] text-slate-800 dark:text-slate-200 hover:text-[#044CD0] dark:hover:text-white border border-blue-200 dark:border-[#0e274d] hover:border-blue-400 dark:hover:border-transparent transition-all shadow-2xs"
                  >
                    {t.catalog.card.fundDetails}
                  </Link>

                  <button
                    onClick={() =>
                      togglePortfolioFund({
                        subfundId: item.subfundId,
                        name: item.name,
                        type: item.type,
                        category: item.category,
                      })
                    }
                    className={`p-2 rounded-xl text-xs font-medium border transition-all shadow-2xs ${
                      inPortfolio
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-xs"
                        : "bg-white dark:bg-[#030a16] text-slate-600 dark:text-slate-400 border-blue-200 dark:border-[#0e274d] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400"
                    }`}
                    title={inPortfolio ? t.portfolio.removeFromPortfolio : t.portfolio.addToPortfolio}
                  >
                    {inPortfolio ? <Check className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() =>
                      toggleFund({
                        subfundId: item.subfundId,
                        name: item.name,
                        type: item.type,
                        category: item.category,
                      })
                    }
                    className={`p-2 rounded-xl text-xs font-medium border transition-all shadow-2xs ${
                      inCompare
                        ? "bg-[#044CD0] text-white border-blue-400 shadow-xs"
                        : "bg-white dark:bg-[#030a16] text-slate-600 dark:text-slate-400 border-blue-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-blue-400"
                    }`}
                    title={inCompare ? t.catalog.card.removeFromCompare : t.catalog.card.addToCompare}
                  >
                    {inCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: Interactive Table with Clickable Column Headers */
        <div className="catalog-table-container bg-white dark:bg-[#051329] border border-slate-200 dark:border-[#0e274d] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px] border-collapse bg-transparent">
              <thead className="bg-slate-50 dark:bg-[#030a16] text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#0e274d]">
                <tr>
                  <th className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">{t.catalog.table.typeCode}</th>
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.catalog.table.name}</span>
                      {sortField === "name" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">{t.catalog.table.assetClass}</th>
                  <th className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">{t.catalog.table.status}</th>
                  <th
                    onClick={() => handleSort("risk")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.catalog.table.risk}</span>
                      {sortField === "risk" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("fee")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.catalog.table.fee}</span>
                      {sortField === "fee" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("valuation")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.catalog.table.valuation}</span>
                      {sortField === "valuation" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 text-right font-semibold whitespace-nowrap">{t.catalog.table.compare}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#0e274d]/70 text-slate-800 dark:text-slate-300">
                {processedItems.map((item) => {
                  const inCompare = isSelected(item.subfundId);
                  const inPortfolio = isInPortfolio(item.subfundId);

                  return (
                    <tr
                      key={item.subfundId}
                      className="bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-[#071938]/60 transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-xs bg-white dark:bg-[#030a16] border border-blue-200 dark:border-[#0e274d] px-2 py-0.5 rounded text-[#044CD0] dark:text-blue-300 shadow-2xs">
                          {item.name.toUpperCase().includes("ETF") ? "ETF" : item.type}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.nationalCode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/fundusze/${item.subfundId}`}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-[#044CD0] dark:hover:text-[#60a5fa] transition-colors block line-clamp-1"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white dark:bg-[#030a16] border border-blue-200 dark:border-[#0e274d] text-slate-700 dark:text-slate-300 capitalize shadow-2xs">
                          {item.classification || "—"}
                        </span>
                        {item.category && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.category}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge
                          isActive={item.isActive}
                          isLiquidating={item.isLiquidating}
                          liquidationStartDate={item.liquidationStartDate}
                          liquidationEndDate={item.liquidationEndDate}
                        />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <RiskBadge level={item.riskLevel} showLabel={false} size="sm" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                        {formatPercent(item.managementFee)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.latestValuation ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-200">
                              {formatCurrency(item.latestValuation)}
                            </span>
                            {item.latestValuationDate && (
                              <div className="text-[10px] text-slate-500">
                                {formatDate(item.latestValuationDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              togglePortfolioFund({
                                subfundId: item.subfundId,
                                name: item.name,
                                type: item.type,
                                category: item.category,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-xs transition-colors shadow-2xs ${
                              inPortfolio
                                ? "bg-emerald-600 text-white border-emerald-400"
                                : "bg-white dark:bg-[#030a16] text-slate-600 dark:text-slate-400 border-blue-200 dark:border-[#0e274d] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400"
                            }`}
                            title={inPortfolio ? t.portfolio.removeFromPortfolio : t.portfolio.addToPortfolio}
                          >
                            {inPortfolio ? <Check className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() =>
                              toggleFund({
                                subfundId: item.subfundId,
                                name: item.name,
                                type: item.type,
                                category: item.category,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-xs transition-colors shadow-2xs ${
                              inCompare
                                ? "bg-[#044CD0] text-white border-blue-400"
                                : "bg-white dark:bg-[#030a16] text-slate-600 dark:text-slate-400 border-blue-200 dark:border-[#0e274d] hover:text-[#044CD0] dark:hover:text-[#60a5fa] hover:border-blue-400"
                            }`}
                            title={inCompare ? t.catalog.card.removeFromCompare : t.common.compare}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/fundusze/${item.subfundId}`}
                            className="px-2.5 py-1 text-xs rounded-lg bg-white hover:bg-blue-50 dark:bg-[#030a16] dark:hover:bg-[#071938] border border-blue-200 dark:border-[#0e274d] text-slate-700 dark:text-slate-200 font-medium transition-colors shadow-2xs"
                          >
                            {t.common.profile}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#0e274d]">
        <div className="text-xs text-slate-400">
          {t.catalog.displayingPage} {pageInfo.number + 1} {t.common.of} {Math.max(1, pageInfo.totalPages)} ({t.catalog.totalItems}{" "}
          {formatNumber(pageInfo.totalElements, 0)} {t.common.items})
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={pageInfo.number === 0 || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#030a16] border border-[#0e274d] text-slate-300 hover:bg-[#071938] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.common.previous}
          </button>

          <span className="text-xs font-bold text-slate-300 px-2">
            {pageInfo.number + 1} / {Math.max(1, pageInfo.totalPages)}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={pageInfo.number + 1 >= pageInfo.totalPages || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#030a16] border border-[#0e274d] text-slate-300 hover:bg-[#071938] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t.common.next}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
