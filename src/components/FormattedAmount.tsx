"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";

interface FormattedCurrencyProps {
  value: number | null | undefined;
  currency?: string | null;
  className?: string;
  valueClassName?: string;
  unitClassName?: string;
}

export function FormattedCurrency({
  value,
  currency = "PLN",
  className = "inline-flex items-baseline gap-1",
  valueClassName = "",
  unitClassName = "text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap",
}: FormattedCurrencyProps) {
  const { formatCurrencyParts } = useTranslation();

  if (value === null || value === undefined || isNaN(value)) {
    return <span className={className}>—</span>;
  }

  const parts = formatCurrencyParts(value, currency || "PLN");

  return (
    <span className={className}>
      {parts.prefix && <span className={unitClassName}>{parts.unit}</span>}
      <span className={valueClassName}>{parts.value}</span>
      {!parts.prefix && <span className={unitClassName}>{parts.unit}</span>}
    </span>
  );
}

interface FormattedLargeNumberProps {
  value: number | null | undefined;
  currency?: string | null;
  className?: string;
  valueClassName?: string;
  unitClassName?: string;
}

export function FormattedLargeNumber({
  value,
  currency = "PLN",
  className = "inline-flex items-baseline gap-1",
  valueClassName = "",
  unitClassName = "text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap",
}: FormattedLargeNumberProps) {
  const { formatLargeNumberParts } = useTranslation();

  if (value === null || value === undefined || isNaN(value)) {
    return <span className={className}>—</span>;
  }

  const parts = formatLargeNumberParts(value, currency || "PLN");

  return (
    <span className={className}>
      <span className={valueClassName}>{parts.value}</span>
      <span className={unitClassName}>{parts.unit}</span>
    </span>
  );
}
