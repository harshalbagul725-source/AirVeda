import React from "react";
import { PollutantValue } from "../types";
import { getAQITheme } from "../utils/aqiColors";

interface PollutantCardProps {
  name: string;
  fullName: string;
  data: PollutantValue;
  standardLimit: number; // e.g. CPCB 24-hr limit: PM2.5=60, PM10=100, NO2=80, SO2=80, CO=2, O3=100
  isPrimary?: boolean;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  name,
  fullName,
  data,
  standardLimit,
  isPrimary = false,
}) => {
  const theme = getAQITheme(data.category);
  const ratio = Math.min((data.value / (standardLimit * 2)) * 100, 100);
  const isAboveStandard = data.value > standardLimit;

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isPrimary
          ? "bg-white shadow-sm border-slate-300 ring-1 ring-slate-200"
          : "bg-white/80 border-slate-200/90"
      }`}
      role="region"
      aria-label={`${fullName} concentration: ${data.value} ${data.unit}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900 font-['Outfit']">{name}</span>
            {isPrimary && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                Primary Hazard
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium block">{fullName}</span>
        </div>

        {data.category && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
            {data.category}
          </span>
        )}
      </div>

      {/* Main Number & Unit */}
      <div className="flex items-baseline gap-1.5 my-2">
        <span className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
          {data.value}
        </span>
        <span className="text-sm font-semibold text-slate-500">{data.unit}</span>
      </div>

      {/* CPCB Sub-Index badge & Standard threshold comparison */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>CPCB Sub-Index: <strong className="text-slate-800">{data.sub_index ?? "—"}</strong></span>
        <span>
          CPCB 24h Limit:{" "}
          <strong className={isAboveStandard ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
            {standardLimit} {data.unit}
          </strong>
        </span>
      </div>

      {/* Visual Level Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${ratio}%`, backgroundColor: theme.colorHex }}
        />
      </div>

      {/* Health Impact Explanation */}
      <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
        {data.description}
      </p>
    </div>
  );
};

