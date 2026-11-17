import React, { useState, useEffect } from "react";
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Activity,
  Heart,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { AQIDataResponse, RoutineResponse } from "../types";
import { api } from "../services/api";

interface DailyRoutinePlannerPageProps {
  aqiData: AQIDataResponse | null;
}

const PERSONAS = [
  { id: "Parent", label: "Parent / Family", desc: "Focuses on children's lung protection & school schedule" },
  { id: "Working professional", label: "Working Professional", desc: "Rush-hour commute & office air quality" },
  { id: "Student", label: "Student", desc: "Campus walking, library study & study ventilation" },
  { id: "Senior citizen", label: "Senior Citizen", desc: "Cardiovascular safety & indoor movement" },
  { id: "Fitness enthusiast", label: "Fitness Enthusiast", desc: "Cardio timing, indoor HIIT & oxygen load" },
  { id: "Outdoor worker", label: "Outdoor Worker", desc: "High-exposure shifts, hydration & PPE intervals" },
];

export const DailyRoutinePlannerPage: React.FC<DailyRoutinePlannerPageProps> = ({ aqiData }) => {
  const [selectedPersona, setSelectedPersona] = useState("Parent");
  const [hasPurifier, setHasPurifier] = useState(true);
  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutine();
  }, [selectedPersona, aqiData?.city, aqiData?.cpcb_aqi, hasPurifier]);

  const fetchRoutine = async () => {
    if (!aqiData) {
      setRoutine(null);
      setIsLoading(false);
      setError("A routine needs a verified current air-quality reading. Refresh the dashboard and try again.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.generateRoutine({
        persona: selectedPersona,
        city: aqiData.city,
        aqi: aqiData.cpcb_aqi,
        category: aqiData.cpcb_category,
        pm2_5: aqiData.pollutants.pm2_5.value,
        has_air_purifier: hasPurifier,
      });
      setRoutine(data);
    } catch {
      setError("Unable to generate a routine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Critical":
        return "bg-rose-100 text-rose-900 border-rose-300 font-bold";
      case "High":
        return "bg-orange-100 text-orange-900 border-orange-300 font-bold";
      case "Moderate":
        return "bg-amber-100 text-amber-900 border-amber-300 font-semibold";
      default:
        return "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                AQI-Aware Routine Planner
              </span>
              <span className="text-xs text-slate-400">• Current model AQI for {aqiData?.city || "selected location"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              Personalized Daily Routine Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Uses the current modelled CPCB AQI to tailor general exposure guidance. Suggested time windows are not local hourly forecasts.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasPurifier}
                onChange={(e) => setHasPurifier(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>I have an Air Purifier at home</span>
            </label>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block font-['Outfit']">
            Select Your Lifestyle Persona
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PERSONAS.map((p) => {
              const isActive = selectedPersona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`p-3 rounded-2xl text-left transition-all border focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-md font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="text-sm font-bold block">{p.label}</span>
                  <span className={`text-[10px] block mt-1 leading-tight line-clamp-2 ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3" role="status" aria-live="polite">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Generating an AQI-aware routine...</p>
        </div>
      ) : error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">{error}</p>
      ) : routine ? (
        <div className="space-y-6">
          {/* 4 Phases of the Day: Morning, Afternoon, Evening, Night */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Morning Routine */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sunrise className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">Morning Routine</h3>
                    <span className="text-xs text-slate-400">General morning exposure precautions</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600" aria-label="Suggested schedule, not an hourly forecast">
                  {routine.morning.optimal_time_slot}
                </span>
              </div>

              <div className="space-y-3">
                {routine.morning.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.time_window}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRiskBadge(item.pollution_risk_level)}`}>
                        {item.pollution_risk_level} Smog Risk
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.activity_name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.action_guidance}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-emerald-800 font-medium flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span><strong>Expected Benefit:</strong> {item.expected_benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Afternoon Routine */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">Afternoon Routine</h3>
                    <span className="text-xs text-slate-400">Example daytime planning window</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {routine.afternoon.optimal_time_slot}
                </span>
              </div>

              <div className="space-y-3">
                {routine.afternoon.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.time_window}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRiskBadge(item.pollution_risk_level)}`}>
                        {item.pollution_risk_level} Smog Risk
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.activity_name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.action_guidance}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-emerald-800 font-medium flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span><strong>Expected Benefit:</strong> {item.expected_benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evening Routine */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Sunset className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">Evening Routine</h3>
                    <span className="text-xs text-slate-400">Commute and evening exposure planning</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {routine.evening.optimal_time_slot}
                </span>
              </div>

              <div className="space-y-3">
                {routine.evening.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.time_window}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRiskBadge(item.pollution_risk_level)}`}>
                        {item.pollution_risk_level} Smog Risk
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.activity_name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.action_guidance}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-emerald-800 font-medium flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span><strong>Expected Benefit:</strong> {item.expected_benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Night Routine */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Moon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">Night Routine</h3>
                    <span className="text-xs text-slate-400">Overnight indoor exposure reduction</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {routine.night.optimal_time_slot}
                </span>
              </div>

              <div className="space-y-3">
                {routine.night.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.time_window}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRiskBadge(item.pollution_risk_level)}`}>
                        {item.pollution_risk_level} Smog Risk
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.activity_name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.action_guidance}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-emerald-800 font-medium flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span><strong>Expected Benefit:</strong> {item.expected_benefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Precautions & Exercise Alternatives Bottom Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safer Exercise Alternatives */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base font-['Outfit']">
                <Activity className="w-5 h-5" aria-hidden="true" />
                <span>Safer Exercise Alternatives</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {routine.exercise_alternatives.map((alt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Persona-Specific Family & Community Precautions */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-base font-['Outfit']">
                <Heart className="w-5 h-5" aria-hidden="true" />
                <span>{selectedPersona} Precautions</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {routine.family_and_school_precautions.map((prec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Caution Note */}
          <p className="text-xs text-slate-400 italic text-center">
            {routine.caution_notice}
          </p>
        </div>
      ) : null}
    </div>
  );
};
