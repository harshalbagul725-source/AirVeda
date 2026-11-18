export type AQICategory = "Good" | "Satisfactory" | "Moderate" | "Poor" | "Very Poor" | "Severe";

export interface PollutantValue {
  value: number;
  unit: string;
  sub_index?: number;
  category?: string;
  description: string;
}

export interface PollutantBreakdown {
  pm2_5: PollutantValue;
  pm10: PollutantValue;
  no2?: PollutantValue;
  so2?: PollutantValue;
  co?: PollutantValue;
  o3?: PollutantValue;
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction?: number;
  surface_pressure?: number;
  weather_code?: number;
  weather_description: string;
}

export interface HealthRisk {
  general_public: string;
  sensitive_groups: string;
  children_and_elderly: string;
  outdoor_workers: string;
  recommended_mask: string;
  ventilation_advice: string;
  outdoor_activity_advice: string;
}

export interface AQIDataResponse {
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  data_source: string;
  data_mode: "live" | "cached";
  cpcb_aqi: number;
  cpcb_category: AQICategory;
  us_aqi: number;
  us_category: string;
  prominent_pollutant: string;
  pollutants: PollutantBreakdown;
  weather: WeatherConditions;
  health_risks: HealthRisk;
  methodology_notes: string;
}

export interface HourlyPoint {
  timestamp: string;
  cpcb_aqi: number;
  us_aqi: number;
  pm2_5: number;
  pm10: number;
  temperature?: number;
  humidity?: number;
}

export interface HistoricalDataResponse {
  city: string;
  data_source: string;
  data_mode: string;
  points: HourlyPoint[];
}

export interface CitySearchItem {
  id?: number;
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  population?: number;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  reply: string;
  is_fallback: boolean;
  model_used: string;
  suggested_followups: string[];
  timestamp: string;
  disclaimer: string;
}

export interface RoutineItem {
  time_window: string;
  activity_name: string;
  action_guidance: string;
  pollution_risk_level: "Low" | "Moderate" | "High" | "Critical";
  expected_benefit: string;
  transport_or_gear_tips?: string;
}

export interface TimeOfDayRoutine {
  title: string;
  optimal_time_slot: string;
  items: RoutineItem[];
}

export interface RoutineResponse {
  persona: string;
  city: string;
  aqi: number;
  category: string;
  summary_assessment: string;
  morning: TimeOfDayRoutine;
  afternoon: TimeOfDayRoutine;
  evening: TimeOfDayRoutine;
  night: TimeOfDayRoutine;
  exercise_alternatives: string[];
  commute_recommendations: string[];
  ventilation_guide: string;
  family_and_school_precautions: string[];
  caution_notice: string;
}

export interface EcoImpactResponse {
  baseline_mode: string;
  chosen_mode: string;
  daily_distance_km: number;
  days_per_week: number;
  daily_co2_saved_kg: number;
  weekly_co2_saved_kg: number;
  monthly_co2_saved_kg: number;
  annual_co2_saved_kg: number;
  equivalent_trees_planted: number;
  fuel_cost_saved_inr: number;
  sustainable_travel_score: number;
  emission_factors_used: Record<string, number>;
  formula_explanation: string;
  scientific_disclaimer: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  impact_level: "High" | "Medium" | "Crucial";
  completed: boolean;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  category: string;
  duration_days: number;
  difficulty: "Easy" | "Moderate" | "Action-Oriented";
  description: string;
  impact_summary: string;
}

