import asyncio
import logging
import math
from typing import Optional, List
import httpx
from app.services.aqi_calculator import evaluate_air_quality, calculate_sub_index, calculate_us_aqi_pm25
from app.schemas.aqi import (
    AQIDataResponse,
    PollutantBreakdown,
    PollutantValue,
    WeatherConditions,
    HealthRisk,
    HistoricalDataResponse,
    HourlyPoint,
    CitySearchItem,
)
from app.utils.cache import aqi_cache, geo_cache

logger = logging.getLogger(__name__)


class CityNotFoundError(ValueError):
    """Raised when geocoding returns no match for a requested city."""

# Known prominent Indian cities with verified coordinates
POPULAR_INDIAN_CITIES = [
    {"name": "Nagpur", "state": "Maharashtra", "country": "India", "latitude": 21.1458, "longitude": 79.0882, "population": 2405000},
    {"name": "Delhi", "state": "Delhi", "country": "India", "latitude": 28.6139, "longitude": 77.2090, "population": 32941000},
    {"name": "Mumbai", "state": "Maharashtra", "country": "India", "latitude": 19.0760, "longitude": 72.8777, "population": 20961000},
    {"name": "Bengaluru", "state": "Karnataka", "country": "India", "latitude": 12.9716, "longitude": 77.5946, "population": 13193000},
    {"name": "Kolkata", "state": "West Bengal", "country": "India", "latitude": 22.5726, "longitude": 88.3639, "population": 15134000},
    {"name": "Pune", "state": "Maharashtra", "country": "India", "latitude": 18.5204, "longitude": 73.8567, "population": 6800000},
    {"name": "Lucknow", "state": "Uttar Pradesh", "country": "India", "latitude": 26.8467, "longitude": 80.9462, "population": 3800000},
    {"name": "Kanpur", "state": "Uttar Pradesh", "country": "India", "latitude": 26.4499, "longitude": 80.3319, "population": 3200000},
    {"name": "Ahmedabad", "state": "Gujarat", "country": "India", "latitude": 23.0225, "longitude": 72.5714, "population": 8450000},
    {"name": "Hyderabad", "state": "Telangana", "country": "India", "latitude": 17.3850, "longitude": 78.4867, "population": 10500000},
    {"name": "Chandigarh", "state": "Punjab/Haryana", "country": "India", "latitude": 30.7333, "longitude": 76.7794, "population": 1150000},
    {"name": "Jaipur", "state": "Rajasthan", "country": "India", "latitude": 26.9124, "longitude": 75.7873, "population": 3950000},
    {"name": "Patna", "state": "Bihar", "country": "India", "latitude": 25.5941, "longitude": 85.1376, "population": 2500000},
]

WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog and depositing rime fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
}


def get_weather_desc(code: Optional[int]) -> str:
    if code is None:
        return "Calm atmospheric conditions"
    return WMO_WEATHER_CODES.get(code, "Clear to hazy conditions")


async def search_cities(query: str) -> List[CitySearchItem]:
    """Search for cities using Open-Meteo Geocoding API with local cache & popular fallback."""
    q_clean = query.strip().lower()
    if not q_clean:
        return [CitySearchItem(**c) for c in POPULAR_INDIAN_CITIES[:8]]

    cached = geo_cache.get(f"geo_{q_clean}")
    if cached:
        return cached

    # Check local popular list first
    local_matches = [
        CitySearchItem(**c)
        for c in POPULAR_INDIAN_CITIES
        if q_clean in c["name"].lower() or q_clean in c.get("state", "").lower()
    ]

    try:
        url = "https://geocoding-api.open-meteo.com/v1/search"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, params={"name": query, "count": 10, "language": "en", "format": "json"})
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    results.append(
                        CitySearchItem(
                            id=item.get("id"),
                            name=item.get("name"),
                            state=item.get("admin1"),
                            country=item.get("country", "Unknown"),
                            latitude=item.get("latitude"),
                            longitude=item.get("longitude"),
                            population=item.get("population"),
                        )
                    )
                if results:
                    geo_cache.set(f"geo_{q_clean}", results)
                    return results
                return []
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        logger.warning("City geocoding request failed: %s", type(exc).__name__)

    if local_matches:
        return local_matches
    raise RuntimeError("The city geocoding service is unavailable.")


