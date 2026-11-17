import {
  AQIDataResponse,
  HistoricalDataResponse,
  CitySearchItem,
  ChatResponse,
  RoutineResponse,
  EcoImpactResponse,
  ChecklistItem,
  CommunityChallenge,
} from "../types";

const API_BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!resp.ok) {
    let errorMsg = `HTTP Error ${resp.status}: ${resp.statusText}`;
    try {
      const errData = await resp.json();
      if (errData && errData.message) {
        errorMsg = errData.message;
      } else if (errData && errData.detail) {
        errorMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (!resp.headers.get("content-type")?.includes("application/json")) {
    throw new Error("The API returned an unexpected response. Check the deployment routing and try again.");
  }

  return resp.json();
}

export const api = {
  async getCurrentAQI(city: string = "Nagpur", lat?: number, lon?: number): Promise<AQIDataResponse> {
    const params = new URLSearchParams({ city });
    if (lat !== undefined && lon !== undefined) {
      params.append("lat", lat.toString());
      params.append("lon", lon.toString());
    }
    return fetchJSON<AQIDataResponse>(`${API_BASE}/aqi/current?${params.toString()}`);
  },

  async getHistoricalAQI(city: string = "Nagpur", lat?: number, lon?: number): Promise<HistoricalDataResponse> {
    const params = new URLSearchParams({ city });
    if (lat !== undefined && lon !== undefined) {
      params.append("lat", lat.toString());
      params.append("lon", lon.toString());
    }
    return fetchJSON<HistoricalDataResponse>(`${API_BASE}/aqi/historical?${params.toString()}`);
  },

  async searchCities(query: string): Promise<CitySearchItem[]> {
    const params = new URLSearchParams({ q: query });
    return fetchJSON<CitySearchItem[]>(`${API_BASE}/aqi/cities?${params.toString()}`);
  },

  async getMethodology(): Promise<any> {
    return fetchJSON<any>(`${API_BASE}/aqi/methodology`);
  },

  async sendChatMessage(payload: {
    message: string;
    city?: string;
    aqi?: number;
    category?: string;
    pm2_5?: number;
    lifestyle?: string;
    history?: { role: "user" | "assistant" | "system"; content: string }[];
  }): Promise<ChatResponse> {
    return fetchJSON<ChatResponse>(`${API_BASE}/ai/chat`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSuggestedQuestions(): Promise<{ id: string; question: string; category: string }[]> {
    return fetchJSON<{ id: string; question: string; category: string }[]>(`${API_BASE}/ai/suggested-questions`);
  },

  async generateRoutine(payload: {
    persona: string;
    city: string;
    aqi: number;
    category: string;
    pm2_5: number;
    has_air_purifier?: boolean;
    commute_mode?: string;
  }): Promise<RoutineResponse> {
    return fetchJSON<RoutineResponse>(`${API_BASE}/planner/generate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async calculateEcoImpact(payload: {
    baseline_mode: string;
    chosen_mode: string;
    daily_distance_km: number;
    days_per_week: number;
    carpool_passengers?: number;
  }): Promise<EcoImpactResponse> {
    return fetchJSON<EcoImpactResponse>(`${API_BASE}/calculator/eco-impact`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getIndoorChecklist(): Promise<ChecklistItem[]> {
    return fetchJSON<ChecklistItem[]>(`${API_BASE}/indoor/checklist`);
  },

  async getVentilationAdvice(aqi: number = 150): Promise<any> {
    return fetchJSON<any>(`${API_BASE}/indoor/ventilation-advice?aqi=${aqi}`);
  },

  async getCommunityChallenges(): Promise<CommunityChallenge[]> {
    return fetchJSON<CommunityChallenge[]>(`${API_BASE}/community/challenges`);
  },
};

