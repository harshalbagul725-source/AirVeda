import React, { useState } from "react";
import {
  MapPin,
  Menu,
  X,
  Bot,
  Calendar,
  Home,
  ShieldCheck,
  Calculator,
  Users,
  BookOpen,
  Activity,
  ChevronDown,
} from "lucide-react";
import { AQIDataResponse } from "../types";
import { getAQITheme } from "../utils/aqiColors";

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  aqiData: AQIDataResponse | null;
  onOpenCityModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  aqiData,
  onOpenCityModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "live", label: "Live AQI", icon: Activity },
    { id: "assistant", label: "AI Assistant", icon: Bot },
    { id: "planner", label: "Daily Planner", icon: Calendar },
    { id: "indoor", label: "Indoor Air", icon: ShieldCheck },
    { id: "calculator", label: "Eco Impact", icon: Calculator },
    { id: "community", label: "Community", icon: Users },
    { id: "about", label: "Settings & About", icon: BookOpen },
  ];

  const theme = getAQITheme(aqiData?.cpcb_category);

  return (
    <>
      {/* Skip to Main Content Link for WCAG 2.2 AA Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:bg-emerald-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab("dashboard")}
                className="flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:rounded-lg focus-visible:outline-none"
                aria-label="AirVeda home"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <img src="/airveda.svg" alt="" className="w-10 h-10 rounded-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl font-['Outfit']">
                      AirVeda
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold tracking-wide uppercase">
                      AI 2.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium hidden sm:block">
                    Breathe Better. Live Smarter.
                  </p>
                </div>
              </button>
            </div>

            {/* Center: City Selector Pill */}
            <div className="flex items-center">
              <button
                onClick={onOpenCityModal}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-sm font-medium text-slate-800 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                aria-label={`Change current city, currently ${aqiData?.city || "Nagpur"}`}
              >
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-900">{aqiData?.city || "Nagpur"}</span>
                {aqiData && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold border ${theme.badgeBg}`}
                    title={`CPCB NAQI: ${aqiData.cpcb_aqi} (${aqiData.cpcb_category})`}
                  >
                    {aqiData.cpcb_aqi} AQI • {aqiData.cpcb_category}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-base font-medium transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
};

