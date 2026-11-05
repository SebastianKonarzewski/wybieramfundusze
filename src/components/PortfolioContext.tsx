"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface PortfolioFund {
  subfundId: number;
  name: string;
  type?: string;
  category?: string | null;
  allocation?: number; // e.g. 50 (for 50%), or cash amount, or units
}

interface PortfolioContextType {
  portfolioFunds: PortfolioFund[];
  addFund: (fund: PortfolioFund) => void;
  removeFund: (subfundId: number) => void;
  toggleFund: (fund: PortfolioFund) => void;
  updateFundAllocation: (subfundId: number, allocation: number) => void;
  setFunds: (funds: PortfolioFund[]) => void;
  setAllAllocationsEqual: () => void;
  clearPortfolio: () => void;
  isInPortfolio: (subfundId: number) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const MAX_PORTFOLIO_FUNDS = 15;

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [portfolioFunds, setPortfolioFunds] = useState<PortfolioFund[]>([]);

  // Load saved portfolio from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("knf_portfolio_funds");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPortfolioFunds(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveFunds = (funds: PortfolioFund[]) => {
    setPortfolioFunds(funds);
    try {
      localStorage.setItem("knf_portfolio_funds", JSON.stringify(funds));
    } catch {
      // ignore storage errors
    }
  };

  const addFund = (fund: PortfolioFund) => {
    if (portfolioFunds.length >= MAX_PORTFOLIO_FUNDS) {
      alert(`Możesz dodać maksymalnie ${MAX_PORTFOLIO_FUNDS} funduszy do portfela.`);
      return;
    }
    if (!portfolioFunds.some((f) => f.subfundId === fund.subfundId)) {
      const newCount = portfolioFunds.length + 1;
      const equalWeight = Math.round((100 / newCount) * 10) / 10;
      // Re-normalize weights equally by default
      const updated = [
        ...portfolioFunds.map((f) => ({ ...f, allocation: equalWeight })),
        { ...fund, allocation: equalWeight },
      ];
      saveFunds(updated);
    }
  };

  const removeFund = (subfundId: number) => {
    const remaining = portfolioFunds.filter((f) => f.subfundId !== subfundId);
    if (remaining.length > 0) {
      const equalWeight = Math.round((100 / remaining.length) * 10) / 10;
      saveFunds(remaining.map((f) => ({ ...f, allocation: equalWeight })));
    } else {
      saveFunds([]);
    }
  };

  const toggleFund = (fund: PortfolioFund) => {
    if (portfolioFunds.some((f) => f.subfundId === fund.subfundId)) {
      removeFund(fund.subfundId);
    } else {
      addFund(fund);
    }
  };

  const updateFundAllocation = (subfundId: number, allocation: number) => {
    const updated = portfolioFunds.map((f) =>
      f.subfundId === subfundId ? { ...f, allocation: Math.max(0, allocation) } : f
    );
    saveFunds(updated);
  };

  const setAllAllocationsEqual = () => {
    if (portfolioFunds.length === 0) return;
    const equalWeight = Math.round((100 / portfolioFunds.length) * 10) / 10;
    saveFunds(portfolioFunds.map((f) => ({ ...f, allocation: equalWeight })));
  };

  const setFunds = (funds: PortfolioFund[]) => {
    saveFunds(funds.slice(0, MAX_PORTFOLIO_FUNDS));
  };

  const clearPortfolio = () => {
    saveFunds([]);
  };

  const isInPortfolio = (subfundId: number) => {
    return portfolioFunds.some((f) => f.subfundId === subfundId);
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolioFunds,
        addFund,
        removeFund,
        toggleFund,
        updateFundAllocation,
        setFunds,
        setAllAllocationsEqual,
        clearPortfolio,
        isInPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}

