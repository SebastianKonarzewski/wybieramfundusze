"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Briefcase, Scale, Check, AlertTriangle, AlertCircle, Info, ArrowRight, X } from "lucide-react";
import { useToast } from "./ToastContext";

export function AppToast() {
  const { activeToast, hideToast } = useToast();
  const [, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(4500);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!activeToast) return;
    const duration = activeToast.duration ?? 4500;
    remainingTimeRef.current = duration;
    startTimeRef.current = Date.now();
    setIsPaused(false);

    timerRef.current = setTimeout(() => {
      hideToast(activeToast.id);
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeToast?.id, activeToast?.duration, hideToast]);

  if (!activeToast) return null;

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(1500, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      hideToast(activeToast.id);
    }, remainingTimeRef.current);
    setIsPaused(false);
  };

  const { type, title, message, category, action, duration = 4500 } = activeToast;

  // Visual Theme mapping based on type
  let borderClasses = "border-blue-500/40 dark:border-blue-500/50";
  let badgeClasses = "bg-blue-500/15 text-[#044CD0] dark:text-blue-400 border border-blue-500/30";
  let titleColorClasses = "text-[#044CD0] dark:text-blue-400";
  let progressBarClasses = "bg-[#044CD0] dark:bg-blue-400";

  if (type === "success") {
    borderClasses = "border-emerald-500/40 dark:border-emerald-500/50";
    badgeClasses = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
    titleColorClasses = "text-emerald-600 dark:text-emerald-400";
    progressBarClasses = "bg-emerald-500";
  } else if (type === "warning") {
    borderClasses = "border-amber-500/50 dark:border-amber-500/50";
    badgeClasses = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30";
    titleColorClasses = "text-amber-600 dark:text-amber-400";
    progressBarClasses = "bg-amber-500";
  } else if (type === "error") {
    borderClasses = "border-rose-500/40 dark:border-rose-500/50";
    badgeClasses = "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30";
    titleColorClasses = "text-rose-600 dark:text-rose-400";
    progressBarClasses = "bg-rose-500";
  }

  // Choose appropriate main icon
  let MainIcon = Check;
  if (type === "warning") {
    MainIcon = AlertTriangle;
  } else if (type === "error") {
    MainIcon = AlertCircle;
  } else if (type === "info") {
    MainIcon = category === "compare" ? Scale : category === "portfolio" ? Briefcase : Info;
  } else if (type === "success") {
    MainIcon = category === "compare" ? Scale : Check;
  }

  // Micro category icon for the title line
  let CategoryIcon = Info;
  if (category === "portfolio") CategoryIcon = Briefcase;
  else if (category === "compare") CategoryIcon = Scale;
  else if (type === "warning") CategoryIcon = AlertTriangle;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-18 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-60 max-w-sm sm:max-w-md w-auto animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div
        key={activeToast.id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`toast-container relative overflow-hidden bg-white/95 dark:bg-[#051329]/95 border ${borderClasses} rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 transition-all group`}
      >
        {/* Left: Icon & Text content */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl ${badgeClasses} flex items-center justify-center shrink-0`}>
            <MainIcon className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className={`text-[11px] font-semibold ${titleColorClasses} uppercase tracking-wider flex items-center gap-1.5`}>
              <CategoryIcon className="w-3 h-3 shrink-0" />
              <span className="truncate">{title}</span>
            </div>
            {message && (
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px] sm:max-w-[230px]">
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Right: Optional Action Button & Close Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {action && (
            <>
              {action.href ? (
                <Link
                  href={action.href}
                  onClick={() => hideToast(activeToast.id)}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#044CD0] hover:bg-blue-600 text-white transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    hideToast(activeToast.id);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#044CD0] hover:bg-blue-600 text-white transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => hideToast(activeToast.id)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Zamknij powiadomienie"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Progress Bar: Visual Countdown Timer */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/80 overflow-hidden pointer-events-none">
          <div
            className={`toast-progress-bar h-full w-full ${progressBarClasses}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
