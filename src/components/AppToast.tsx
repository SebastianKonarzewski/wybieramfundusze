"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Briefcase, Scale, AlertTriangle, AlertCircle, Info, ArrowRight, X } from "lucide-react";
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

  // Single representative icon (no duplicates, no redundant ticks)
  let Icon = Briefcase;
  if (category === "compare") {
    Icon = Scale;
  } else if (category === "portfolio") {
    Icon = Briefcase;
  } else if (type === "warning") {
    Icon = AlertTriangle;
  } else if (type === "error") {
    Icon = AlertCircle;
  } else {
    Icon = Info;
  }

  // Muted, refined color palette harmonized with the app theme
  let borderClasses = "border-slate-200 dark:border-[#0e274d]";
  let badgeClasses = "bg-blue-50 dark:bg-[#071938] text-[#044CD0] dark:text-[#60a5fa] border border-blue-100 dark:border-[#0e274d]";
  let titleColorClasses = "text-slate-600 dark:text-slate-400";
  let progressBarClasses = "bg-[#044CD0] dark:bg-blue-500";

  if (type === "warning") {
    borderClasses = "border-amber-400/40 dark:border-amber-500/40";
    badgeClasses = "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60";
    titleColorClasses = "text-amber-600 dark:text-amber-400";
    progressBarClasses = "bg-amber-500";
  } else if (type === "error") {
    borderClasses = "border-rose-400/40 dark:border-rose-500/40";
    badgeClasses = "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60";
    titleColorClasses = "text-rose-600 dark:text-rose-400";
    progressBarClasses = "bg-rose-500";
  } else if (type === "info") {
    borderClasses = "border-slate-200 dark:border-[#0e274d]";
    badgeClasses = "bg-slate-100 dark:bg-[#071938] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#0e274d]";
    titleColorClasses = "text-slate-500 dark:text-slate-400";
    progressBarClasses = "bg-slate-400 dark:bg-slate-500";
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-18 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-[80] w-auto sm:w-[420px] max-w-[calc(100vw-1.5rem)] animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div
        key={activeToast.id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`toast-container relative overflow-hidden bg-white/95 dark:bg-[#051329]/95 border ${borderClasses} rounded-2xl p-3 sm:p-3.5 shadow-xl sm:shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 transition-all group`}
      >
        {/* Left: Single Icon & Text content */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-xl ${badgeClasses} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className={`text-xs font-medium ${titleColorClasses} leading-tight`}>
              {title}
            </div>
            {message && (
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-snug mt-0.5">
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Right: Optional Action Button & Close Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {action && (
            <>
              {action.href ? (
                <Link
                  href={action.href}
                  onClick={() => hideToast(activeToast.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white transition-colors shadow-2xs shrink-0 cursor-pointer"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#044CD0] hover:bg-[#033eb0] text-white transition-colors shadow-2xs shrink-0 cursor-pointer"
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
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
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
