"""
Eco Impact Calculator Service
Estimates greenhouse gas (CO2) emissions and transport-cost differences from
illustrative per-mode assumptions.
"""

from typing import Dict
from app.schemas.calculator import EcoImpactRequest, EcoImpactResponse

# Illustrative factors in g CO2 per vehicle-kilometer for private vehicles and
# per passenger-kilometer for shared transit. Actual values vary by vehicle,
# occupancy, route, fuel, and electricity mix.
EMISSION_FACTORS: Dict[str, float] = {
    "petrol_car": 172.0,      # Average Indian petrol passenger car (1.2L - 1.5L)
    "diesel_car": 194.0,      # Average Indian diesel SUV/sedan
    "motorbike": 48.0,        # 100-150cc petrol motorcycle / scooter
    "carpooling": 86.0,       # 2-person default (dynamically adjusted by passenger count)
    "bus": 38.0,              # Standard urban transit bus (occupancy weighted)
    "metro": 14.5,            # Electric Metro Rail (grid emission weighted)
    "bicycle": 0.0,           # Zero direct tailpipe emissions
    "walking": 0.0,           # Zero direct tailpipe emissions
    "work_from_home": 0.0,    # Eliminates commute completely
}

FUEL_COST_PER_KM: Dict[str, float] = {
    "petrol_car": 7.20,       # At ~₹104/L and 14.5 km/L
    "diesel_car": 6.80,       # At ~₹92/L and 13.5 km/L
    "motorbike": 2.30,        # At ~₹104/L and 45 km/L
}

ANNUAL_TREE_CO2_SEQUESTRATION_KG = 21.77  # Illustrative comparison only; not a planting claim.


def calculate_eco_impact(req: EcoImpactRequest) -> EcoImpactResponse:
    baseline_ef = EMISSION_FACTORS[req.baseline_mode]
    
    if req.chosen_mode == "carpooling":
        passengers = max(2, req.carpool_passengers or 2)
        chosen_ef = baseline_ef / passengers
    else:
        chosen_ef = EMISSION_FACTORS[req.chosen_mode]

    # Avoid negative savings if someone upgrades to a higher emission mode
    ef_difference = max(0.0, baseline_ef - chosen_ef)  # g CO2/km

    # Calculations
    daily_co2_kg = (ef_difference * req.daily_distance_km) / 1000.0
    weekly_co2_kg = daily_co2_kg * req.days_per_week
    monthly_co2_kg = weekly_co2_kg * 4.33  # Average weeks per month
    annual_co2_kg = weekly_co2_kg * 52.0

    # Fuel cost savings
    baseline_cost_per_km = FUEL_COST_PER_KM.get(req.baseline_mode, 7.0)
    chosen_cost_per_km = 0.0
    if req.chosen_mode == "metro":
        chosen_cost_per_km = 2.0  # Approx transit fare per km
    elif req.chosen_mode == "bus":
        chosen_cost_per_km = 1.2
    elif req.chosen_mode == "carpooling":
        chosen_cost_per_km = baseline_cost_per_km / max(2, req.carpool_passengers or 2)
    elif req.chosen_mode == "motorbike":
        chosen_cost_per_km = FUEL_COST_PER_KM.get("motorbike", 2.3)

    daily_cost_saving = max(0.0, (baseline_cost_per_km - chosen_cost_per_km) * req.daily_distance_km)
    monthly_cost_saving = daily_cost_saving * req.days_per_week * 4.33

    # Tree equivalents
    trees = round(annual_co2_kg / ANNUAL_TREE_CO2_SEQUESTRATION_KG, 1)

    # Sustainable score (0 - 100)
    # Higher score for lower emission and zero emission modes
    if chosen_ef == 0:
        score = 100
    elif chosen_ef <= 15:
        score = 92
    elif chosen_ef <= 40:
        score = 80
    elif chosen_ef <= 70:
        score = 65
    elif chosen_ef <= 100:
        score = 45
    else:
        score = 25

    return EcoImpactResponse(
        baseline_mode=req.baseline_mode,
        chosen_mode=req.chosen_mode,
        daily_distance_km=round(req.daily_distance_km, 1),
        days_per_week=req.days_per_week,
        daily_co2_saved_kg=round(daily_co2_kg, 2),
        weekly_co2_saved_kg=round(weekly_co2_kg, 2),
        monthly_co2_saved_kg=round(monthly_co2_kg, 2),
        annual_co2_saved_kg=round(annual_co2_kg, 1),
        equivalent_trees_planted=trees,
        fuel_cost_saved_inr=round(monthly_cost_saving, 0),
        sustainable_travel_score=score,
        emission_factors_used={
            f"baseline_{req.baseline_mode}": baseline_ef,
            f"chosen_{req.chosen_mode}": chosen_ef,
        },
        formula_explanation="Emissions Avoided (kg CO2) = ((Baseline EF - Chosen EF) [g/km] * Distance [km] * Days) / 1000",
        scientific_disclaimer=(
            "Illustrative estimate based on the displayed emission-factor assumptions; actual emissions and costs vary by vehicle, "
            "occupancy, route, fuel, energy mix, and local prices. Cost assumptions use fixed example per-kilometer values and exclude fixed vehicle costs. "
            "This CO2 estimate is not a measurement of local PM2.5 or other pollutants. The tree equivalent assumes 21.77 kg CO2 per mature tree per year "
            "for comparison only; it is not a claim that trees were planted."
        ),
    )

