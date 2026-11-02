"use client";

import React, { useState, useEffect, useTransition } from "react";
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
  Info,
} from "lucide-react";
import { SubfundCardModel } from "@/types/knf";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
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
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("name,asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fetch data on filter changes
  useEffect(() => {
    const fetchFiltered = async () => {
      startTransition(async () => {
        try {
          const params = new URLSearchParams();
          if (searchTerm) params.set("search", searchTerm);
          if (includeInactive) params.set("includeInactive", "true");
          if (includeLiquidating) params.set("includeLiquidating", "true");
          params.set("page", String(currentPage));
          params.set("size", "24");
          params.set("sort", sortBy);
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, includeInactive, includeLiquidating, sortBy, currentPage]);

  // Client-side filtering for type and classification
  const filteredItems = items.filter((item) => {
    if (selectedType !== "ALL" && item.type !== selectedType) return false;
    if (selectedClassification !== "ALL") {
      const cls = (item.classification || "").toLowerCase();
      if (!cls.includes(selectedClassification.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md backdrop-blur-sm space-y-4">
        {/* Top line: Search input & View mode toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj subfunduszu po nazwie lub kodzie (np. Agio, PKO, PLSFIO...)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-800 text-emerald-400 shadow-xs"
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
                    ? "bg-slate-800 text-emerald-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Widok tabeli"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Sort select */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              aria-label="Sortowanie"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="name,asc">Nazwa (A do Z)</option>
              <option value="name,desc">Nazwa (Z do A)</option>
              <option value="subfundId,desc">Najnowsze ID</option>
              <option value="subfundId,asc">Najstarsze ID</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Toggle Switches */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 mr-1 font-medium">Typ:</span>
              {["ALL", "SFIO", "FIO", "FIZ", "ETF"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedType === type
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {type === "ALL" ? "Wszystkie" : type}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-4 bg-slate-800 mx-1" />

            {/* Classification Quick Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 mr-1 font-medium">Klasa:</span>
              {[
                { id: "ALL", label: "Wszystkie" },
                { id: "akcji", label: "Akcyjne" },
                { id: "dłużn", label: "Dłużne" },
                { id: "mieszan", label: "Mieszane" },
              ].map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassification(cls.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedClassification === cls.id
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {cls.label}
                </button>
              ))}
            </div>
          </div>

          {/* User switches: includeInactive & includeLiquidating */}
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => {
                  setIncludeInactive(e.target.checked);
                  setCurrentPage(0);
                }}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              <span className="text-slate-300 group-hover:text-slate-100 transition-colors">
                Pokaż nieaktywne
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
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
              <span className="text-slate-300 group-hover:text-slate-100 transition-colors">
                Pokaż w likwidacji
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Znaleziono: <strong className="text-slate-200">{pageInfo.totalElements}</strong> subfunduszy
          {isPending && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
              <RefreshCw className="w-3 h-3 animate-spin" /> ładowanie...
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
          {filteredItems.map((item) => {
            const inCompare = isSelected(item.subfundId);

            return (
              <div
                key={item.subfundId}
                className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-lg"
              >
                <div>
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
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
                    className="block font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-3"
                  >
                    {item.name}
                  </Link>

                  {/* Category & Classification */}
                  {(item.classification || item.category) && (
                    <div className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {item.classification}
                        {item.category ? ` • ${item.category}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 mb-4 text-xs">
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
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60 mt-auto">
                  <Link
                    href={`/fundusze/${item.subfundId}`}
                    className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
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
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-400 hover:border-emerald-500/40"
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
        /* View Mode: Table */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Typ / Kod</th>
                  <th className="py-3 px-4">Nazwa Subfunduszu</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ryzyko (SRI)</th>
                  <th className="py-3 px-4">Opłata stała</th>
                  <th className="py-3 px-4">Ostatnia wycena</th>
                  <th className="py-3 px-4 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredItems.map((item) => {
                  const inCompare = isSelected(item.subfundId);

                  return (
                    <tr
                      key={item.subfundId}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-200">
                          {item.type}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.nationalCode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/fundusze/${item.subfundId}`}
                          className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors block line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {item.category && (
                          <span className="text-xs text-slate-500">{item.category}</span>
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
                                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-400"
                            }`}
                            title={inCompare ? "Usuń z porównania" : "Porównaj"}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/fundusze/${item.subfundId}`}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          Wyświetlanie strony {pageInfo.number + 1} z {Math.max(1, pageInfo.totalPages)} (łącznie{" "}
          {pageInfo.totalElements} pozycji)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={pageInfo.number === 0 || isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Następna
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

