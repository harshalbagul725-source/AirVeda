from typing import Dict, Optional, Literal
from pydantic import BaseModel, Field


class EcoImpactRequest(BaseModel):
    baseline_mode: Literal["petrol_car", "diesel_car", "motorbike"] = Field("petrol_car", description="Baseline vehicle")
    chosen_mode: Literal["walking", "bicycle", "metro", "bus", "carpooling", "work_from_home"] = Field("metro", description="Alternative transport mode")
    daily_distance_km: float = Field(..., gt=0, le=500, description="Daily roundtrip commute in km")
    days_per_week: int = Field(5, ge=1, le=7, description="Number of commute days per week")
    carpool_passengers: Optional[int] = Field(2, ge=2, le=5, description="If carpooling, number of people sharing")


class EcoImpactResponse(BaseModel):
    baseline_mode: str
    chosen_mode: str
    daily_distance_km: float
    days_per_week: int
    daily_co2_saved_kg: float
    weekly_co2_saved_kg: float
    monthly_co2_saved_kg: float
    annual_co2_saved_kg: float
    equivalent_trees_planted: float
    fuel_cost_saved_inr: float
    sustainable_travel_score: int  # 0 to 100
    emission_factors_used: Dict[str, float]  # g CO2/km
    formula_explanation: str
    scientific_disclaimer: str

