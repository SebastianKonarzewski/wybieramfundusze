import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskBadgeProps {
  level: number | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, showLabel = true, size = "md" }: RiskBadgeProps) {
  if (level === null || level === undefined || level < 1 || level > 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 bg-slate-900 border border-slate-800">
        SRI: b/d
      </span>
    );
  }

  // SRI styling
  const getColor = (sri: number) => {
    switch (sri) {
      case 1:
        return {
          bg: "bg-emerald-950/70 border-emerald-600/40 text-emerald-300",
          desc: "Bardzo niskie ryzyko",
          dot: "bg-emerald-400",
        };
      case 2:
        return {
          bg: "bg-teal-950/70 border-teal-600/40 text-teal-300",
          desc: "Niskie ryzyko",
          dot: "bg-teal-400",
        };
      case 3:
        return {
          bg: "bg-cyan-950/70 border-cyan-600/40 text-cyan-300",
          desc: "Średnio-niskie",
          dot: "bg-cyan-400",
        };
      case 4:
        return {
          bg: "bg-amber-950/70 border-amber-600/40 text-amber-300",
          desc: "Umiarkowane ryzyko",
          dot: "bg-amber-400",
        };
      case 5:
        return {
          bg: "bg-orange-950/70 border-orange-600/40 text-orange-300",
          desc: "Średnio-wysokie",
          dot: "bg-orange-400",
        };
      case 6:
        return {
          bg: "bg-rose-950/70 border-rose-600/40 text-rose-300",
          desc: "Wysokie ryzyko",
          dot: "bg-rose-400",
        };
      case 7:
        return {
          bg: "bg-red-950/80 border-red-500/50 text-red-300",
          desc: "Bardzo wysokie",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-700 text-slate-300",
          desc: "Nieokreślone",
          dot: "bg-slate-400",
        };
    }
  };

  const info = getColor(level);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${info.bg} ${
        size === "sm" ? "text-xs" : size === "lg" ? "text-sm py-1.5 px-3" : "text-xs"
      }`}
      title={`Wskaźnik ogólnego ryzyka (SRI) z dokumentu KID: ${level}/7 — ${info.desc}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <span
            key={num}
            className={`w-1.5 h-3 rounded-xs ${
              num <= level ? info.dot : "bg-slate-800"
            }`}
          />
        ))}
      </div>
      <span className="font-bold ml-1">SRI {level}/7</span>
      {showLabel && <span className="opacity-80 text-[10px] hidden sm:inline">({info.desc})</span>}
    </div>
  );
}

