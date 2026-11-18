import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Info,
  Clock,
} from "lucide-react";
import { AQIDataResponse } from "../types";
import { getAQITheme } from "../utils/aqiColors";

interface AQIDialProps {
  data: AQIDataResponse;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AQIDial: React.FC<AQIDialProps> = ({ data, onRefresh, isRefreshing }) => {
  const theme = getAQITheme(data.cpcb_category);
  const aqi = data.cpcb_aqi;
  // Calculate percentage for circular progress (0 to 500 max)
  const clampedAQI = Math.min(Math.max(aqi, 0), 500);
  const percentage = (clampedAQI / 500) * 100;
  
  // Circumference of radius 80 circle: 2 * PI * 80 ≈ 502.65
  const strokeDashoffset = 502.65 - (percentage / 100) * 502.65;

  const renderIcon = () => {
    switch (theme.iconName) {
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-emerald-600" aria-hidden="true" />;
      case "CheckCircle2":
        return <CheckCircle2 className="w-6 h-6 text-lime-600" aria-hidden="true" />;
      case "AlertCircle":
        return <AlertCircle className="w-6 h-6 text-amber-600" aria-hidden="true" />;
      case "AlertTriangle":
        return <AlertTriangle className="w-6 h-6 text-orange-600" aria-hidden="true" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-6 h-6 text-red-600" aria-hidden="true" />;
      case "Flame":
      default:
        return <Flame className="w-6 h-6 text-rose-700 animate-bounce" aria-hidden="true" />;
    }
  };

  const formattedTime = new Date(data.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow relative overflow-hidden"
      role="region"
      aria-label={`Air quality summary for ${data.city}`}
    >
      {/* Top Banner: Location, Freshness & Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 font-['Outfit']">
            Current Air Quality
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
            {data.city}
            {data.state && <span className="text-slate-400 text-lg font-normal ml-2">({data.state})</span>}
          </h1>
        </div>

        {/* Data Mode & Freshness Badge */}
        <div className="flex items-center gap-2">
          {data.data_mode === "live" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" aria-hidden="true" />
              CURRENT MODEL ESTIMATE
            </span>
          ) : data.data_mode === "cached" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              CACHED MODEL (15m)
            </span>
          ) : null}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none disabled:opacity-50"
              aria-label="Refresh Open-Meteo air-quality data"
              title="Refresh Open-Meteo air-quality data"
            >
              <Clock className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Gauge & Category Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Circular Gauge Graphic with accessible SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div
            className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center"
            role="img"
            aria-label={`Air Quality Index: ${aqi}, Category: ${data.cpcb_category}. ${theme.shortWarning}`}
          >
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200" aria-hidden="true">
              {/* Background track circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                className="stroke-slate-100"
                strokeWidth="16"
                fill="transparent"
              />
              {/* Animated Progress colored stroke */}
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke={theme.colorHex}
                strokeWidth="16"
                strokeDasharray="502.65"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 font-['Outfit']">
                CPCB NAQI
              </span>
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter my-1">
                {aqi}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {renderIcon()}
                <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                  {data.cpcb_category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">
            Scale: 0 (Good) to 500+ (Severe) • Indian Standard
          </p>
        </div>

        {/* Right Details: Health impact, prominent pollutant, US AQI comparison */}
        <div className="md:col-span-7 space-y-4">
          {/* Main Health Advisory Pill Card */}
          <div className={`p-5 rounded-2xl border ${theme.badgeBg} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2 font-bold text-base">
              {renderIcon()}
              <span>Health Status: {data.cpcb_category} Severity</span>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-95">
              {theme.shortWarning}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Largest sub-index</span>
              <span className="text-lg font-black text-slate-900 font-['Outfit']">
                {data.prominent_pollutant}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">Drives overall AQI</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">US EPA AQI (PM2.5)</span>
              <span className="text-lg font-black text-indigo-900 font-['Outfit']">
                {data.us_aqi} AQI
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">{data.us_category}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-slate-500 block">Respiratory-Protection Guidance</span>
              <span className="text-xs text-slate-700 block mt-1 leading-snug">
                {data.health_risks.recommended_mask}
              </span>
            </div>
          </div>

          {/* Timestamp & Source Attribution */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              Source: {data.data_source}
            </span>
            <span>Model timestamp: {formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

