import pytest
from pydantic import ValidationError
from app.schemas.calculator import EcoImpactRequest
from app.services.eco_calculator import calculate_eco_impact, EMISSION_FACTORS


def test_eco_impact_car_to_metro():
    req = EcoImpactRequest(
        baseline_mode="petrol_car",
        chosen_mode="metro",
        daily_distance_km=20.0,
        days_per_week=5,
    )
    res = calculate_eco_impact(req)
    # Baseline: 172.0 g/km, Metro: 14.5 g/km
    # Diff = 157.5 g/km
    # Daily = (157.5 * 20) / 1000 = 3.15 kg
    assert res.daily_co2_saved_kg == 3.15
    assert res.weekly_co2_saved_kg == pytest.approx(15.75, 0.05)
    assert res.annual_co2_saved_kg > 800.0
    assert res.equivalent_trees_planted > 35
    assert res.sustainable_travel_score >= 90
    assert "Illustrative estimate" in res.scientific_disclaimer
    assert "not a claim that trees were planted" in res.scientific_disclaimer


def test_eco_impact_carpooling():
    req = EcoImpactRequest(
        baseline_mode="petrol_car",
        chosen_mode="carpooling",
        daily_distance_km=30.0,
        days_per_week=5,
        carpool_passengers=3,
    )
    res = calculate_eco_impact(req)
    assert res.daily_co2_saved_kg > 0
    assert res.monthly_co2_saved_kg > 0
    assert res.sustainable_travel_score > 50


def test_eco_impact_validation():
    # Negative or 0 distance should be rejected by Pydantic
    with pytest.raises(Exception):
        EcoImpactRequest(
            baseline_mode="petrol_car",
            chosen_mode="walking",
            daily_distance_km=-10.0,
            days_per_week=5,
        )

    with pytest.raises(ValidationError):
        EcoImpactRequest(
            baseline_mode="petrol_car",
            chosen_mode="e_bike",
            daily_distance_km=10.0,
            days_per_week=5,
        )

