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

  it("ignores an older search response after a newer query is submitted", async () => {
    let resolveOlderSearch!: (cities: { name: string; country: string; latitude: number; longitude: number }[]) => void;
    let resolveNewerSearch!: (cities: { name: string; country: string; latitude: number; longitude: number }[]) => void;
    vi.mocked(api.searchCities)
      .mockReturnValueOnce(new Promise((resolve) => { resolveOlderSearch = resolve; }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveNewerSearch = resolve; }));

    render(
      <CitySearchModal
        isOpen
        onClose={vi.fn()}
        onSelectCity={vi.fn()}
        currentCity="Nagpur"
      />,
    );

    const searchInput = screen.getByRole("textbox", { name: "Search city by name" });
    fireEvent.change(searchInput, { target: { value: "Pune" } });
    await waitFor(() => expect(api.searchCities).toHaveBeenCalledWith("Pune"));

    fireEvent.change(searchInput, { target: { value: "Delhi" } });
    await waitFor(() => expect(api.searchCities).toHaveBeenCalledWith("Delhi"));

    resolveNewerSearch([
      { name: "Delhi", country: "India", latitude: 28.61, longitude: 77.20 },
    ]);
    await waitFor(() => expect(screen.getByRole("button", { name: /Delhi/i })).toBeInTheDocument());

    resolveOlderSearch([
      { name: "Pune", country: "India", latitude: 18.52, longitude: 73.85 },
    ]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByRole("button", { name: /Delhi/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pune/i })).not.toBeInTheDocument();
  });
});
