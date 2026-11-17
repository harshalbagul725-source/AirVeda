"""
Air Quality Index (AQI) Calculation Module
Implements:
1. Indian National Air Quality Index (CPCB NAQI) according to CPCB guidelines (2014/2015).
2. US EPA Air Quality Index (Technical Assistance Document for the Reporting of Daily Air Quality, EPA-454/B-18-007).
"""

from typing import Dict, Tuple, Optional, Any


# CPCB NAQI Breakpoints
# Format: (C_low, C_high, I_low, I_high)
CPCB_BREAKPOINTS = {
    "pm2_5": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 1000.0, 401, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2500.0, 401, 500),
    ],
    "co": [
        # CO concentrations in mg/m3
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 60.0, 401, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500),
    ],
}

# US EPA Breakpoints for PM2.5
US_EPA_PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 500.4, 301, 500),
]


def calculate_sub_index(conc: float, pollutant: str) -> Optional[int]:
    """
    Calculate CPCB sub-index for a specific pollutant using linear interpolation:
    I = I_lo + ((I_hi - I_lo) / (B_hi - B_lo)) * (C - B_lo)
    """
    if conc < 0:
        return 0
    breakpoints = CPCB_BREAKPOINTS.get(pollutant)
    if not breakpoints:
        return None

    # Cap if exceeds highest breakpoint
    max_b_hi = breakpoints[-1][1]
    if conc > max_b_hi:
        return 500

    for b_lo, b_hi, i_lo, i_hi in breakpoints:
        if b_lo <= conc <= b_hi:
            sub = i_lo + ((i_hi - i_lo) / (b_hi - b_lo)) * (conc - b_lo)
            return int(round(sub))

    # Fallback to last bracket if slightly off due to float rounding
    if conc > breakpoints[-1][0]:
        return 500
    return 0


def calculate_us_aqi_pm25(pm25: float) -> int:
    """Calculate US EPA AQI for PM2.5."""
    if pm25 < 0:
        return 0
    if pm25 > 500.4:
        return 500
    for b_lo, b_hi, i_lo, i_hi in US_EPA_PM25_BREAKPOINTS:
        if b_lo <= pm25 <= b_hi:
            sub = i_lo + ((i_hi - i_lo) / (b_hi - b_lo)) * (pm25 - b_lo)
            return int(round(sub))
    return int(round(pm25))


def get_cpcb_category(aqi: int) -> Tuple[str, str, str]:
    """
    Returns (CategoryName, ColorHex, SeverityDescription)
    CPCB Categories:
    0-50: Good
    51-100: Satisfactory
    101-200: Moderate
    201-300: Poor
    301-400: Very Poor
    401-500: Severe
    """
    if aqi <= 50:
        return (
            "Good",
            "#059669",
            "Minimal health impact. Air quality is considered satisfactory, and air pollution poses little or no risk.",
        )
    elif aqi <= 100:
        return (
            "Satisfactory",
            "#65A30D",
            "Minor breathing discomfort to sensitive people. Clean enough for general outdoor activities.",
        )
    elif aqi <= 200:
        return (
            "Moderate",
            "#D97706",
            "Breathing discomfort to people with lungs, asthma and heart diseases. Sensitive groups should reduce strenuous outdoor activity.",
        )
    elif aqi <= 300:
        return (
            "Poor",
            "#EA580C",
            "Breathing discomfort to most people on prolonged exposure. Avoid strenuous outdoor activities; consider N95 mask.",
        )
    elif aqi <= 400:
        return (
            "Very Poor",
            "#DC2626",
            "Respiratory illness to the people on prolonged exposure. Effect may be more pronounced in people with lung and heart diseases.",
        )
    else:
        return (
            "Severe",
            "#7F1D1D",
            "Respiratory effects even on healthy people and serious health impacts on that with lung/heart diseases. Emergency precautions warranted.",
        )


def get_us_category(aqi: int) -> Tuple[str, str]:
    """US EPA AQI categories."""
    if aqi <= 50:
        return ("Good", "#059669")
    elif aqi <= 100:
        return ("Moderate", "#D97706")
    elif aqi <= 150:
        return ("Unhealthy for Sensitive Groups", "#EA580C")
    elif aqi <= 200:
        return ("Unhealthy", "#DC2626")
    elif aqi <= 300:
        return ("Very Unhealthy", "#9333EA")
    else:
        return ("Hazardous", "#7F1D1D")


