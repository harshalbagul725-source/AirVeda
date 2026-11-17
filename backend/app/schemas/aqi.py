from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class PollutantValue(BaseModel):
    value: float = Field(..., description="Concentration value")
    unit: str = Field(..., description="Unit of measurement e.g. ug/m3")
    sub_index: Optional[int] = Field(None, description="Calculated CPCB sub-index")
    category: Optional[str] = Field(None, description="Category for this pollutant")
    description: str = Field(..., description="Plain-language description of health impact")


class PollutantBreakdown(BaseModel):
    pm2_5: PollutantValue
    pm10: PollutantValue
    no2: Optional[PollutantValue] = None
    so2: Optional[PollutantValue] = None
    co: Optional[PollutantValue] = None
    o3: Optional[PollutantValue] = None


class WeatherConditions(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: int = Field(..., description="Relative humidity percentage")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    wind_direction: Optional[float] = Field(None, description="Wind direction in degrees")
    surface_pressure: Optional[float] = Field(None, description="Surface pressure in hPa")
    weather_code: Optional[int] = Field(None, description="WMO weather interpretation code")
    weather_description: str = Field(..., description="Human readable weather description")


class HealthRisk(BaseModel):
    general_public: str
    sensitive_groups: str
    children_and_elderly: str
    outdoor_workers: str
    recommended_mask: str
    ventilation_advice: str
    outdoor_activity_advice: str


class AQIDataResponse(BaseModel):
    city: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    timestamp: str
    data_source: str
    data_mode: str  # "live" or "cached"
    cpcb_aqi: int
    cpcb_category: str  # "Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"
    us_aqi: int
    us_category: str
    prominent_pollutant: str
    pollutants: PollutantBreakdown
    weather: WeatherConditions
    health_risks: HealthRisk
    methodology_notes: str


class HourlyPoint(BaseModel):
    timestamp: str
    cpcb_aqi: int
    us_aqi: int
    pm2_5: float
    pm10: float
    temperature: Optional[float] = None
    humidity: Optional[int] = None


class HistoricalDataResponse(BaseModel):
    city: str
    data_source: str
    data_mode: str
    points: List[HourlyPoint]


class CitySearchItem(BaseModel):
    id: Optional[int] = None
    name: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    population: Optional[int] = None

