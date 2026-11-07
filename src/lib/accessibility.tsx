"use client";

import React, { createContext, useContext, useState, useEffect, startTransition } from "react";

export type FontSize = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  resetAccessibility: () => void;
  isPrivacyModalOpen: boolean;
  openPrivacyModal: () => void;
  closePrivacyModal: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof document !== "undefined") {
      if (document.documentElement.classList.contains("text-scale-xlarge")) return "xlarge";
      if (document.documentElement.classList.contains("text-scale-large")) return "large";
    }
    return "normal";
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("high-contrast");
    }
    return false;
  });
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("reduced-motion");
    }
    return false;
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("a11y_preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        startTransition(() => {
          if (parsed.fontSize === "normal" || parsed.fontSize === "large" || parsed.fontSize === "xlarge") {
            setFontSizeState(parsed.fontSize);
          }
          if (typeof parsed.highContrast === "boolean") {
            setHighContrast(parsed.highContrast);
          }
          if (typeof parsed.reducedMotion === "boolean") {
            setReducedMotion(parsed.reducedMotion);
          }
        });
      } else if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        startTransition(() => {
          setReducedMotion(true);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Synchronize document classes whenever states change
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.classList.remove("text-scale-normal", "text-scale-large", "text-scale-xlarge");
    root.classList.add(`text-scale-${fontSize}`);

    // High contrast
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Persist
    try {
      localStorage.setItem(
        "a11y_preferences",
        JSON.stringify({ fontSize, highContrast, reducedMotion })
      );
    } catch {
      // ignore
    }
  }, [fontSize, highContrast, reducedMotion]);

  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleReducedMotion = () => setReducedMotion((prev) => !prev);
  const resetAccessibility = () => {
    setFontSizeState("normal");
    setHighContrast(false);
    setReducedMotion(false);
  };

  const openPrivacyModal = () => setIsPrivacyModalOpen(true);
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
        reducedMotion,
        toggleReducedMotion,
        resetAccessibility,
        isPrivacyModalOpen,
        openPrivacyModal,
        closePrivacyModal,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    return {
      fontSize: "normal" as FontSize,
      setFontSize: () => {},
      highContrast: false,
      toggleHighContrast: () => {},
      reducedMotion: false,
      toggleReducedMotion: () => {},
      resetAccessibility: () => {},
      isPrivacyModalOpen: false,
      openPrivacyModal: () => {},
      closePrivacyModal: () => {},
    };
  }
  return ctx;
}
