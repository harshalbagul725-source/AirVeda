from typing import List, Optional
from pydantic import BaseModel, Field


class RoutineItem(BaseModel):
    time_window: str
    activity_name: str
    action_guidance: str
    pollution_risk_level: str  # "Low", "Moderate", "High", "Critical"
    expected_benefit: str
    transport_or_gear_tips: Optional[str] = None


class TimeOfDayRoutine(BaseModel):
    title: str
    optimal_time_slot: str
    items: List[RoutineItem]


class RoutineRequest(BaseModel):
    persona: str = Field(..., description="Working professional, Student, Parent, Senior citizen, Outdoor worker, Fitness enthusiast")
    city: str = "Nagpur"
    aqi: int
    category: str
    pm2_5: float
    has_air_purifier: bool = False
    has_ac_with_pm25: bool = False
    commute_mode: Optional[str] = "public_transit"


class RoutineResponse(BaseModel):
    persona: str
    city: str
    aqi: int
    category: str
    summary_assessment: str
    morning: TimeOfDayRoutine
    afternoon: TimeOfDayRoutine
    evening: TimeOfDayRoutine
    night: TimeOfDayRoutine
    exercise_alternatives: List[str]
    commute_recommendations: List[str]
    ventilation_guide: str
    family_and_school_precautions: List[str]
    caution_notice: str