async def get_air_quality(
    city: str = "Nagpur",
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> AQIDataResponse:
    """Fetch model-based air quality data; unavailable readings are never substituted."""
    location = next((item for item in POPULAR_INDIAN_CITIES if item["name"].casefold() == city.casefold()), None)
    country = location["country"] if location else "Unknown"
    state = location.get("state") if location else None

    # Resolve coordinates if not provided
    if lat is None or lon is None:
        if location:
            lat = location["latitude"]
            lon = location["longitude"]
            city = location["name"]
        if lat is None or lon is None:
            search_res = await search_cities(city)
            if not search_res:
                raise CityNotFoundError("No matching city was found.")
            location = search_res[0].model_dump()
            lat = location["latitude"]
            lon = location["longitude"]
            city = location["name"]
            country = location["country"]
            state = location.get("state")

    cache_key = f"aqi_{round(lat, 3)}_{round(lon, 3)}"
    cached_data = aqi_cache.get(cache_key)
    if cached_data:
        # Return with data_mode="cached"
        resp_copy = cached_data.model_copy()
        resp_copy.data_mode = "cached"
        return resp_copy

    aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    aq_params = {
        "latitude": lat,
        "longitude": lon,
        "current": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
        "timezone": "UTC",
    }
    weather_url = "https://api.open-meteo.com/v1/forecast"
    weather_params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code",
        "timezone": "UTC",
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        aq_resp, weather_resp = await asyncio.gather(
            client.get(aq_url, params=aq_params),
            client.get(weather_url, params=weather_params),
        )
    aq_resp.raise_for_status()
    weather_resp.raise_for_status()
    aq_data = aq_resp.json().get("current", {})
    w_data = weather_resp.json().get("current", {})

    aq_fields = ("pm2_5", "pm10", "nitrogen_dioxide", "sulphur_dioxide", "carbon_monoxide", "ozone", "time")
    weather_fields = ("temperature_2m", "relative_humidity_2m", "wind_speed_10m", "time")
    if any(aq_data.get(field) is None for field in aq_fields) or any(w_data.get(field) is None for field in weather_fields):
        raise ValueError("The air-quality or weather service returned incomplete current conditions.")

    pm25 = float(aq_data["pm2_5"])
    pm10 = float(aq_data["pm10"])
    no2 = float(aq_data["nitrogen_dioxide"])
    so2 = float(aq_data["sulphur_dioxide"])
    co = float(aq_data["carbon_monoxide"])
    o3 = float(aq_data["ozone"])
    measured_values = (
        float(w_data["temperature_2m"]),
        float(w_data["relative_humidity_2m"]),
        float(w_data["wind_speed_10m"]),
        pm25, pm10, no2, so2, co, o3,
    )
    if not all(math.isfinite(value) for value in measured_values) or any(
        value < 0 for value in (pm25, pm10, no2, so2, co, o3)
    ):
        raise ValueError("The air-quality or weather service returned invalid measurements.")
    if not 0 <= measured_values[1] <= 100:
        raise ValueError("The weather service returned invalid humidity.")
    eval_result = evaluate_air_quality(pm25, pm10, no2, so2, co, o3)

    pollutants = PollutantBreakdown(
        pm2_5=PollutantValue(
            value=round(pm25, 1), unit="µg/m³",
            sub_index=calculate_sub_index(pm25, "pm2_5"),
            description="Fine particulate matter (PM2.5), modelled by Open-Meteo.",
        ),
        pm10=PollutantValue(
            value=round(pm10, 1), unit="µg/m³",
            sub_index=calculate_sub_index(pm10, "pm10"),
            description="Coarse particulate matter (PM10), modelled by Open-Meteo.",
        ),
        no2=PollutantValue(
            value=round(no2, 1), unit="µg/m³",
            sub_index=calculate_sub_index(no2, "no2"),
            description="Nitrogen dioxide, modelled by Open-Meteo.",
        ),
        so2=PollutantValue(
            value=round(so2, 1), unit="µg/m³",
            sub_index=calculate_sub_index(so2, "so2"),
            description="Sulfur dioxide, modelled by Open-Meteo.",
        ),
        co=PollutantValue(
            value=round(co / 1000.0, 2), unit="mg/m³",
            sub_index=calculate_sub_index(co / 1000.0, "co"),
            description="Carbon monoxide, converted from µg/m³ to mg/m³.",
        ),
        o3=PollutantValue(
            value=round(o3, 1), unit="µg/m³",
            sub_index=calculate_sub_index(o3, "o3"),
            description="Ozone, modelled by Open-Meteo.",
        ),
    )
    w_code = w_data.get("weather_code")
    timestamp = f"{aq_data['time']}Z" if not aq_data["time"].endswith("Z") else aq_data["time"]
    result = AQIDataResponse(
        city=city,
        state=state,
        country=country,
        latitude=lat,
        longitude=lon,
        timestamp=timestamp,
        data_source="Open-Meteo Air Quality model and Weather APIs",
        data_mode="live",
        cpcb_aqi=eval_result["cpcb_aqi"],
        cpcb_category=eval_result["cpcb_category"],
        us_aqi=eval_result["us_aqi"],
        us_category=eval_result["us_category"],
        prominent_pollutant=eval_result["prominent_pollutant"],
        pollutants=pollutants,
        weather=WeatherConditions(
            temperature=round(float(w_data["temperature_2m"]), 1),
            humidity=int(w_data["relative_humidity_2m"]),
            wind_speed=round(float(w_data["wind_speed_10m"]), 1),
            wind_direction=w_data.get("wind_direction_10m"),
            surface_pressure=w_data.get("surface_pressure"),
            weather_code=w_code,
            weather_description=get_weather_desc(w_code),
        ),
        health_risks=HealthRisk(**eval_result["health_risks"]),
        methodology_notes="Open-Meteo modelled concentrations are used to calculate CPCB NAQI sub-indices and a separate US EPA PM2.5 AQI. These are not ground-station measurements.",
    )

    aqi_cache.set(cache_key, result, ttl=900)
    return result


async def get_historical_air_quality(
    city: str = "Nagpur",
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> HistoricalDataResponse:
    """Fetch a 24-hour modelled trend; never synthesize missing hourly points."""
    if lat is None or lon is None:
        for c in POPULAR_INDIAN_CITIES:
            if c["name"].lower() == city.lower():
                lat = c["latitude"]
                lon = c["longitude"]
                city = c["name"]
                break
        if lat is None or lon is None:
            search_res = await search_cities(city)
            if not search_res:
                raise CityNotFoundError("No matching city was found.")
            lat = search_res[0].latitude
            lon = search_res[0].longitude
            city = search_res[0].name

    points: List[HourlyPoint] = []
    aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "pm10,pm2_5,us_aqi",
        "past_days": 1,
        "forecast_days": 0,
        "timezone": "UTC",
    }
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(aq_url, params=params)
    resp.raise_for_status()
    data = resp.json().get("hourly", {})
    times = data.get("time", [])
    pm25_list = data.get("pm2_5", [])
    pm10_list = data.get("pm10", [])
    us_aqi_list = data.get("us_aqi", [])
    if not times or not (len(times) == len(pm25_list) == len(pm10_list) == len(us_aqi_list)):
        raise ValueError("The air-quality service returned incomplete historical conditions.")

    for timestamp, pm25_value, pm10_value, us_aqi_value in zip(times, pm25_list, pm10_list, us_aqi_list):
        if pm25_value is None or pm10_value is None:
            continue
        pm25 = float(pm25_value)
        pm10 = float(pm10_value)
        assessment = evaluate_air_quality(pm25, pm10)
        points.append(HourlyPoint(
            timestamp=f"{timestamp}Z" if not timestamp.endswith("Z") else timestamp,
            cpcb_aqi=assessment["cpcb_aqi"],
            us_aqi=int(us_aqi_value) if us_aqi_value is not None else calculate_us_aqi_pm25(pm25),
            pm2_5=round(pm25, 1),
            pm10=round(pm10, 1),
        ))

    if not points:
        raise ValueError("The air-quality service returned no usable historical readings.")

    return HistoricalDataResponse(
        city=city,
        data_source="Open-Meteo Air Quality model",
        data_mode="live",
        points=points[-24:],
    )

