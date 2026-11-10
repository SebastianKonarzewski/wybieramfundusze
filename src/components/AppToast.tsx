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

  // Single clean icon matching the category
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

  // Refined palette matching the comparison dock aesthetic with high contrast progress bar in light/dark mode
  let borderClasses = "border-[#044CD0]/40 dark:border-[#044CD0]/60";
  let badgeClasses = "bg-blue-50 dark:bg-[#071938] text-[#044CD0] dark:text-[#60a5fa] border border-blue-200/70 dark:border-[#0e274d]";
  let titleColorClasses = "text-[#044CD0] dark:text-[#60a5fa]";
  let progressBarClasses = "bg-[#044CD0] dark:bg-[#3b82f6]";
  let progressTrackClasses = "bg-blue-100/90 dark:bg-slate-800";

  if (type === "warning") {
    borderClasses = "border-amber-400/50 dark:border-amber-500/60";
    badgeClasses = "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60";
    titleColorClasses = "text-amber-600 dark:text-amber-400";
    progressBarClasses = "bg-amber-500";
    progressTrackClasses = "bg-amber-100 dark:bg-amber-950/60";
  } else if (type === "error") {
    borderClasses = "border-rose-400/50 dark:border-rose-500/60";
    badgeClasses = "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60";
    titleColorClasses = "text-rose-600 dark:text-rose-400";
    progressBarClasses = "bg-rose-500";
    progressTrackClasses = "bg-rose-100 dark:bg-rose-950/60";
  } else if (type === "info") {
    borderClasses = "border-slate-300/80 dark:border-[#0e274d]";
    badgeClasses = "bg-slate-100 dark:bg-[#071938] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#0e274d]";
    titleColorClasses = "text-slate-500 dark:text-slate-400";
    progressBarClasses = "bg-slate-500 dark:bg-slate-400";
    progressTrackClasses = "bg-slate-200 dark:bg-slate-800";
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%-1.5rem)] sm:w-[480px] max-w-lg animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none"
    >
      <div
        key={activeToast.id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`pointer-events-auto toast-container relative overflow-hidden bg-white/98 dark:bg-[#030d22]/98 border-2 ${borderClasses} rounded-2xl p-3 sm:p-3.5 shadow-[0_12px_36px_rgba(4,76,208,0.15),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(4,76,208,0.22)] backdrop-blur-md flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 transition-all group`}
      >
        {/* Left: Icon & Spacious Text Content */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-xl ${badgeClasses} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className={`text-xs font-semibold ${titleColorClasses} leading-tight select-none`}>
              {title}
            </div>
            {message && (
              <div
                className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mt-0.5 break-words"
                title={message}
              >
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    hideToast(activeToast.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#044CD0] hover:bg-[#033eb0] text-white shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => hideToast(activeToast.id)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#071938] rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Zamknij powiadomienie"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Progress Bar: Visual Countdown Timer */}
        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${progressTrackClasses} overflow-hidden pointer-events-none`}>
          <div
            className={`toast-progress-bar h-full w-full ${progressBarClasses}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
