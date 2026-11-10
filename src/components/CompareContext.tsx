"use client";

import React, { createContext, useContext, useEffect, useState, startTransition } from "react";
import { useToast } from "./ToastContext";
import { useTranslation } from "@/lib/i18n";

export interface SelectedFund {
  subfundId: number;
  name: string;
  type?: string;
  category?: string | null;
}

interface CompareContextType {
  selectedFunds: SelectedFund[];
  addFund: (fund: SelectedFund) => void;
  removeFund: (subfundId: number) => void;
  toggleFund: (fund: SelectedFund) => void;
  clearFunds: () => void;
  isSelected: (subfundId: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedFunds, setSelectedFunds] = useState<SelectedFund[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("knf_compare_funds");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid: SelectedFund[] = parsed
            .filter(
              (f): f is SelectedFund =>
                Boolean(f) && typeof f.subfundId === "number" && typeof f.name === "string"
            )
            .slice(0, 4)
            .map((f) => ({
              subfundId: f.subfundId,
              name: String(f.name).slice(0, 200),
              type: typeof f.type === "string" ? f.type : undefined,
              category: typeof f.category === "string" ? f.category : null,
            }));
          startTransition(() => {
            setSelectedFunds(valid);
          });
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveFunds = (funds: SelectedFund[]) => {
    setSelectedFunds(funds);
    try {
      localStorage.setItem("knf_compare_funds", JSON.stringify(funds));
    } catch {
      // ignore storage errors
    }
  };

  const addFund = (fund: SelectedFund) => {
    if (selectedFunds.length >= 4) {
      toast.warning(t.compare.limitWarningTitle, {
        message: t.compare.toastLimitReached,
        category: "compare",
      });
      return;
    }
    if (!selectedFunds.some((f) => f.subfundId === fund.subfundId)) {
      const nextFunds = [...selectedFunds, fund];
      saveFunds(nextFunds);
      toast.success(t.compare.toastAdded, {
        message: fund.name,
        category: "compare",
        action: {
          label: t.common.compare,
          href: "/porownywarka",
        },
      });
    }
  };

  const removeFund = (subfundId: number) => {
    const fundToRemove = selectedFunds.find((f) => f.subfundId === subfundId);
    saveFunds(selectedFunds.filter((f) => f.subfundId !== subfundId));
    if (fundToRemove) {
      toast.info(t.compare.toastRemoved, {
        message: fundToRemove.name,
        category: "compare",
        duration: 3000,
      });
    }
  };

  const toggleFund = (fund: SelectedFund) => {
    if (selectedFunds.some((f) => f.subfundId === fund.subfundId)) {
      removeFund(fund.subfundId);
    } else {
      addFund(fund);
    }
  };

  const clearFunds = () => {
    saveFunds([]);
  };

  const isSelected = (subfundId: number) => {
    return selectedFunds.some((f) => f.subfundId === subfundId);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedFunds,
        addFund,
        removeFund,
        toggleFund,
        clearFunds,
        isSelected,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
