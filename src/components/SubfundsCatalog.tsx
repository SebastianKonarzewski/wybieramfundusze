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
import { formatCurrency, formatPercent, formatDate, formatNumber } from "@/lib/utils";
import { useCompare } from "./CompareContext";

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
              placeholder="Szukaj subfunduszu po nazwie lub kodzie (np. Agio, PKO, Obligacji, PLSFIO...)..."
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
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#044CD0] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Widok kafelków"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "table"
                    ? "bg-[#044CD0] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Widok tabeli"
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
                aria-label="Sortowanie"
                className="bg-transparent text-slate-200 font-medium focus:outline-hidden cursor-pointer w-full truncate"
              >
                <option value="name,asc" className="bg-[#030a16]">Nazwa (A do Z)</option>
                <option value="name,desc" className="bg-[#030a16]">Nazwa (Z do A)</option>
                <option value="fee,asc" className="bg-[#030a16]">Najniższa opłata stała</option>
                <option value="fee,desc" className="bg-[#030a16]">Najwyższa opłata stała</option>
                <option value="risk,asc" className="bg-[#030a16]">Najniższe ryzyko (SRI 1-7)</option>
                <option value="risk,desc" className="bg-[#030a16]">Najwyższe ryzyko (SRI 7-1)</option>
                <option value="valuation,desc" className="bg-[#030a16]">Najwyższa wycena</option>
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
                <Compass className="w-3.5 h-3.5 text-[#3b82f6]" /> Klasa aktywów:
              </span>
              {[
                { id: "ALL", label: "Wszystkie" },
                { id: "akcji", label: "Akcyjne" },
                { id: "dłużn", label: "Dłużne / Obligacji" },
                { id: "mieszan", label: "Mieszane" },
                { id: "PPK", label: "PPK" },
                { id: "alternatyw", label: "Alternatywne / Surowce" },
              ].map((cls) => {
                const isSelected =
                  cls.id === "ALL"
                    ? selectedClassifications.length === 0
                    : selectedClassifications.includes(cls.id);

                return (
                  <button
                    key={cls.id}
                    onClick={() => toggleClassification(cls.id)}
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
              <span className="text-slate-400 mr-1 font-medium shrink-0">Typ prawny:</span>
              {["ALL", "SFIO", "FIO", "FIZ", "ETF"].map((type) => {
                const isSelected =
                  type === "ALL"
                    ? selectedTypes.length === 0
                    : selectedTypes.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#044CD0] text-white shadow-xs font-bold border border-blue-400/60"
                        : "bg-[#030a16] text-slate-400 border border-[#0e274d] hover:text-slate-200"
                    }`}
                  >
                    {isSelected && type !== "ALL" && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    {type === "ALL" ? "Wszystkie typy" : type}
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
            <span>Filtry zaawansowane</span>
            {showAdvancedFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-xl bg-[#030a16] border border-[#0e274d] flex flex-wrap items-center gap-6 text-xs text-slate-300 animate-in fade-in duration-150">
            <span className="font-semibold text-slate-400">Rejestr i status prawny:</span>

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
                Pokaż wykreślone / nieaktywne
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
                Pokaż fundusze w likwidacji
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Znaleziono: <strong className="text-slate-200">{formatNumber(pageInfo.totalElements, 0)}</strong> subfunduszy
          {(selectedClassifications.length > 0 || selectedTypes.length > 0) && (
            <span className="ml-1 text-[#60a5fa]">
              ({[
                selectedClassifications.length > 0
                  ? `klasy: ${selectedClassifications
                      .map((c) =>
                        c === "akcji"
                          ? "Akcyjne"
                          : c === "dłużn"
                          ? "Dłużne"
                          : c === "mieszan"
                          ? "Mieszane"
                          : c === "PPK"
                          ? "PPK"
                          : "Alternatywne"
                      )
                      .join(", ")}`
                  : null,
                selectedTypes.length > 0
                  ? `typy: ${selectedTypes.join(", ")}`
                  : null,
              ]
                .filter(Boolean)
                .join(" • ")})
            </span>
          )}
          {isPending && (
            <span className="ml-2 inline-flex items-center gap-1 text-[#3b82f6]">
              <RefreshCw className="w-3 h-3 animate-spin" /> filtrowanie bazy...
            </span>
          )}
        </div>
        <div>
          Strona <strong className="text-slate-200">{pageInfo.number + 1}</strong> z{" "}
          <strong className="text-slate-200">{Math.max(1, pageInfo.totalPages)}</strong>
        </div>
      </div>

      {/* View Mode: Cards Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedItems.map((item) => {
            const inCompare = isSelected(item.subfundId);

            return (
              <div
                key={item.subfundId}
                className="group relative bg-[#051329]/90 hover:bg-[#071938] border border-[#0e274d] hover:border-[#044CD0]/60 rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between shadow-md hover:shadow-xl"
              >
                <div>
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#030a16] text-blue-300 border border-[#0e274d]">
                        {item.type}
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
                    className="block font-bold text-base text-slate-100 group-hover:text-[#60a5fa] transition-colors line-clamp-2 leading-snug mb-3"
                  >
                    {item.name}
                  </Link>

                  {/* Category & Classification */}
                  {(item.classification || item.category) && (
                    <div className="text-xs text-slate-300 mb-4 flex items-center gap-1.5 bg-[#030a16]/60 p-2 rounded-xl border border-[#0e274d]/80">
                      <Compass className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                      <span className="truncate capitalize font-medium">
                        {item.classification}
                        {item.category ? ` • ${item.category}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#0e274d] mb-4 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Profil Ryzyka</span>
                      <RiskBadge level={item.riskLevel} showLabel={false} size="sm" />
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] block">Opłata bieżąca</span>
                      <span className="font-semibold text-slate-200">
                        {formatPercent(item.managementFee)}
                      </span>
                    </div>

                    {item.latestValuation !== null && item.latestValuation !== undefined && (
                      <div className="col-span-2 pt-1 flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Ostatnia wycena:</span>
                        <span className="font-bold text-slate-200">
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
                <div className="flex items-center gap-2 pt-3 border-t border-[#0e274d]/80 mt-auto">
                  <Link
                    href={`/fundusze/${item.subfundId}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-[#030a16] hover:bg-[#044CD0] text-slate-200 hover:text-white border border-[#0e274d] hover:border-transparent transition-all"
                  >
                    Szczegóły funduszu
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
                    className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                      inCompare
                        ? "bg-[#044CD0] text-white border-blue-400 shadow-md"
                        : "bg-[#030a16] text-slate-400 border-[#0e274d] hover:text-[#60a5fa] hover:border-[#044CD0]/60"
                    }`}
                    title={inCompare ? "Usuń z porównania" : "Dodaj do porównywarki"}
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
        <div className="bg-[#051329] border border-[#0e274d] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#030a16] text-xs uppercase tracking-wider text-slate-400 border-b border-[#0e274d]">
                <tr>
                  <th className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">Typ / Kod</th>
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nazwa Subfunduszu</span>
                      {sortField === "name" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">Klasa aktywów</th>
                  <th className="py-3.5 px-3 sm:px-4 font-semibold whitespace-nowrap">Status</th>
                  <th
                    onClick={() => handleSort("risk")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Ryzyko (SRI)</span>
                      {sortField === "risk" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("fee")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Opłata stała</span>
                      {sortField === "fee" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("valuation")}
                    className="py-3.5 px-3 sm:px-4 font-semibold cursor-pointer hover:text-slate-200 select-none group whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Ostatnia wycena</span>
                      {sortField === "valuation" ? (
                        sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-[#044CD0]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#044CD0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 text-right font-semibold whitespace-nowrap">Porównaj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0e274d]/70 text-slate-300">
                {processedItems.map((item) => {
                  const inCompare = isSelected(item.subfundId);

                  return (
                    <tr
                      key={item.subfundId}
                      className="hover:bg-[#071938]/60 transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-xs bg-[#030a16] border border-[#0e274d] px-2 py-0.5 rounded text-blue-300">
                          {item.type}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.nationalCode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/fundusze/${item.subfundId}`}
                          className="font-semibold text-slate-100 hover:text-[#60a5fa] transition-colors block line-clamp-1"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#030a16] border border-[#0e274d] text-slate-300 capitalize">
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
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                        {formatPercent(item.managementFee)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.latestValuation ? (
                          <div>
                            <span className="font-bold text-slate-200">
                              {formatCurrency(item.latestValuation)}
                            </span>
                            {item.latestValuationDate && (
                              <div className="text-[10px] text-slate-500">
                                {formatDate(item.latestValuationDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
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
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              inCompare
                                ? "bg-[#044CD0] text-white border-blue-400"
                                : "bg-[#030a16] text-slate-400 border-[#0e274d] hover:text-[#60a5fa]"
                            }`}
                            title={inCompare ? "Usuń z porównania" : "Porównaj"}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/fundusze/${item.subfundId}`}
                            className="px-2.5 py-1 text-xs rounded-lg bg-[#030a16] hover:bg-[#071938] border border-[#0e274d] text-slate-200 transition-colors"
                          >
                            Profil
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
          Wyświetlanie strony {pageInfo.number + 1} z {Math.max(1, pageInfo.totalPages)} (łącznie{" "}
          {formatNumber(pageInfo.totalElements, 0)} pozycji)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={pageInfo.number === 0 || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#030a16] border border-[#0e274d] text-slate-300 hover:bg-[#071938] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Poprzednia
          </button>

          <span className="text-xs font-bold text-slate-300 px-2">
            {pageInfo.number + 1} / {Math.max(1, pageInfo.totalPages)}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={pageInfo.number + 1 >= pageInfo.totalPages || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#030a16] border border-[#0e274d] text-slate-300 hover:bg-[#071938] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Następna
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
