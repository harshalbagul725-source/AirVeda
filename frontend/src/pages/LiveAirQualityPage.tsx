import React from "react";
import { AQIDataResponse, HistoricalDataResponse } from "../types";
import { AQIDial } from "../components/AQIDial";
import { PollutantCard } from "../components/PollutantCard";
import { HistoricalChart } from "../components/HistoricalChart";

interface LiveAirQualityPageProps {
  aqiData: AQIDataResponse | null;
  isLoading: boolean;
  historicalData: HistoricalDataResponse | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const LiveAirQualityPage: React.FC<LiveAirQualityPageProps> = ({
  aqiData,
  isLoading,
  historicalData,
  onRefresh,
  isRefreshing,
}) => {
  if (!aqiData) {
    if (isLoading) return null;
    return (
      <div className="py-16 px-6 text-center space-y-3 bg-white rounded-3xl border border-slate-200" role="status" aria-live="polite">
        <h1 className="text-xl font-bold text-slate-900">No verified current reading</h1>
        <p className="text-sm text-slate-600">Check your connection or try again. AirVeda does not display invented fallback measurements.</p>
        <button onClick={onRefresh} disabled={isRefreshing} className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60">
          {isRefreshing ? "Checking..." : "Try again"}
        </button>
      </div>
    );
  }

  const p = aqiData.pollutants;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Dial Card */}
      <AQIDial data={aqiData} onRefresh={onRefresh} isRefreshing={isRefreshing} />

      {/* Six Pollutants In-Depth Breakdown */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 font-['Outfit']">
              Chemical & Particulate Census
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
              Pollutant Breakdown & CPCB Standard Limits
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            CPCB 24-Hour Permissible Limits (NAAQS India)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* PM2.5 */}
          <PollutantCard
            name="PM2.5"
            fullName="Fine Particulate Matter (≤ 2.5 µm)"
            data={p.pm2_5}
            standardLimit={60}
            isPrimary={aqiData.prominent_pollutant === "PM2.5"}
          />

          {/* PM10 */}
          <PollutantCard
            name="PM10"
            fullName="Inhalable Coarse Particles (≤ 10 µm)"
            data={p.pm10}
            standardLimit={100}
            isPrimary={aqiData.prominent_pollutant === "PM10"}
          />

          {/* Nitrogen Dioxide (NO2) */}
          {p.no2 && (
            <PollutantCard
              name="NO₂"
              fullName="Nitrogen Dioxide (Vehicular Exhaust)"
              data={p.no2}
              standardLimit={80}
              isPrimary={aqiData.prominent_pollutant === "NO2"}
            />
          )}

          {/* Sulfur Dioxide (SO2) */}
          {p.so2 && (
            <PollutantCard
              name="SO₂"
              fullName="Sulfur Dioxide (Thermal / Industrial)"
              data={p.so2}
              standardLimit={80}
              isPrimary={aqiData.prominent_pollutant === "SO2"}
            />
          )}

          {/* Carbon Monoxide (CO) */}
          {p.co && (
            <PollutantCard
              name="CO"
              fullName="Carbon Monoxide (Incomplete Combustion)"
              data={p.co}
              standardLimit={2.0} // 2 mg/m3 8-hour CPCB limit
              isPrimary={aqiData.prominent_pollutant === "CO"}
            />
          )}

          {/* Ozone (O3) */}
          {p.o3 && (
            <PollutantCard
              name="O₃"
              fullName="Ground-Level Ozone (Photochemical Smog)"
              data={p.o3}
              standardLimit={100}
              isPrimary={aqiData.prominent_pollutant === "Ozone"}
            />
          )}
        </div>
      </div>

      {/* Historical 24-Hour Diurnal Chart */}
      {historicalData && historicalData.points.length > 0 && (
        <HistoricalChart points={historicalData.points} city={aqiData.city} />
      )}

      {/* Comprehensive Health & Lifestyle Precautions Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] mb-6">
          Actionable Health & Exposure Guidance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Ventilation Guidance
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              When to Open Windows
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {aqiData.health_risks.ventilation_advice}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Outdoor Activity
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Exercise & Play Thresholds
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {aqiData.health_risks.outdoor_activity_advice}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Respiratory Protection
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Mask & Respirator Protocol
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {aqiData.health_risks.recommended_mask}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Sensitive Groups
            </span>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Asthma & Cardiac Care
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {aqiData.health_risks.sensitive_groups}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

