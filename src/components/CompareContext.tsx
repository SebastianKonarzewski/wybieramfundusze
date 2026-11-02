"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("knf_compare_funds");
      if (stored) {
        setSelectedFunds(JSON.parse(stored));
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
      alert("Możesz porównać maksymalnie 4 fundusze jednocześnie.");
      return;
    }
    if (!selectedFunds.some((f) => f.subfundId === fund.subfundId)) {
      saveFunds([...selectedFunds, fund]);
    }
  };

  const removeFund = (subfundId: number) => {
    saveFunds(selectedFunds.filter((f) => f.subfundId !== subfundId));
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

