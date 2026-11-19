import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./services/api";
import { AQIDataResponse, HistoricalDataResponse } from "./types";
import { App } from "./App";

vi.mock("./services/api", () => ({
  api: {
    getCurrentAQI: vi.fn(),
    getHistoricalAQI: vi.fn(),
  },
}));

vi.mock("./components/Navbar", () => ({
  Navbar: ({ onOpenCityModal }: { onOpenCityModal: () => void }) => (
    <button onClick={onOpenCityModal}>Open location selector</button>
  ),
}));

vi.mock("./components/Footer", () => ({ Footer: () => null }));
vi.mock("./components/CitySearchModal", () => ({
  CitySearchModal: ({
    isOpen,
    onSelectCity,
  }: {
    isOpen: boolean;
    onSelectCity: (city: string, lat?: number, lon?: number) => void;
  }) => isOpen ? (
    <button onClick={() => onSelectCity("Delhi", 28.6139, 77.2090)}>Select Delhi</button>
  ) : null,
}));
vi.mock("./pages/DashboardPage", () => ({
  DashboardPage: ({ aqiData }: { aqiData: AQIDataResponse | null }) => (
    <div>{aqiData?.city ?? "No current city data"}</div>
  ),
}));
vi.mock("./pages/LiveAirQualityPage", () => ({ LiveAirQualityPage: () => null }));
vi.mock("./pages/AIAssistantPage", () => ({ AIAssistantPage: () => null }));
vi.mock("./pages/DailyRoutinePlannerPage", () => ({ DailyRoutinePlannerPage: () => null }));
vi.mock("./pages/IndoorAirQualityPage", () => ({ IndoorAirQualityPage: () => null }));
vi.mock("./pages/EcoImpactCalculatorPage", () => ({ EcoImpactCalculatorPage: () => null }));
vi.mock("./pages/CommunityInsightsPage", () => ({ CommunityInsightsPage: () => null }));
vi.mock("./pages/AboutMethodologyPage", () => ({ AboutMethodologyPage: () => null }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function airQualityData(city: string): AQIDataResponse {
  return {
    city,
    country: "India",
    latitude: 28.6139,
    longitude: 77.209,
    timestamp: "2025-01-01T10:00:00Z",
    data_source: "Test fixture",
    data_mode: "live",
    cpcb_aqi: 72,
    cpcb_category: "Satisfactory",
    us_aqi: 60,
    us_category: "Moderate",
    prominent_pollutant: "PM2.5",
    pollutants: {
      pm2_5: { value: 20, unit: "µg/m³", description: "Test fixture" },
      pm10: { value: 35, unit: "µg/m³", description: "Test fixture" },
    },
    weather: {
      temperature: 25,
      humidity: 50,
      wind_speed: 5,
      weather_description: "Clear sky",
    },
    health_risks: {
      general_public: "Test guidance",
      sensitive_groups: "Test guidance",
      children_and_elderly: "Test guidance",
      outdoor_workers: "Test guidance",
      recommended_mask: "Test guidance",
      ventilation_advice: "Test guidance",
      outdoor_activity_advice: "Test guidance",
    },
    methodology_notes: "Test fixture",
  };
}

function historicalData(city: string): HistoricalDataResponse {
  return { city, data_source: "Test fixture", data_mode: "live", points: [] };
}

describe("App air-quality requests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not replace a newer city's data when an older request finishes later", async () => {
    const olderCurrent = deferred<AQIDataResponse>();
    const newerCurrent = deferred<AQIDataResponse>();
    const olderHistory = deferred<HistoricalDataResponse>();
    const newerHistory = deferred<HistoricalDataResponse>();

    vi.mocked(api.getCurrentAQI)
      .mockReturnValueOnce(olderCurrent.promise)
      .mockReturnValueOnce(newerCurrent.promise);
    vi.mocked(api.getHistoricalAQI)
      .mockReturnValueOnce(olderHistory.promise)
      .mockReturnValueOnce(newerHistory.promise);

    render(<App />);
    await waitFor(() => expect(api.getCurrentAQI).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Open location selector" }));
    fireEvent.click(screen.getByRole("button", { name: "Select Delhi" }));
    await waitFor(() => expect(api.getCurrentAQI).toHaveBeenCalledTimes(2));

    await act(async () => {
      newerCurrent.resolve(airQualityData("Delhi"));
      newerHistory.resolve(historicalData("Delhi"));
      await newerCurrent.promise;
      await newerHistory.promise;
    });
    expect(await screen.findByText("Delhi")).toBeInTheDocument();

    await act(async () => {
      olderCurrent.resolve(airQualityData("Nagpur"));
      olderHistory.resolve(historicalData("Nagpur"));
      await olderCurrent.promise;
      await olderHistory.promise;
    });

    expect(screen.getByText("Delhi")).toBeInTheDocument();
    expect(screen.queryByText("Nagpur")).not.toBeInTheDocument();
  });
});
