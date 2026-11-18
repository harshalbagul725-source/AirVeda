import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../services/api";
import { CitySearchModal } from "./CitySearchModal";

vi.mock("../services/api", () => ({
  api: {
    searchCities: vi.fn(),
  },
}));

describe("CitySearchModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("selects the default Nagpur location", () => {
    const onSelectCity = vi.fn();
    render(
      <CitySearchModal
        isOpen
        onClose={vi.fn()}
        onSelectCity={onSelectCity}
        currentCity="Nagpur"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Nagpur/i }));
    expect(onSelectCity).toHaveBeenCalledWith("Nagpur", 21.1458, 79.0882);
  });

  it("uses geocoding results for typed city searches", async () => {
    vi.mocked(api.searchCities).mockResolvedValue([
      { name: "Pune", state: "Maharashtra", country: "India", latitude: 18.52, longitude: 73.85 },
    ]);
    render(
      <CitySearchModal
        isOpen
        onClose={vi.fn()}
        onSelectCity={vi.fn()}
        currentCity="Nagpur"
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Search city by name" }), { target: { value: "Pune" } });
    await waitFor(() => expect(screen.getByRole("button", { name: /Pune/i })).toBeInTheDocument());
    expect(api.searchCities).toHaveBeenCalledWith("Pune");
  });
});
