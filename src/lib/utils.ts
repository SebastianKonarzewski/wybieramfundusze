import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type Locale = "pl" | "en";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers according to active locale:
 * - PL: Decimal separator: comma (","), Thousands: space (" ") e.g. 1 000,07
 * - EN: Decimal separator: dot ("."), Thousands: comma (",") e.g. 1,000.07
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2,
  locale: Locale = "pl"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";

  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      useGrouping: "always",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  return new Intl.NumberFormat("pl-PL", {
    useGrouping: "always",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(value)
    .replace(/\u202F|\u00A0/g, " ");
}

/**
 * Format currency:
 * - PL: "1 000,07 zł"
 * - EN: "PLN 1,000.07" (or "1,000.07 EUR")
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = "PLN",
  locale: Locale = "pl"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const numStr = formatNumber(value, 2, locale);

  if (locale === "en") {
    const code = currency === "zł" ? "PLN" : currency;
    return `${code} ${numStr}`;
  }

  const currLabel = currency === "PLN" ? "zł" : currency;
  return `${numStr} ${currLabel}`;
}

/**
 * Format percent:
 * - PL: "1,25%" or "-0,50%"
 * - EN: "1.25%" or "-0.50%"
 */
export function formatPercent(
  value: number | null | undefined,
  digits: number = 2,
  locale: Locale = "pl"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const percentVal = value * 100;
  const numStr = formatNumber(percentVal, digits, locale);
  return `${numStr}%`;
}

/**
 * Format date:
 * - PL: "30 wrz 2026"
 * - EN: "Sep 30, 2026"
 */
export function formatDate(
  dateString: string | null | undefined,
  locale: Locale = "pl"
): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (locale === "en") {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    }

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
 * Format large numbers (AUM):
 * - PL: "461,45 mld zł" or "66,87 mln USD"
 * - EN: "PLN 461.45 bn" or "USD 66.87 m"
 */
export function formatLargeNumber(
  value: number | null | undefined,
  locale: Locale = "pl",
  currency: string = "PLN"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";

  const currCode = currency === "zł" ? "PLN" : currency;
  const currLabelPl = currCode === "PLN" ? "zł" : currCode;

  if (locale === "en") {
    if (value >= 1_000_000_000_000) {
      return `${currCode} ${formatNumber(value / 1_000_000_000_000, 2, "en")} trn`;
    }
    if (value >= 1_000_000_000) {
      return `${currCode} ${formatNumber(value / 1_000_000_000, 2, "en")} bn`;
    }
    if (value >= 1_000_000) {
      return `${currCode} ${formatNumber(value / 1_000_000, 2, "en")} m`;
    }
    if (value >= 1_000) {
      return `${currCode} ${formatNumber(value / 1_000, 2, "en")} k`;
    }
    return `${currCode} ${formatNumber(value, 2, "en")}`;
  }

  // Polish formatting
  if (value >= 1_000_000_000_000) {
    const val = value / 1_000_000_000_000;
    return `${formatNumber(val, 2, "pl")} bln ${currLabelPl}`;
  }
  if (value >= 1_000_000_000) {
    const val = value / 1_000_000_000;
    return `${formatNumber(val, 2, "pl")} mld ${currLabelPl}`;
  }
  if (value >= 1_000_000) {
    const val = value / 1_000_000;
    return `${formatNumber(val, 2, "pl")} mln ${currLabelPl}`;
  }
  if (value >= 1_000) {
    const val = value / 1_000;
    return `${formatNumber(val, 2, "pl")} tys. ${currLabelPl}`;
  }
  return `${formatNumber(value, 2, "pl")} ${currLabelPl}`;
}

/**
 * Format large numbers into value and unit parts:
 * - PL: { value: "399,60", unit: "mld zł" } or { value: "66,87", unit: "mln USD" }
 * - EN: { value: "399.60", unit: "bn PLN" } or { value: "66.87", unit: "m USD" }
 */
export function formatLargeNumberParts(
  value: number | null | undefined,
  locale: Locale = "pl",
  currency: string = "PLN"
): { value: string; unit: string } {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: "—", unit: "" };
  }

  const currCode = currency === "zł" ? "PLN" : currency;
  const currLabelPl = currCode === "PLN" ? "zł" : currCode;

  if (locale === "en") {
    if (value >= 1_000_000_000_000) {
      return { value: formatNumber(value / 1_000_000_000_000, 2, "en"), unit: `trn ${currCode}` };
    }
    if (value >= 1_000_000_000) {
      return { value: formatNumber(value / 1_000_000_000, 2, "en"), unit: `bn ${currCode}` };
    }
    if (value >= 1_000_000) {
      return { value: formatNumber(value / 1_000_000, 2, "en"), unit: `m ${currCode}` };
    }
    if (value >= 1_000) {
      return { value: formatNumber(value / 1_000, 2, "en"), unit: `k ${currCode}` };
    }
    return { value: formatNumber(value, 2, "en"), unit: currCode };
  }

  // Polish formatting
  if (value >= 1_000_000_000_000) {
    const val = value / 1_000_000_000_000;
    return { value: formatNumber(val, 2, "pl"), unit: `bln ${currLabelPl}` };
  }
  if (value >= 1_000_000_000) {
    const val = value / 1_000_000_000;
    return { value: formatNumber(val, 2, "pl"), unit: `mld ${currLabelPl}` };
  }
  if (value >= 1_000_000) {
    const val = value / 1_000_000;
    return { value: formatNumber(val, 2, "pl"), unit: `mln ${currLabelPl}` };
  }
  if (value >= 1_000) {
    const val = value / 1_000;
    return { value: formatNumber(val, 2, "pl"), unit: `tys. ${currLabelPl}` };
  }
  return { value: formatNumber(value, 2, "pl"), unit: currLabelPl };
}
