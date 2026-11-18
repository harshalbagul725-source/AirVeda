import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AQIDataResponse } from "../types";
import { DashboardPage } from "./DashboardPage";

const sampleAqiData: AQIDataResponse = {
  city: "Nagpur",
  country: "India",
  latitude: 21.1458,
  longitude: 79.0882,
  timestamp: "2025-01-01T10:00:00Z",
  data_source: "Test model fixture",
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
  methodology_notes: "Test fixture only",
};

describe("DashboardPage", () => {
  it("explains that unavailable readings are not replaced with sample values", () => {
    render(
      <DashboardPage
        aqiData={null}
        isLoading={false}
        onNavigate={vi.fn()}
        onRefresh={vi.fn()}
        isRefreshing={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Current model data is unavailable" })).toBeInTheDocument();
    expect(screen.getByText(/will not substitute sample pollution values/i)).toBeInTheDocument();
  });

  it("lets a user retry when readings are unavailable", () => {
    const onRefresh = vi.fn();
    render(
      <DashboardPage
        aqiData={null}
        isLoading={false}
        onNavigate={vi.fn()}
        onRefresh={onRefresh}
        isRefreshing={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("does not show an unavailable state while the initial request is loading", () => {
    render(
      <DashboardPage
        aqiData={null}
        isLoading={true}
        onNavigate={vi.fn()}
        onRefresh={vi.fn()}
        isRefreshing={false}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Current model data is unavailable" })).not.toBeInTheDocument();
  });

  it("activates feature cards with the Space key", () => {
    const onNavigate = vi.fn();
    render(
      <DashboardPage
        aqiData={sampleAqiData}
        isLoading={false}
        onNavigate={onNavigate}
        onRefresh={vi.fn()}
        isRefreshing={false}
      />,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Open AI Smart Pollution Assistant" }), { key: " " });
    expect(onNavigate).toHaveBeenCalledWith("assistant");
  });
});
