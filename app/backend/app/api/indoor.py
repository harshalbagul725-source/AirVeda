from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/indoor", tags=["Indoor Air Quality"])


class ChecklistItem(BaseModel):
    id: str
    category: str
    title: str
    description: str
    impact_level: str  # "High", "Medium", "Crucial"
    completed: bool = False


DEFAULT_CHECKLIST: List[ChecklistItem] = [
    ChecklistItem(
        id="hepa_placement",
        category="Air Filtration",
        title="Place True HEPA (H13) Purifier in Sleeping Area",
        description="Position the purifier at least 1-2 feet away from walls in the bedroom where you spend 7-8 hours breathing. Ensure CADR matches room square footage.",
        impact_level="Crucial",
    ),
    ChecklistItem(
        id="seal_drafts",
        category="Infiltration Control",
        title="Seal Window and Balcony Draft Gaps",
        description="Use foam weatherstripping tape or silicone draft stoppers on door bottoms to prevent outdoor winter smog from leaking inside during the night.",
        impact_level="High",
    ),
    ChecklistItem(
        id="no_incense",
        category="Combustion Prevention",
        title="Reduce Smoke Sources Indoors",
        description="Incense, mosquito coils, and other combustion sources can add smoke and particles to indoor air.",
        impact_level="Crucial",
    ),
    ChecklistItem(
        id="kitchen_exhaust",
        category="Source Control",
        title="Operate Kitchen Range Hood with External Vent",
        description="Always run your exhaust chimney on high while frying, sautéing, or tempering spices (tadka). Keep kitchen doors closed to prevent smoke migration.",
        impact_level="High",
    ),
    ChecklistItem(
        id="wet_mopping",
        category="Dust Management",
        title="Switch from Dry Broom to Wet Microfiber Mopping",
        description="Dry sweeping suspends settled toxic heavy metals and silica dust into breathing height. Wet mopping traps and removes fine settled particles.",
        impact_level="High",
    ),
    ChecklistItem(
        id="smart_ventilation",
        category="Ventilation",
        title="Check Outdoor Conditions Before Ventilating",
        description="A current AQI category does not identify a cleanest hour. Check local outdoor conditions and consider indoor ventilation needs before opening windows.",
        impact_level="High",
    ),
    ChecklistItem(
        id="hepa_vacuum",
        category="Dust Management",
        title="Use HEPA-Filtered Vacuum on Mattresses and Sofas",
        description="A well-maintained vacuum with effective filtration can help reduce dust; follow the manufacturer's maintenance instructions.",
        impact_level="Medium",
    ),
    ChecklistItem(
        id="plant_reality",
        category="Biophilic Education",
        title="Understand Indoor Plant Limitations",
        description="Enjoy indoor plants (Snake Plant, Areca Palm) for aesthetics and humidity, but note that plants DO NOT filter dynamic PM2.5 or replace mechanical HEPA filtration.",
        impact_level="Medium",
    ),
]


@router.get("/checklist", response_model=List[ChecklistItem])
async def get_indoor_checklist():
    """Retrieve the recommended indoor air safety checklist items."""
    return DEFAULT_CHECKLIST


@router.get("/ventilation-advice")
async def get_ventilation_advice(aqi: int = 150):
    """Provide general ventilation guidance based on the supplied current AQI category."""
    if aqi <= 50:
        return {
            "window_action": "Ventilation may be reasonable",
            "recommended_window": "Check current local conditions",
            "hepa_speed": "As needed",
            "summary": "The current AQI category is Good; it does not guarantee pollution-free air or identify an hourly ventilation window.",
        }
    elif aqi <= 100:
        return {
            "window_action": "Check conditions before opening",
            "recommended_window": "No hourly window calculated",
            "hepa_speed": "As needed",
            "summary": "The AQI category alone cannot determine whether outdoor air is cleaner than indoor air.",
        }
    elif aqi <= 200:
        return {
            "window_action": "Ventilate with Caution",
            "recommended_window": "No hourly window calculated",
            "hepa_speed": "Medium",
            "summary": "Check current local outdoor conditions and indoor ventilation needs; a fixed time is not a forecast of cleaner air.",
        }
    elif aqi <= 300:
        return {
            "window_action": "Keep Windows Closed",
            "recommended_window": "Check current conditions and official guidance",
            "hepa_speed": "High / Auto Boost",
            "summary": "Outdoor AQI is elevated. Reduce outdoor-pollution entry where practical; consider indoor ventilation needs and official guidance.",
        }
    else:
        return {
            "window_action": "Avoid unnecessary outdoor-air entry",
            "recommended_window": "Follow official local guidance",
            "hepa_speed": "Use filtration if available",
            "summary": "Outdoor AQI is very high. Reduce outdoor exposure and follow public-health guidance on indoor air and ventilation.",
        }

