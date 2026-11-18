import React from "react";
import {
  Wind,
  Bot,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Thermometer,
  Droplets,
  Gauge,
} from "lucide-react";
import { AQIDataResponse } from "../types";
import { AQIDial } from "../components/AQIDial";

interface DashboardPageProps {
  aqiData: AQIDataResponse | null;
  isLoading: boolean;
  onNavigate: (tabId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  aqiData,
  isLoading,
  onNavigate,
  onRefresh,
  isRefreshing,
}) => {
  if (!aqiData) {
    if (isLoading) return null;
    return (
      <div className="py-16 px-6 text-center space-y-3 bg-white rounded-3xl border border-slate-200" role="status" aria-live="polite">
        <h1 className="text-xl font-bold text-slate-900">Current model data is unavailable</h1>
        <p className="text-sm text-slate-600">AirVeda will not substitute sample pollution values for current conditions.</p>
        <button onClick={onRefresh} disabled={isRefreshing} className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60">
          {isRefreshing ? "Checking..." : "Try again"}
        </button>
      </div>
    );
  }

  const isHighRisk = aqiData.cpcb_aqi > 200;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Elevated AQI advisory */}
      {isHighRisk && (
        <div
          className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          role="alert"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-white/20 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-white text-rose-900">
                  Smog Advisory
                </span>
                <span className="font-extrabold text-sm sm:text-base">
                  {aqiData.city} Air Quality is {aqiData.cpcb_category} (AQI: {aqiData.cpcb_aqi})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 mt-1 leading-relaxed">
                The current modelled AQI is elevated. Consider reducing prolonged or strenuous outdoor exposure, and follow local public-health advice and any individual care plan.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("assistant")}
            className="shrink-0 px-4 py-2 rounded-xl bg-white text-rose-900 font-bold text-xs sm:text-sm hover:bg-red-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            Get AI Precautions
          </button>
        </div>
      )}

      {/* Current modelled AQI */}
      <AQIDial data={aqiData} onRefresh={onRefresh} isRefreshing={isRefreshing} />

      {/* Weather & Atmospheric Conditions Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-['Outfit']">
          Atmospheric Weather Conditions • {aqiData.city}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Thermometer className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Temperature</span>
              <span className="text-lg font-bold text-slate-900 font-['Outfit']">
                {aqiData.weather.temperature}°C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Droplets className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Humidity</span>
              <span className="text-lg font-bold text-slate-900 font-['Outfit']">
                {aqiData.weather.humidity}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Wind className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Wind Velocity</span>
              <span className="text-lg font-bold text-slate-900 font-['Outfit']">
                {aqiData.weather.wind_speed} km/h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Gauge className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Weather State</span>
              <span className="text-sm font-bold text-slate-900 font-['Outfit'] truncate block">
                {aqiData.weather.weather_description}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Feature Cards (4-Column Gateway) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit']">
              Recommended Protective Actions
            </h2>
            <p className="text-xs text-slate-500">
              General exposure-reduction guidance informed by the current modelled AQI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI Assistant */}
          <div
            onClick={() => onNavigate("assistant")}
            className="group cursor-pointer rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate("assistant");
              }
            }}
            aria-label="Open AI Smart Pollution Assistant"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1 font-['Outfit'] group-hover:text-emerald-700 transition-colors">
                AI Smart Assistant
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask for pollution guidance using available model data; Gemini is optional.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Ask Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </div>

          {/* Card 2: Daily Planner */}
          <div
            onClick={() => onNavigate("planner")}
            className="group cursor-pointer rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate("planner");
              }
            }}
            aria-label="Open Smart Daily Routine Planner"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1 font-['Outfit'] group-hover:text-blue-700 transition-colors">
                Daily Routine Planner
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                General routine suggestions adapted to the current AQI category; timing is not an hourly forecast.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              <span>View Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </div>

          {/* Card 3: Indoor Air Quality */}
          <div
            onClick={() => onNavigate("indoor")}
            className="group cursor-pointer rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate("indoor");
              }
            }}
            aria-label="Open Indoor Air Quality Guide and Checklist"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1 font-['Outfit'] group-hover:text-teal-700 transition-colors">
                Indoor Air & Checklist
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filtration and source-control guidance, condition-aware ventilation notes, and an interactive home checklist.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
              <span>Home Checklist</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </div>

          {/* Card 4: Eco Impact Calculator */}
          <div
            onClick={() => onNavigate("calculator")}
            className="group cursor-pointer rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate("calculator");
              }
            }}
            aria-label="Open Eco Impact Calculator"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                <Calculator className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1 font-['Outfit'] group-hover:text-emerald-700 transition-colors">
                Eco Impact Calculator
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estimate commute CO₂ savings and cost differences from lower-emission travel choices.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Calculate Savings</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerable Populations Health Matrix */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl mb-6">
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 font-['Outfit']">
            Targeted Community Protection
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit'] mt-1">
            Who is Most Vulnerable to Today's Air Quality?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Understanding health risks across biological and occupational vulnerability groups
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Children</span>
            <h4 className="text-sm font-bold text-white mt-1">Developing Lungs</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {aqiData.health_risks.children_and_elderly}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Seniors</span>
            <h4 className="text-sm font-bold text-white mt-1">Cardiovascular Load</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {aqiData.health_risks.sensitive_groups}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">Outdoor Workers</span>
            <h4 className="text-sm font-bold text-white mt-1">High Volume Exposure</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {aqiData.health_risks.outdoor_workers}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">General Public</span>
            <h4 className="text-sm font-bold text-white mt-1">Mucous Irritation</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {aqiData.health_risks.general_public}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
