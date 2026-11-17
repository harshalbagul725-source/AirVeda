import React from "react";
import { Wind, ShieldAlert, Heart } from "lucide-react";

interface FooterProps {
  onSelectTab: (tabId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Wind className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight font-['Outfit']">
                AirVeda
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Breathe Better. Live Smarter. Helping families and communities understand modelled urban air quality, plan routines, and take practical steps to reduce exposure.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
              <span>CPCB NAQI calculations • US EPA AQI shown separately</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-['Outfit']">
              Platform Features
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onSelectTab("live")}
                  className="hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  Live Air Quality & Pollutants
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("assistant")}
                  className="hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  AI Smart Smog Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("planner")}
                  className="hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  Personalized Daily Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("indoor")}
                  className="hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  Indoor Air Quality & Checklist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("calculator")}
                  className="hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  Eco Impact & CO2 Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-['Outfit']">
              Standards & Science
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab("about")}
                  className="hover:text-emerald-400 transition-colors text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  CPCB NAQI vs US EPA Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("community")}
                  className="hover:text-emerald-400 transition-colors text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
                >
                  Community Clean-Air Actions
                </button>
              </li>
              <li className="pt-2 text-xs text-slate-500">
                Model-based air-quality and weather data from Open-Meteo; not direct CPCB station readings.
              </li>
            </ul>
          </div>
        </div>

        {/* Medical & Health Disclaimer Banner */}
        <div className="border-t border-slate-800 pt-6 pb-4">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 flex items-start gap-3 text-xs text-slate-400">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-slate-200">Public Health & Medical Notice: </span>
              This web platform provides environmental data analytics and preventative smog guidance. It does not provide medical diagnoses or replace consultations with certified pulmonologists or healthcare professionals. Anyone experiencing chest constriction, severe wheezing, or respiratory distress should seek emergency medical assistance immediately.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} AirVeda. Breathe Better. Live Smarter.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Built with care for public health <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
