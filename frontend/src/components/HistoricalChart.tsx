import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Table, Info } from "lucide-react";
import { HourlyPoint } from "../types";

interface HistoricalChartProps {
  points: HourlyPoint[];
  city: string;
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ points, city }) => {
  const [viewMode, setViewMode] = useState<"aqi" | "pollutants">("aqi");
  const [showTable, setShowTable] = useState(false);

  const formattedData = points.map((p) => {
    const d = new Date(p.timestamp);
    const timeLabel = isNaN(d.getTime())
      ? p.timestamp.slice(11, 16) || p.timestamp
      : d.toLocaleTimeString([], { hour: "numeric", hour12: true });

    return {
      time: timeLabel,
      fullTime: p.timestamp,
      cpcb_aqi: p.cpcb_aqi,
      us_aqi: p.us_aqi,
      pm2_5: p.pm2_5,
      pm10: p.pm10,
    };
  });

  return (
    <div
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm"
      role="region"
      aria-label={`24-hour historical air quality trends for ${city}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 font-['Outfit']">
            Trend Analysis
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
            24-Hour Diurnal Pollution Cycle
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hourly Open-Meteo model data; not a ground-station measurement
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold" role="group" aria-label="Chart metric toggle">
            <button
              onClick={() => setViewMode("aqi")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "aqi"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={viewMode === "aqi"}
            >
              CPCB PM₂.₅/PM₁₀ vs US AQI
            </button>
            <button
              onClick={() => setViewMode("pollutants")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "pollutants"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={viewMode === "pollutants"}
            >
              PM2.5 & PM10 (µg/m³)
            </button>
          </div>

          {/* Table Toggle for WCAG AA Accessibility */}
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            aria-expanded={showTable}
            aria-label="Toggle accessible data table view of chart data"
          >
            <Table className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{showTable ? "Hide Table" : "Data Table"}</span>
          </button>
        </div>
      </div>

      {/* Chart Graphic Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "aqi" ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpcbGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="usGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="cpcb_aqi"
                name="CPCB PM₂.₅/PM₁₀ index (India)"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cpcbGradient)"
              />
              <Area
                type="monotone"
                dataKey="us_aqi"
                name="US EPA AQI"
                stroke="#6366F1"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#usGradient)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderRadius: "12px",
                  border: "none",
                  color: "#fff",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area
                type="monotone"
                dataKey="pm2_5"
                name="PM2.5 (µg/m³)"
                stroke="#EA580C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#pm25Grad)"
              />
              <Area
                type="monotone"
                dataKey="pm10"
                name="PM10 (µg/m³)"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pm10Grad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Accessible Table View for Screen Readers & Keyboard Navigation */}
      {showTable && (
        <div className="mt-6 border-t border-slate-200 pt-4 overflow-x-auto" tabIndex={0} aria-label="Hourly pollution data table">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">CPCB AQI</th>
                <th className="py-2 px-3">US AQI</th>
                <th className="py-2 px-3">PM2.5 (µg/m³)</th>
                <th className="py-2 px-3">PM10 (µg/m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formattedData.slice(-12).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-1.5 px-3 font-semibold text-slate-900">{row.time}</td>
                  <td className="py-1.5 px-3">{row.cpcb_aqi}</td>
                  <td className="py-1.5 px-3">{row.us_aqi}</td>
                  <td className="py-1.5 px-3">{row.pm2_5}</td>
                  <td className="py-1.5 px-3">{row.pm10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diurnal Science Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          <strong>General context:</strong> Temperature inversions can affect pollution dispersion, but this chart only shows hourly model values returned by the provider; it does not identify local inversion events or forecast cleaner hours.
        </span>
      </div>
    </div>
  );
};
