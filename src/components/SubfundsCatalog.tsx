"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Scale,
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
} from "lucide-react";
import { SubfundCardModel } from "@/types/knf";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { useCompare } from "./CompareContext";
import { useTranslation } from "@/lib/i18n";

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
  const { t, formatCurrency, formatPercent, formatDate, formatNumber } = useTranslation();

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
  const [sortField, setSortField] = useState<"name" | "fee" | "risk" | "valuation">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [hasUserToggledView, setHasUserToggledView] = useState(false);

  // Set default view: "table" on full desktop (>=1280px), "grid" on mobile, tablet & intermediate (<1280px)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDefaultView = () => {
      if (!hasUserToggledView) {
        const isFullDesktop = window.innerWidth >= 1280;
        setViewMode(isFullDesktop ? "table" : "grid");
      }
    };

    updateDefaultView();
    window.addEventListener("resize", updateDefaultView);
    return () => window.removeEventListener("resize", updateDefaultView);
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
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.catalog.searchPlaceholder}
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

            {/* Sort Select */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-[#030a16] border border-[#0e274d] px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm min-w-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#044CD0] shrink-0" />
              <select
                value={`${sortField},${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(",") as [any, any];
                  setSortField(field);
                  setSortOrder(order);
                }}
                aria-label={t.catalog.sort.label}
                className="bg-transparent text-slate-200 font-medium focus:outline-hidden cursor-pointer w-full truncate"
              >
                <option value="name,asc" className="bg-[#030a16]">{t.catalog.sort.nameAsc}</option>
                <option value="name,desc" className="bg-[#030a16]">{t.catalog.sort.nameDesc}</option>
                <option value="fee,asc" className="bg-[#030a16]">{t.catalog.sort.feeAsc}</option>
                <option value="fee,desc" className="bg-[#030a16]">{t.catalog.sort.feeDesc}</option>
                <option value="risk,asc" className="bg-[#030a16]">{t.catalog.sort.riskAsc}</option>
                <option value="risk,desc" className="bg-[#030a16]">{t.catalog.sort.riskDesc}</option>
                <option value="valuation,desc" className="bg-[#030a16]">{t.catalog.sort.valuationDesc}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Badges: Type & Asset Class */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#0e274d]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Asset Class Multi-Select Filter */}
            <div className="flex items-center gap-1 text-xs flex-wrap">
              <span className="text-slate-400 mr-1 font-semibold flex items-center gap-1 shrink-0">
                <Compass className="w-3.5 h-3.5 text-[#3b82f6]" /> {t.catalog.assetClass}
              </span>
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
                    className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#044CD0] text-white shadow-md font-bold scale-102 border border-blue-400/50"
                        : "bg-[#030a16] text-slate-300 border border-[#0e274d] hover:text-white hover:border-[#044CD0]/60"
                    }`}
                  >
                    {isSelected && cls.id !== "ALL" && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    {cls.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:block w-px h-4 bg-[#0e274d] mx-1" />

            {/* Fund Legal Type Multi-Select Filter */}
            <div className="flex items-center gap-1 text-xs flex-wrap">
              <span className="text-slate-400 mr-1 font-medium shrink-0">{t.catalog.legalType}</span>
              {["ALL", "SFIO", "FIO", "FIZ", "ETF"].map((type) => {
                const isSelected =
                  type === "ALL"
                    ? selectedTypes.length === 0
                    : selectedTypes.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#044CD0] text-white shadow-xs font-bold border border-blue-400/60"
                        : "bg-[#030a16] text-slate-400 border border-[#0e274d] hover:text-slate-200"
                    }`}
                  >
                    {isSelected && type !== "ALL" && (
                      <Check className="w-3 h-3 stroke-[3]" />
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
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1 px-2.5 rounded-lg border border-[#0e274d] hover:border-slate-600 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.catalog.advancedFilters}</span>
            {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-xl bg-[#030a16] border border-[#0e274d] flex flex-wrap items-center gap-6 text-xs text-slate-300 animate-in fade-in duration-150">
            <span className="font-semibold text-slate-400">{t.catalog.legalRegistry}</span>

            <label className="flex items-center gap-2 cursor-pointer select-none group">
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

            <label className="flex items-center gap-2 cursor-pointer select-none group">
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
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          {t.catalog.foundCount} <strong className="text-slate-200">{formatNumber(pageInfo.totalElements, 0)}</strong> {t.catalog.subfundsCount}
          {(selectedClassifications.length > 0 || selectedTypes.length > 0) && (
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
