"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Accessibility,
  Sun,
  Eye,
  Zap,
  RotateCcw,
  X,
  Type,
  Check,
} from "lucide-react";
import { useAccessibility, FontSize } from "@/lib/accessibility";
import { useTranslation } from "@/lib/i18n";

interface AccessibilityToolbarProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccessibilityToolbar({
  isOpen: controlledIsOpen,
  onOpenChange,
}: AccessibilityToolbarProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
    if (!isControlled) {
      setInternalIsOpen(open);
    }
  };

  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    resetAccessibility,
  } = useAccessibility();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const fontSizes: { size: FontSize; label: string; iconLabel: string }[] = [
    { size: "normal", label: t.a11y.textSizeNormal, iconLabel: "A" },
    { size: "large", label: t.a11y.textSizeLarge, iconLabel: "A+" },
    { size: "xlarge", label: t.a11y.textSizeXLarge, iconLabel: "A++" },
  ];

  const hasNonDefaultSettings =
    fontSize !== "normal" || highContrast || reducedMotion;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={t.a11y.toolbarTitle}
        aria-label={t.a11y.toolbarTitle}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex items-center justify-center relative shrink-0 ${
          isOpen || hasNonDefaultSettings
            ? "bg-[#044CD0] text-white border-blue-400 shadow-xs"
            : "bg-[#030a16] text-slate-300 border-[#0e274d] hover:text-white hover:border-[#044CD0]/60"
        }`}
      >
        <Accessibility className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        {hasNonDefaultSettings && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#030a16]" />
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={t.a11y.toolbarTitle}
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#051329] border border-[#0e274d] rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-4 text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#0e274d]">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
              <Accessibility className="w-4 h-4 text-[#3b82f6]" />
              <span>{t.a11y.toolbarTitle}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              aria-label={t.common.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Text Size Section */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#3b82f6]" />
              {t.a11y.textSize}
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-[#030a16] p-1 rounded-xl border border-[#0e274d]">
              {fontSizes.map(({ size, label, iconLabel }) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`py-1.5 px-2 rounded-lg font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                    fontSize === size
                      ? "bg-[#044CD0] text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title={label}
                  aria-pressed={fontSize === size}
                >
                  <span className="text-sm font-black">{iconLabel}</span>
                  <span className="text-[9px] opacity-75 font-normal">
                    {size === "normal" ? "100%" : size === "large" ? "115%" : "130%"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="pt-2 border-t border-[#0e274d]/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">{t.a11y.highContrast}</div>
                <div className="text-[10px] text-slate-400">
                  {highContrast ? t.a11y.highContrastOn : t.a11y.highContrastOff}
                </div>
              </div>
            </div>

            <button
              onClick={toggleHighContrast}
              role="switch"
              aria-checked={highContrast}
              className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                highContrast ? "bg-amber-400" : "bg-[#030a16] border border-[#0e274d]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  highContrast
                    ? "translate-x-5 bg-black"
                    : "translate-x-0 bg-slate-400"
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="pt-2 border-t border-[#0e274d]/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">{t.a11y.reducedMotion}</div>
                <div className="text-[10px] text-slate-400">
                  {reducedMotion ? t.a11y.reducedMotionOn : t.a11y.reducedMotionOff}
                </div>
              </div>
            </div>

            <button
              onClick={toggleReducedMotion}
              role="switch"
              aria-checked={reducedMotion}
              className={`w-11 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                reducedMotion ? "bg-[#044CD0]" : "bg-[#030a16] border border-[#0e274d]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  reducedMotion
                    ? "translate-x-5 bg-white"
                    : "translate-x-0 bg-slate-400"
                }`}
              />
            </button>
          </div>

          {/* Reset button if modified */}
          {hasNonDefaultSettings && (
            <div className="pt-2 border-t border-[#0e274d]/80">
              <button
                onClick={resetAccessibility}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#030a16] hover:bg-[#071938] border border-[#0e274d] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.a11y.resetSettings}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

