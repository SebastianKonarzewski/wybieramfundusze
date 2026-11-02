import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers strictly to Polish standard:
 * - Decimal separator: comma (",")
 * - Thousands separator: regular space (" ")
 * e.g. 1 000,07
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("pl-PL", {
    useGrouping: "always",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(value)
    .replace(/\u202F|\u00A0/g, " ");
}

/**
 * Format currency in Polish: e.g. "1 000,07 zł" or "2 727,41 PLN"
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = "zł"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const numStr = formatNumber(value, 2);
  const currLabel = currency === "PLN" ? "zł" : currency;
  return `${numStr} ${currLabel}`;
}

/**
 * Format percent in Polish: e.g. "1,25%" or "-0,50%"
 */
export function formatPercent(
  value: number | null | undefined,
  digits: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  // Value could be rate like 0.015 for 1.5% or already in percent
  const percentVal = value * 100;
  const numStr = formatNumber(percentVal, digits);
  return `${numStr}%`;
}

/**
 * Format date to Polish: e.g. "30 wrz 2026"
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format large numbers in Polish with spaces and comma:
 * e.g. "461,45 mld zł" or "399,60 mld zł"
 */
export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  if (value >= 1_000_000_000_000) {
    const val = value / 1_000_000_000_000;
    return `${formatNumber(val, 2)} bln zł`;
  }
  if (value >= 1_000_000_000) {
    const val = value / 1_000_000_000;
    return `${formatNumber(val, 2)} mld zł`;
  }
  if (value >= 1_000_000) {
    const val = value / 1_000_000;
    return `${formatNumber(val, 2)} mln zł`;
  }
  if (value >= 1_000) {
    const val = value / 1_000;
    return `${formatNumber(val, 2)} tys. zł`;
  }
  return `${formatNumber(value, 2)} zł`;
}
