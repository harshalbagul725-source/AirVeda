import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../services/api";
import { ChecklistItem } from "../types";
import { IndoorAirQualityPage } from "./IndoorAirQualityPage";

vi.mock("../services/api", () => ({
  api: {
    getIndoorChecklist: vi.fn(),
    getVentilationAdvice: vi.fn(),
  },
}));

const checklist: ChecklistItem[] = [
  {
    id: "smart_ventilation",
    category: "Ventilation",
    title: "Check outdoor conditions before ventilating",
    description: "Check current local conditions before opening windows.",
    impact_level: "High",
    completed: false,
  },
];

describe("IndoorAirQualityPage", () => {
  beforeEach(() => {
    vi.mocked(api.getIndoorChecklist).mockResolvedValue(checklist);
  });

  it("updates checklist completion and progress with the Space key", async () => {
    render(<IndoorAirQualityPage aqiData={null} />);

    const item = await screen.findByRole("checkbox", { name: /Check outdoor conditions before ventilating/i });
    expect(item).toHaveAttribute("aria-checked", "false");

    fireEvent.keyDown(item, { key: " " });

    expect(item).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
