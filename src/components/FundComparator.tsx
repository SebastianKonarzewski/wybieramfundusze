"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  Plus,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Percent,
  Search,
  Check,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { SubfundFullProfile } from "@/types/knf";
import { useCompare } from "./CompareContext";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";

const COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#ec4899"];

export function FundComparator() {
  const { selectedFunds, removeFund, addFund, clearFunds } = useCompare();

  const [profiles, setProfiles] = useState<SubfundFullProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Search modal state for adding new fund
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ subfundId: number; name: string; type: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load profiles when selectedFunds changes
  useEffect(() => {
    if (selectedFunds.length === 0) {
      setProfiles([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const ids = selectedFunds.map((f) => f.subfundId).join(",");
        const res = await fetch(`/api/compare?ids=${ids}`);
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch (err) {
        console.error("Error loading comparison data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedFunds]);

  // Handle fund search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/subfunds?search=${encodeURIComponent(searchQuery)}&size=10&enriched=false`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.content || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Normalized time-series performance data for chart
  const chartData = useMemo(() => {
    if (profiles.length === 0) return [];

    // Collect all unique dates across all profiles' valuations
    const datesMap: Record<string, Record<string, number>> = {};

    profiles.forEach((p, idx) => {
      const fundKey = `fund_${p.subfund.subfundId}`;
      const sortedVals = [...p.valuations].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      if (sortedVals.length === 0) return;

      const baseVal = sortedVals[0].valuation;

      sortedVals.forEach((val) => {
        if (!datesMap[val.date]) {
          datesMap[val.date] = { date: new Date(val.date).getTime() } as any;
        }
        // Normalize as percentage return from base (or index base 100)
        const pctReturn = baseVal > 0 ? ((val.valuation - baseVal) / baseVal) * 100 : 0;
        datesMap[val.date][fundKey] = parseFloat(pctReturn.toFixed(2));
      });
    });

    const rows = Object.entries(datesMap).map(([dateStr, values]) => ({
      date: dateStr,
      ...values,
    }));

    // Sort by date ascending and take last 100 points
    return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-100);
  }, [profiles]);

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Zestawienie porównawcze funduszy
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Wybrano {selectedFunds.length} z 4 dopuszczalnych funduszy. Porównaj koszty, profile ryzyka i wyniki.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFunds.length < 4 && (
            <button
              onClick={() => setIsSearching(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Dodaj fundusz ({selectedFunds.length}/4)
            </button>
          )}

          {selectedFunds.length > 0 && (
            <button
              onClick={clearFunds}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Modal */}
      {isSearching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Dodaj fundusz do porównywarki
              </h3>
              <button
                onClick={() => setIsSearching(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                autoFocus
                placeholder="Wpisz nazwę funduszu (np. AGIO, PKO, Allianz)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/80">
              {searchLoading && (
                <div className="py-4 text-center text-xs text-slate-500">
                  Wyszukiwanie w rejestrze UKNF...
                </div>
              )}

              {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="py-4 text-center text-xs text-slate-500">
                  Nie znaleziono funduszy o podanej frazie.
                </div>
              )}

              {searchResults.map((item) => {
                const alreadySelected = selectedFunds.some((f) => f.subfundId === item.subfundId);

                return (
                  <div
                    key={item.subfundId}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{item.type}</div>
                    </div>

                    <button
                      disabled={alreadySelected}
                      onClick={() => {
                        addFund({
                          subfundId: item.subfundId,
                          name: item.name,
                          type: item.type,
                        });
                        setIsSearching(false);
                        setSearchQuery("");
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        alreadySelected
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      }`}
                    >
                      {alreadySelected ? "Dodany" : "Wybierz"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedFunds.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <Scale className="w-12 h-12 mx-auto text-emerald-400 opacity-60" />
          <h3 className="text-lg font-bold text-slate-200">Brak wybranych funduszy do porównania</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Wybierz od 2 do 4 funduszy z katalogu klikając ikonę wagi lub dodaj fundusz bezpośrednio przyciskiem poniżej.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Przejdź do Katalogu
            </Link>
            <button
              onClick={() => setIsSearching(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              Wyszukaj i dodaj fundusz
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Ładowanie metryk i dokumentów KID dla wybranych funduszy...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Side-by-Side Comparison Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-4 px-4 w-48 sm:w-60 font-semibold uppercase tracking-wider text-[11px]">
                      Parametr
                    </th>
                    {profiles.map((p, idx) => (
                      <th
                        key={p.subfund.subfundId}
                        className="py-4 px-4 min-w-[200px] border-l border-slate-800 align-top"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div
                              className="w-2.5 h-2.5 rounded-full mb-1.5"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <Link
                              href={`/fundusze/${p.subfund.subfundId}`}
                              className="font-bold text-sm text-slate-100 hover:text-emerald-400 transition-colors block line-clamp-2"
                            >
                              {p.subfund.name}
                            </Link>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {p.subfund.nationalCode}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFund(p.subfund.subfundId)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Usuń z porównania"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {/* Category: Status & Podstawowe */}
                  <tr className="bg-slate-950/40 font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                    <td colSpan={profiles.length + 1} className="py-2.5 px-4">
                      1. Informacje podstawowe i status
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Towarzystwo (TFI)</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {p.company?.name || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Typ prawny</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800 font-bold">
                        {p.subfund.type}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Klasyfikacja / Kategoria</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {p.subfund.classification || "—"} {p.subfund.category ? `(${p.subfund.category})` : ""}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Status w rejestrze</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        <StatusBadge
                          isActive={p.subfund.isActive}
                          isLiquidating={p.subfund.isLiquidating}
                          liquidationStartDate={p.subfund.liquidationStartDate}
                          liquidationEndDate={p.subfund.liquidationEndDate}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Data rozpoczęcia (rejestr)</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {formatDate(p.subfund.fromDate)}
                      </td>
                    ))}
                  </tr>

                  {/* Category: Profil Ryzyka */}
                  <tr className="bg-slate-950/40 font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                    <td colSpan={profiles.length + 1} className="py-2.5 px-4">
                      2. Profil Ryzyka i Benchmark
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Wskaźnik Ryzyka (SRI 1-7)</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        <RiskBadge level={p.latestKid?.riskLevel} size="md" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Benchmark referencyjny</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800 text-xs">
                        {p.latestKid?.hasBenchmark && p.latestKid?.benchmark ? (
                          <span className="text-slate-200 font-medium">{p.latestKid.benchmark}</span>
                        ) : (
                          <span className="text-slate-500 italic">Brak benchmarku</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Category: Koszty i opłaty */}
                  <tr className="bg-slate-950/40 font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                    <td colSpan={profiles.length + 1} className="py-2.5 px-4">
                      3. Koszty i Opłaty (wg KID)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Opłata bieżąca / zarządzanie</td>
                    {profiles.map((p) => (
                      <td
                        key={p.subfund.subfundId}
                        className="py-3 px-4 border-l border-slate-800 font-bold text-emerald-400 text-base"
                      >
                        {formatPercent(p.latestKid?.managementAndOtherFeesRate)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Maks. opłata wstępna</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {formatPercent(p.latestKid?.maxEntryFeeRate)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Maks. opłata za umorzenie</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {formatPercent(p.latestKid?.maxExitFeeRate)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Koszty transakcyjne</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {formatPercent(p.latestKid?.transactionCostsRate)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Opłata za sukces</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800 text-xs">
                        {p.latestKid?.hasSuccessFee ? (
                          <span className="text-amber-400">
                            Tak {p.latestKid.successFee ? `(${p.latestKid.successFee})` : ""}
                          </span>
                        ) : (
                          <span className="text-slate-500">Brak</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Category: Wycena bieżąca */}
                  <tr className="bg-slate-950/40 font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                    <td colSpan={profiles.length + 1} className="py-2.5 px-4">
                      4. Ostatnia wycena jednostki
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Ostatnia wartość jednostki</td>
                    {profiles.map((p) => {
                      const latestVal = p.valuations[0];
                      return (
                        <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                          {latestVal ? (
                            <div>
                              <div className="font-bold text-slate-100 text-base">
                                {formatCurrency(latestVal.valuation, latestVal.currency)}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Stan na: {formatDate(latestVal.date)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Dokument KID */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-400">Oficjalny plik KID (UKNF)</td>
                    {profiles.map((p) => (
                      <td key={p.subfund.subfundId} className="py-3 px-4 border-l border-slate-800">
                        {p.latestKid ? (
                          <a
                            href={`https://wybieramfundusze-api.knf.gov.pl/v1/key-information/${p.latestKid.documentUuid}/file`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Pobierz PDF
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Performance Chart */}
          {chartData.length > 1 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Znormalizowana stopa zwrotu (%) w czasie
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Porównanie względnej zmiany wartości jednostek w punktach procentowych (baza początkowa: 0%).
                </p>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => {
                        const date = new Date(d);
                        return `${date.getDate()} ${date.toLocaleString("pl-PL", { month: "short" })}`;
                      }}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                              <div className="text-slate-400 font-semibold mb-1">
                                {formatDate(String(label))}
                              </div>
                              {payload.map((item: any, i: number) => {
                                const profile = profiles[i];
                                return (
                                  <div key={i} className="flex items-center justify-between gap-4">
                                    <span className="flex items-center gap-1.5 text-slate-300">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                      />
                                      <span className="truncate max-w-[150px]">
                                        {profile?.subfund.name || item.name}
                                      </span>
                                    </span>
                                    <span className="font-bold text-slate-100">
                                      {item.value >= 0 ? "+" : ""}
                                      {item.value}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
                      formatter={(value) => {
                        const fundIdMatch = value.replace("fund_", "");
                        const prof = profiles.find((p) => String(p.subfund.subfundId) === fundIdMatch);
                        return <span className="text-slate-300 font-medium">{prof?.subfund.name || value}</span>;
                      }}
                    />
                    {profiles.map((p, idx) => (
                      <Line
                        key={p.subfund.subfundId}
                        type="monotone"
                        dataKey={`fund_${p.subfund.subfundId}`}
                        name={`fund_${p.subfund.subfundId}`}
                        stroke={COLORS[idx % COLORS.length]}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

