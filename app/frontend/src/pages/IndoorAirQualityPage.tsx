import React, { useState, useEffect } from "react";
import {
  Flame,
  Layers,
  Leaf,
  CheckSquare,
  Square,
} from "lucide-react";
import { AQIDataResponse, ChecklistItem, VentilationAdvice } from "../types";
import { api } from "../services/api";

interface IndoorAirQualityPageProps {
  aqiData: AQIDataResponse | null;
}

export const IndoorAirQualityPage: React.FC<IndoorAirQualityPageProps> = ({ aqiData }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [ventilationAdvice, setVentilationAdvice] = useState<VentilationAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [aqiData?.cpcb_aqi]);

  const loadData = async () => {
    setError(null);
    try {
      const items = await api.getIndoorChecklist();
      setChecklist(items);
      if (aqiData) {
        const advice = await api.getVentilationAdvice(aqiData.cpcb_aqi);
        setVentilationAdvice(advice);
      } else {
        setVentilationAdvice(null);
      }
    } catch {
      setError("Indoor air guidance could not be loaded. Please retry.");
    }
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
                Micro-Environment Control
              </span>
              <span className="text-xs text-slate-400">• Indoor exposure-reduction guidance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Indoor Air Quality & Home Protection Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Filtration, source control, and condition-aware ventilation can help reduce indoor exposure to air pollution.
            </p>
          </div>

          {/* Dynamic Ventilation Status Box */}
          {ventilationAdvice && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 shrink-0 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                AQI-Based Ventilation Guidance
              </span>
              <span className="text-lg font-extrabold text-teal-950 font-['Outfit'] block">
                {ventilationAdvice.window_action}
              </span>
              <span className="text-xs text-teal-700 block mt-0.5">
                Suggested check: {ventilationAdvice.recommended_window}
              </span>
              <span className="text-xs text-teal-800 block mt-1 max-w-xs">
                Based on current modelled AQI; no hourly forecast or indoor-air sensor is used.
              </span>
            </div>
          )}
          {!aqiData && (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3" role="status">
              Current outdoor readings are unavailable, so no location-specific ventilation rule is shown.
            </p>
          )}
        </div>
      </div>

      {/* Interactive Home Safety Checklist Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit']">
              Home Clean-Air Audit
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
              Interactive 8-Step Home Checklist
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mark completed actions to calculate your home's environmental readiness score
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Completed</span>
              <span className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                {completedCount} / {checklist.length}
              </span>
            </div>
            <div className="w-24 bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-emerald-700">{progressPercent}%</span>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                item.completed
                  ? "bg-emerald-50/60 border-emerald-300 shadow-sm"
                  : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200"
              }`}
              role="checkbox"
              aria-checked={item.completed}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggleCheck(item.id);
                }
              }}
            >
              <button
                type="button"
                className="mt-0.5 shrink-0 text-emerald-600 focus:outline-none"
                aria-hidden="true"
                tabIndex={-1}
              >
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.impact_level === "Crucial"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.impact_level}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Modules: HEPA, Combustion & The Plant Reality Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: HEPA Purifier Masterclass */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Air Filtration</span>
            <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
              True HEPA (H13) vs Marketing Claims
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A certified True HEPA (High-Efficiency Particulate Air) filter captures at least <strong>99.97% of particles as small as 0.3 microns</strong>. Avoid generic "HEPA-type" or ionizers without mechanical filters, which often produce harmful secondary ozone gas.
          </p>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p>• <strong>CADR:</strong> Choose a purifier rated for the room size and desired air changes per hour.</p>
            <p>• <strong>Placement:</strong> Central, elevated, at least 1 foot from walls.</p>
          </div>
        </div>

        {/* Module 2: Combustion & Cooking Smoke */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Combustion Hazards</span>
            <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
              Incense, Agarbatti & Kitchen Exhaust
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Incense, mosquito coils, and cooking can add smoke and particles to indoor air. Reduce indoor combustion where practical and use a vented kitchen exhaust when available.
          </p>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p>• Switch to electric diffusers or flameless diyas.</p>
            <p>• Run the kitchen chimney before heating oil, not after smoke appears.</p>
          </div>
        </div>

        {/* Module 3: The Plant Reality Check (CRITICAL REQUIREMENT) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Leaf className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Scientific Myth Busting</span>
            <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
              The Indoor Houseplant Reality Check
            </h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            Houseplants are not a substitute for source control, appropriate ventilation, or mechanical air filtration.
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The famous 1989 NASA Clean Air Study tested VOC absorption inside small, airtight sealed chambers over days. In a real home with dynamic airflow, you would need hundreds of plants per square meter to equal a single HEPA purifier. Enjoy plants for aesthetics and biophilic well-being, but rely on HEPA filters for smog defense.
          </p>
        </div>
      </div>
    </div>
  );
};

