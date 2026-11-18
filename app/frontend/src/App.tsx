import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CitySearchModal } from "./components/CitySearchModal";
import { DashboardPage } from "./pages/DashboardPage";
import { LiveAirQualityPage } from "./pages/LiveAirQualityPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { DailyRoutinePlannerPage } from "./pages/DailyRoutinePlannerPage";
import { IndoorAirQualityPage } from "./pages/IndoorAirQualityPage";
import { EcoImpactCalculatorPage } from "./pages/EcoImpactCalculatorPage";
import { CommunityInsightsPage } from "./pages/CommunityInsightsPage";
import { AboutMethodologyPage } from "./pages/AboutMethodologyPage";
import { AQIDataResponse, HistoricalDataResponse } from "./types";
import { api } from "./services/api";
import { AlertCircle, CheckCircle, X, Loader2 } from "lucide-react";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedCity, setSelectedCity] = useState<string>("Nagpur");
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({ lat: 21.1458, lon: 79.0882 });
  const [aqiData, setAqiData] = useState<AQIDataResponse | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataResponse | null>(null);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchAirData(selectedCity, coords.lat, coords.lon);
  }, [selectedCity, coords.lat, coords.lon]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAirData = async (city: string, lat?: number, lon?: number) => {
    setIsLoading(true);
    setAqiData(null);
    setHistoricalData(null);
    setError(null);
    const [current, historical] = await Promise.allSettled([
      api.getCurrentAQI(city, lat, lon),
      api.getHistoricalAQI(city, lat, lon),
    ]);

    const errors: string[] = [];
    if (current.status === "fulfilled") {
      setAqiData(current.value);
    } else {
      errors.push("Current air quality and weather readings are unavailable.");
    }
    if (historical.status === "fulfilled") {
      setHistoricalData(historical.value);
    } else {
      errors.push("Historical air-quality trends are unavailable.");
    }
    setError(errors.length ? errors.join(" ") : null);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAirData(selectedCity, coords.lat, coords.lon);
    showToast("Requesting updated Open-Meteo model data...");
  };

  const handleSelectCity = (city: string, lat?: number, lon?: number) => {
    setSelectedCity(city);
    setCoords({ lat, lon });
    showToast(`Location set to ${city}. Updating air metrics.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold">{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        aqiData={aqiData}
        onOpenCityModal={() => setIsCityModalOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" tabIndex={-1}>
        {isLoading && !aqiData && (
          <div className="py-24 text-center space-y-3" role="status" aria-live="polite">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-600">Checking current Open-Meteo model data...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-sm flex items-center justify-between" role="alert">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="text-xs font-bold text-rose-800 underline hover:no-underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic Page Rendering */}
        {currentTab === "dashboard" && (
          <DashboardPage
            aqiData={aqiData}
            isLoading={isLoading}
            onNavigate={setCurrentTab}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {currentTab === "live" && (
          <LiveAirQualityPage
            aqiData={aqiData}
            isLoading={isLoading}
            historicalData={historicalData}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        <div hidden={currentTab !== "assistant"}>
          <AIAssistantPage aqiData={aqiData} city={selectedCity} />
        </div>

        {currentTab === "planner" && (
          <DailyRoutinePlannerPage aqiData={aqiData} />
        )}

        {currentTab === "indoor" && (
          <IndoorAirQualityPage aqiData={aqiData} />
        )}

        {currentTab === "calculator" && (
          <EcoImpactCalculatorPage />
        )}

        {currentTab === "community" && (
          <CommunityInsightsPage aqiData={aqiData} historicalData={historicalData} />
        )}

        {currentTab === "about" && (
          <AboutMethodologyPage city={selectedCity} onOpenCityModal={() => setIsCityModalOpen(true)} />
        )}
      </main>

      {/* City Search / GPS Modal */}
      <CitySearchModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelectCity={handleSelectCity}
        currentCity={selectedCity}
      />

      {/* Footer */}
      <Footer onSelectTab={setCurrentTab} />
    </div>
  );
};
