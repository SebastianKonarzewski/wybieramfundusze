"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { AppToast } from "./AppToast";

export type ToastType = "success" | "info" | "warning" | "error";
export type ToastCategory = "portfolio" | "compare" | "general";

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  category?: ToastCategory;
  action?: ToastAction;
  duration?: number; // duration in ms, default 4500
}

export interface ShowToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  category?: ToastCategory;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  activeToast: ToastItem | null;
  showToast: (options: ShowToastOptions) => void;
  hideToast: (id?: string) => void;
  toast: {
    success: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) => void;
    info: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) => void;
    warning: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) => void;
    error: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);
  const toastCounterRef = useRef(0);

  const hideToast = useCallback((id?: string) => {
    setActiveToast((current) => {
      if (!current) return null;
      if (id && current.id !== id) return current;
      return null;
    });
  }, []);

  const showToast = useCallback((options: ShowToastOptions) => {
    toastCounterRef.current += 1;
    const id = `toast-${Date.now()}-${toastCounterRef.current}`;
    const newToast: ToastItem = {
      id,
      type: options.type || "info",
      title: options.title,
      message: options.message,
      category: options.category || "general",
      action: options.action,
      duration: options.duration ?? 4500,
    };
    setActiveToast(newToast);
  }, []);

  const toastHelpers = React.useMemo(
    () => ({
      success: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) =>
        showToast({ ...options, type: "success", title }),
      info: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) =>
        showToast({ ...options, type: "info", title }),
      warning: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) =>
        showToast({ ...options, type: "warning", title }),
      error: (title: string, options?: Omit<ShowToastOptions, "type" | "title">) =>
        showToast({ ...options, type: "error", title }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        activeToast,
        showToast,
        hideToast,
        toast: toastHelpers,
      }}
    >
      {children}
      <AppToast />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
