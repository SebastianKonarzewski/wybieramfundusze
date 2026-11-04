"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center relative shrink-0 ${
        isLight
          ? "bg-white text-blue-600 border-slate-300 hover:bg-slate-50 hover:border-blue-500 shadow-xs"
          : "bg-[#030a16] text-slate-300 border-[#0e274d] hover:text-white hover:border-[#044CD0]/60"
      }`}
      title={isLight ? t.a11y.switchToDark : t.a11y.switchToLight}
      aria-label={t.a11y.themeToggle}
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-[#044CD0] transition-transform" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform" />
      )}
    </button>
  );
}
