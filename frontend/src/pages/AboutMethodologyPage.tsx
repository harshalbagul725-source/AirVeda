import React from "react";
import { ShieldCheck, Layers, Info, Lock, MapPin } from "lucide-react";

interface AboutMethodologyPageProps {
  city: string;
  onOpenCityModal: () => void;
}

export const AboutMethodologyPage: React.FC<AboutMethodologyPageProps> = ({ city, onOpenCityModal }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm" aria-labelledby="settings-heading">
        <h1 id="settings-heading" className="text-xl font-extrabold text-slate-900">Settings & About</h1>
        <p className="mt-1 text-sm text-slate-600">Choose the location used for current readings. Your selection stays in this browser session.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            Current location: {city}
          </span>
          <button type="button" onClick={onOpenCityModal} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
            Change location
          </button>
          <span className="text-sm text-slate-600">Primary index: CPCB NAQI; US EPA PM2.5 AQI is shown separately.</span>
        </div>
      </section>
      {/* Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Scientific Transparency & Open Standards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            AirVeda Data Methodology & Standards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            A comprehensive reference explaining the Indian National Air Quality Index (CPCB NAQI 2014) standard, linear sub-index interpolation formulas, and why US EPA AQI values differ from Indian ratings.
          </p>
        </div>
      </div>

      {/* Critical Scientific Comparison: CPCB vs US EPA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit']">
            Comparative Analysis
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
            Indian CPCB NAQI vs. US EPA AQI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Why the same pollutant concentration produces different AQI numbers
          </p>
        </div>

        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <Info className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>The PM2.5 Breakpoint Difference</span>
          </div>
          <p>
            The Indian Central Pollution Control Board (CPCB) sets the <strong>"Good" threshold for 24-hour PM2.5 at 0 to 30 µg/m³</strong> (AQI 0-50). In contrast, the United States EPA sets the "Good" range much stricter, at <strong>0 to 12.0 µg/m³</strong>.
          </p>
          <p>
            <strong>Practical Example:</strong> If PM2.5 concentration is <strong>25 µg/m³</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 font-medium">
            <li>Under <strong>Indian CPCB NAQI</strong>, 25 µg/m³ yields an AQI of <strong>42 ("Good")</strong>.</li>
            <li>Under <strong>US EPA AQI</strong>, 25 µg/m³ yields an AQI of <strong>78 ("Moderate")</strong>.</li>
          </ul>
          <p className="pt-1 text-slate-600">
            AirVeda computes and labels <strong>both indices separately</strong>, so users can see that the standards use different breakpoints.
          </p>
        </div>

        {/* CPCB Six Severity Categories Table */}
        <div className="overflow-x-auto" tabIndex={0} aria-label="CPCB AQI Category Reference Table">
          <table className="w-full text-left text-xs text-slate-700 border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">CPCB Index Range</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Color Representation</th>
                <th className="py-3 px-4">Associated Health Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">0 – 50</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Good</span></td>
                <td className="py-3 px-4 text-emerald-700 font-mono font-bold">#059669 (Deep Green)</td>
                <td className="py-3 px-4 text-slate-600">Minimal health impact on general population.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">51 – 100</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-lime-100 text-lime-800">Satisfactory</span></td>
                <td className="py-3 px-4 text-lime-700 font-mono font-bold">#65A30D (Lime Green)</td>
                <td className="py-3 px-4 text-slate-600">Minor breathing discomfort to unusually sensitive individuals.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">101 – 200</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Moderate</span></td>
                <td className="py-3 px-4 text-amber-700 font-mono font-bold">#D97706 (Amber Orange)</td>
                <td className="py-3 px-4 text-slate-600">Breathing discomfort to asthmatics and people with lung or heart diseases.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">201 – 300</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Poor</span></td>
                <td className="py-3 px-4 text-orange-700 font-mono font-bold">#EA580C (Orange)</td>
                <td className="py-3 px-4 text-slate-600">Breathing discomfort to most people on prolonged outdoor exposure.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">301 – 400</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Very Poor</span></td>
                <td className="py-3 px-4 text-red-700 font-mono font-bold">#DC2626 (Red)</td>
                <td className="py-3 px-4 text-slate-600">Respiratory illness to people on prolonged exposure; severe asthma triggers.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">401 – 500+</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-950">Severe</span></td>
                <td className="py-3 px-4 text-rose-900 font-mono font-bold">#7F1D1D (Dark Maroon)</td>
                <td className="py-3 px-4 text-slate-600">Hazardous emergency: impacts healthy people; serious risk for vulnerable groups.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Linear Interpolation Formula & CPCB Maximum Sub-Index Rule */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit']">
            Mathematical Formulation
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
            Sub-Index Linear Interpolation Formula
          </h2>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto">
          Ip = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (Cp - B_lo) + I_lo
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <p>• <strong>Cp:</strong> Measured pollutant concentration</p>
            <p>• <strong>B_hi, B_lo:</strong> Breakpoint concentrations corresponding to the bracket</p>
          </div>
          <div>
            <p>• <strong>I_hi, I_lo:</strong> Corresponding sub-index values (e.g., 101 to 200)</p>
            <p>• <strong>Overall AQI Rule:</strong> Max(I_pm25, I_pm10, I_no2, I_so2, I_co, I_o3)</p>
          </div>
        </div>
      </div>

      {/* Platform Commitments: Accessibility, Security & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base font-['Outfit']">Accessibility Features</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            AirVeda targets WCAG 2.2 AA with semantic controls, visible keyboard focus, ARIA announcements, chart data tables, and severity indicators that do not rely on color alone.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base font-['Outfit']">Zero Privacy Intrusions</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Location selection and chat history stay in browser memory for the current session. Coordinates are sent to the API to retrieve local data and are not saved to an application database.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base font-['Outfit']">Secure Architecture</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            FastAPI backend with Pydantic input validation, strict CORS origin restrictions, security headers (CSP, nosniff, frame-deny), and rate-limited AI endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};
