"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type FontSize = "normal" | "large" | "xlarge";
export type ThemeMode = "dark" | "light";

interface AccessibilityContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
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
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme_mode");
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      }
      const saved = localStorage.getItem("a11y_preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontSize === "normal" || parsed.fontSize === "large" || parsed.fontSize === "xlarge") {
          setFontSizeState(parsed.fontSize);
        }
        if (typeof parsed.highContrast === "boolean") {
          setHighContrast(parsed.highContrast);
        }
        if (typeof parsed.reducedMotion === "boolean") {
          setReducedMotion(parsed.reducedMotion);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Synchronize document classes whenever states change
  useEffect(() => {
    const root = document.documentElement;

    // Theme mode (dark or light)
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }

    try {
      localStorage.setItem("theme_mode", theme);
    } catch {
      // ignore
    }

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
  }, [theme, fontSize, highContrast, reducedMotion]);

  const setTheme = (t: ThemeMode) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleReducedMotion = () => setReducedMotion((prev) => !prev);
  const resetAccessibility = () => {
    setThemeState("dark");
    setFontSizeState("normal");
    setHighContrast(false);
    setReducedMotion(false);
  };

  const openPrivacyModal = () => setIsPrivacyModalOpen(true);
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
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
      theme: "dark" as ThemeMode,
      setTheme: () => {},
      toggleTheme: () => {},
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

