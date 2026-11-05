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
 * - PL: "461,45 mld zł"
 * - EN: "PLN 461.45 bn"
 */
export function formatLargeNumber(
  value: number | null | undefined,
  locale: Locale = "pl"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";

  if (locale === "en") {
    if (value >= 1_000_000_000_000) {
      return `PLN ${formatNumber(value / 1_000_000_000_000, 2, "en")} trn`;
    }
    if (value >= 1_000_000_000) {
      return `PLN ${formatNumber(value / 1_000_000_000, 2, "en")} bn`;
    }
    if (value >= 1_000_000) {
      return `PLN ${formatNumber(value / 1_000_000, 2, "en")} m`;
    }
    if (value >= 1_000) {
      return `PLN ${formatNumber(value / 1_000, 2, "en")} k`;
    }
    return `PLN ${formatNumber(value, 2, "en")}`;
  }

  // Polish formatting
  if (value >= 1_000_000_000_000) {
    const val = value / 1_000_000_000_000;
    return `${formatNumber(val, 2, "pl")} bln zł`;
  }
  if (value >= 1_000_000_000) {
    const val = value / 1_000_000_000;
    return `${formatNumber(val, 2, "pl")} mld zł`;
  }
  if (value >= 1_000_000) {
    const val = value / 1_000_000;
    return `${formatNumber(val, 2, "pl")} mln zł`;
  }
  if (value >= 1_000) {
    const val = value / 1_000;
    return `${formatNumber(val, 2, "pl")} tys. zł`;
  }
  return `${formatNumber(value, 2, "pl")} zł`;
}

/**
 * Format large numbers into value and unit parts:
 * - PL: { value: "399,60", unit: "mld zł" }
 * - EN: { value: "399.60", unit: "bn PLN" }
 */
export function formatLargeNumberParts(
  value: number | null | undefined,
  locale: Locale = "pl"
): { value: string; unit: string } {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: "—", unit: "" };
  }

  if (locale === "en") {
    if (value >= 1_000_000_000_000) {
      return { value: formatNumber(value / 1_000_000_000_000, 2, "en"), unit: "trn PLN" };
    }
    if (value >= 1_000_000_000) {
      return { value: formatNumber(value / 1_000_000_000, 2, "en"), unit: "bn PLN" };
    }
    if (value >= 1_000_000) {
      return { value: formatNumber(value / 1_000_000, 2, "en"), unit: "m PLN" };
    }
    if (value >= 1_000) {
      return { value: formatNumber(value / 1_000, 2, "en"), unit: "k PLN" };
    }
    return { value: formatNumber(value, 2, "en"), unit: "PLN" };
  }

  // Polish formatting
  if (value >= 1_000_000_000_000) {
    const val = value / 1_000_000_000_000;
    return { value: formatNumber(val, 2, "pl"), unit: "bln zł" };
  }
  if (value >= 1_000_000_000) {
    const val = value / 1_000_000_000;
    return { value: formatNumber(val, 2, "pl"), unit: "mld zł" };
  }
  if (value >= 1_000_000) {
    const val = value / 1_000_000;
    return { value: formatNumber(val, 2, "pl"), unit: "mln zł" };
  }
  if (value >= 1_000) {
    const val = value / 1_000;
    return { value: formatNumber(val, 2, "pl"), unit: "tys. zł" };
  }
  return { value: formatNumber(value, 2, "pl"), unit: "zł" };
}