def evaluate_air_quality(
    pm2_5: float,
    pm10: float,
    no2: Optional[float] = None,
    so2: Optional[float] = None,
    co: Optional[float] = None,
    o3: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Evaluates air quality metrics and returns calculated indices,
    prominent pollutant, categories, and health advisories.
    """
    sub_indices: Dict[str, int] = {}
    
    sub_pm25 = calculate_sub_index(pm2_5, "pm2_5")
    if sub_pm25 is not None:
        sub_indices["PM2.5"] = sub_pm25

    sub_pm10 = calculate_sub_index(pm10, "pm10")
    if sub_pm10 is not None:
        sub_indices["PM10"] = sub_pm10

    if no2 is not None:
        sub_no2 = calculate_sub_index(no2, "no2")
        if sub_no2 is not None:
            sub_indices["NO2"] = sub_no2

    if so2 is not None:
        sub_so2 = calculate_sub_index(so2, "so2")
        if sub_so2 is not None:
            sub_indices["SO2"] = sub_so2

    if co is not None:
        # If CO is in ug/m3, convert to mg/m3 (1 mg = 1000 ug)
        co_mg = co / 1000.0 if co > 100 else co
        sub_co = calculate_sub_index(co_mg, "co")
        if sub_co is not None:
            sub_indices["CO"] = sub_co

    if o3 is not None:
        sub_o3 = calculate_sub_index(o3, "o3")
        if sub_o3 is not None:
            sub_indices["Ozone"] = sub_o3

    if not sub_indices:
        overall_cpcb = 50
        prominent = "PM2.5"
    else:
        prominent, overall_cpcb = max(sub_indices.items(), key=lambda x: x[1])

    cpcb_category, cpcb_color, cpcb_desc = get_cpcb_category(overall_cpcb)
    us_aqi = calculate_us_aqi_pm25(pm2_5)
    us_category, us_color = get_us_category(us_aqi)

    # Health risks according to CPCB severity
    health_risks = generate_health_advisories(overall_cpcb, pm2_5, pm10)

    return {
        "cpcb_aqi": overall_cpcb,
        "cpcb_category": cpcb_category,
        "cpcb_color": cpcb_color,
        "cpcb_description": cpcb_desc,
        "us_aqi": us_aqi,
        "us_category": us_category,
        "us_color": us_color,
        "prominent_pollutant": prominent,
        "sub_indices": sub_indices,
        "health_risks": health_risks,
    }


def generate_health_advisories(aqi: int, pm25: float, pm10: float) -> Dict[str, str]:
    """Return general precautionary guidance for an AQI category, not a medical assessment."""
    ventilation = (
        "This AQI is not an hourly forecast or an indoor-air measurement. "
        "Check current local outdoor conditions and indoor ventilation needs before opening windows."
    )
    mask_guidance = (
        "If choosing respiratory protection, a well-fitting certified particulate respirator may reduce exposure; "
        "follow its instructions and local public-health guidance."
    )
    if aqi <= 50:
        return {
            "general_public": "Air quality is in the Good category. Normal outdoor activity is generally reasonable, though no AQI guarantees zero exposure or risk.",
            "sensitive_groups": "No AQI-related restrictions are indicated by this category; follow local alerts and personal medical guidance.",
            "children_and_elderly": "Outdoor activity is generally reasonable in this category; follow local alerts and any individual care plan.",
            "outdoor_workers": "Follow local workplace guidance and any applicable occupational protections.",
            "recommended_mask": "No mask recommendation is made from this AQI category alone.",
            "ventilation_advice": ventilation,
            "outdoor_activity_advice": "Outdoor activity is generally reasonable in this category; check local conditions.",
        }
    elif aqi <= 100:
        return {
            "general_public": "Air quality is in the Satisfactory category. Most people can generally follow their usual routine.",
            "sensitive_groups": "Unusually sensitive individuals may notice irritation during heavy exertion and should follow local alerts.",
            "children_and_elderly": "Outdoor activity is generally reasonable; follow local alerts and any individual care plan.",
            "outdoor_workers": "Follow local workplace guidance and any applicable occupational protections.",
            "recommended_mask": "No mask recommendation is made from this AQI category alone.",
            "ventilation_advice": ventilation,
            "outdoor_activity_advice": "Most people can generally follow their usual routine; check local conditions.",
        }
    elif aqi <= 200:
        return {
            "general_public": "At this AQI level, some people may experience discomfort, particularly during prolonged outdoor exertion.",
            "sensitive_groups": "Consider reducing prolonged or strenuous outdoor exertion and follow local alerts and individual care guidance.",
            "children_and_elderly": "Consider reducing prolonged or strenuous outdoor activity; follow local alerts and individual care plans.",
            "outdoor_workers": "Follow workplace air-quality guidance and use designated cleaner-air breaks when available.",
            "recommended_mask": mask_guidance,
            "ventilation_advice": ventilation,
            "outdoor_activity_advice": "Consider lower-intensity or indoor alternatives for strenuous activity.",
        }
    elif aqi <= 300:
        return {
            "general_public": "Air quality is Poor. Consider reducing prolonged outdoor exposure.",
            "sensitive_groups": "Reduce prolonged or strenuous outdoor exertion where practical and follow local health guidance.",
            "children_and_elderly": "Consider indoor alternatives for strenuous activity and follow local alerts and individual care plans.",
            "outdoor_workers": "Follow workplace air-quality guidance and use designated cleaner-air breaks when available.",
            "recommended_mask": mask_guidance,
            "ventilation_advice": ventilation,
            "outdoor_activity_advice": "Consider indoor alternatives to prolonged or strenuous outdoor exercise.",
        }
    elif aqi <= 400:
        return {
            "general_public": "Air quality is Very Poor. Minimize prolonged outdoor exposure where practical and follow local advisories.",
            "sensitive_groups": "Reduce outdoor exertion and follow local health guidance and individual care plans.",
            "children_and_elderly": "Consider limiting outdoor exertion and follow local alerts and individual care plans.",
            "outdoor_workers": "Follow workplace air-quality and respiratory-protection guidance.",
            "recommended_mask": mask_guidance,
            "ventilation_advice": ventilation,
            "outdoor_activity_advice": "Consider avoiding strenuous outdoor exercise and use a cleaner indoor alternative.",
        }
    else:
        return {
            "general_public": "Air quality is in the Severe category. Minimize outdoor exposure where practical and follow official local advisories.",
            "sensitive_groups": "Follow local health guidance and individual care plans; consider reducing outdoor exposure.",
            "children_and_elderly": "Follow local alerts and any individual care plans; consider indoor alternatives for strenuous activity.",
            "outdoor_workers": "Follow workplace air-quality and respiratory-protection guidance.",
            "recommended_mask": mask_guidance,
            "ventilation_advice": ventilation,
            "outdoor_activity_advice": "Consider avoiding strenuous outdoor activity and use an indoor alternative where practical.",
        }

