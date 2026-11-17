import React, { useState, useEffect } from "react";
import {
  Bike,
  Footprints,
  Train,
  Bus,
  Users,
  TreeDeciduous,
  Coins,
  Award,
  Info,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { EcoImpactResponse } from "../types";
import { api } from "../services/api";

const BASELINE_OPTIONS = [
  { id: "petrol_car", label: "Petrol Car (1.2L - 1.5L)", ef: 172 },
  { id: "diesel_car", label: "Diesel Car / SUV", ef: 194 },
  { id: "motorbike", label: "Petrol Scooter / Motorbike", ef: 48 },
];

const CHOSEN_OPTIONS = [
  { id: "metro", label: "Metro Rail (Electric Transit)", icon: Train, ef: 14.5 },
  { id: "bus", label: "City Bus Network", icon: Bus, ef: 38 },
  { id: "carpooling", label: "Carpooling / Ridesharing", icon: Users, ef: 86 },
  { id: "bicycle", label: "Bicycle / Active Cycling", icon: Bike, ef: 0 },
  { id: "walking", label: "Walking (Zero Emission)", icon: Footprints, ef: 0 },
];

export const EcoImpactCalculatorPage: React.FC = () => {
  const [baselineMode, setBaselineMode] = useState("petrol_car");
  const [chosenMode, setChosenMode] = useState("metro");
  const [distanceKm, setDistanceKm] = useState(20);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [carpoolPassengers, setCarpoolPassengers] = useState(3);
  const [impact, setImpact] = useState<EcoImpactResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    runCalculation();
  }, [baselineMode, chosenMode, distanceKm, daysPerWeek, carpoolPassengers]);

  const runCalculation = async () => {
    setError(null);
    setIsCalculating(true);
    try {
      const res = await api.calculateEcoImpact({
        baseline_mode: baselineMode,
        chosen_mode: chosenMode,
        daily_distance_km: distanceKm,
        days_per_week: daysPerWeek,
        carpool_passengers: carpoolPassengers,
      });
      setImpact(res);
    } catch {
      setError("The impact calculation could not be completed. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const impactPeriodData = impact
    ? [
        { period: "Daily", co2_saved_kg: impact.daily_co2_saved_kg },
        { period: "Weekly", co2_saved_kg: impact.weekly_co2_saved_kg },
        { period: "Monthly", co2_saved_kg: impact.monthly_co2_saved_kg },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Greenhouse Gas Mitigation & Clean Commute
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Eco Impact & Clean Mobility Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Estimate CO₂ emissions avoided and transport-cost differences when choosing a lower-emission commute.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
            1. Commute Parameters
          </h2>
          <p className="text-xs text-slate-600">
            Emission factors and prices are illustrative assumptions, not measured trip data. Cost estimates use fixed per-kilometer assumptions and exclude fixed vehicle costs; actual results vary by vehicle, occupancy, route, and energy mix.
          </p>

          {/* Baseline Vehicle */}
          <div className="space-y-2">
            <label htmlFor="baseline-select" className="text-xs font-bold text-slate-700 block">
              Your Current Baseline Vehicle:
            </label>
            <select
              id="baseline-select"
              value={baselineMode}
              onChange={(e) => setBaselineMode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white font-medium text-slate-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              {BASELINE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} (~{opt.ef} g CO₂/km)
                </option>
              ))}
            </select>
          </div>

          {/* Sustainable Alternative Chosen */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Choose Cleaner Mode of Transit:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHOSEN_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = chosenMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setChosenMode(item.id)}
                    className={`p-3 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-slate-500 block">{item.ef} g CO₂/km</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carpool passengers if carpooling */}
          {chosenMode === "carpooling" && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                <span>Carpool Passengers Sharing Ride:</span>
                <span className="text-sm font-extrabold">{carpoolPassengers} people</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                step="1"
                value={carpoolPassengers}
                onChange={(e) => setCarpoolPassengers(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-emerald-800">
                Emissions are divided equally among the {carpoolPassengers} vehicle occupants.
              </p>
            </div>
          )}

          {/* Distance Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <label htmlFor="distance-slider">Daily Round-Trip Distance:</label>
              <span className="text-base font-extrabold text-emerald-700">{distanceKm} km/day</span>
            </div>
            <input
              id="distance-slider"
              type="range"
              min="2"
              max="100"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>2 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Days Per Week */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <label htmlFor="days-slider">Commute Days Per Week:</label>
              <span className="text-base font-extrabold text-emerald-700">{daysPerWeek} days</span>
            </div>
            <input
              id="days-slider"
              type="range"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        {/* Right Column: Calculated Savings & Impact Visualization */}
        <div className="lg:col-span-6 space-y-6">
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}
          {impact && (
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Calculated Benefits
                  </span>
                  <h3 className="text-xl font-black font-['Outfit'] mt-0.5">
                    Your Eco Impact Score
                  </h3>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-2xl border border-emerald-500/30">
                  <Award className="w-5 h-5" aria-hidden="true" />
                  <span className="text-xl font-black">{impact.sustainable_travel_score}/100</span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Monthly CO₂ Avoided</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Outfit']">
                    {impact.monthly_co2_saved_kg}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">kg CO₂/mo</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <TreeDeciduous className="w-4 h-4 text-teal-400" />
                    <span>Illustrative Tree Equivalent</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-teal-400 font-['Outfit']">
                    {impact.equivalent_trees_planted}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">annual tree equivalents</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Approx. Monthly Cost Difference</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-['Outfit']">
                    ₹{impact.fuel_cost_saved_inr.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">estimated /month</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Annual CO₂ Avoided</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-['Outfit']">
                    {impact.annual_co2_saved_kg}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">kg/year</span>
                </div>
              </div>

              <div className="pt-2" role="img" aria-label="Estimated CO₂ savings by daily, weekly, and monthly time period">
                <span className="text-xs text-slate-400 font-semibold block mb-2">
                  Estimated CO₂ avoided by time period (kg)
                </span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={impactPeriodData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis dataKey="period" stroke="#CBD5E1" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "10px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="co2_saved_kg" name="kg CO₂ avoided" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {isCalculating && !impact && (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-600" role="status">Calculating estimated travel impact…</p>
          )}

          {/* Scientific Disclaimer & Assumption Disclosure (CRITICAL REQUIREMENT) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-['Outfit']">
              <Info className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Scientific Distinction & Assumptions</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Calculation Formula:</strong> Estimated CO₂ avoided (kg) = ((Baseline EF - Chosen EF) [g/km] × Distance [km] × Days) / 1000.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Crucial Distinction:</strong> {impact?.scientific_disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

