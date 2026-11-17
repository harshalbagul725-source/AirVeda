import pytest
from app.schemas.planner import RoutineRequest
from app.services.planner_service import generate_routine


def test_routine_planner_personas():
    personas = [
        "Working professional",
        "Student",
        "Parent",
        "Senior citizen",
        "Outdoor worker",
        "Fitness enthusiast",
    ]
    for p in personas:
        req = RoutineRequest(
            persona=p,
            city="Nagpur",
            aqi=240,
            category="Poor",
            pm2_5=98.5,
            has_air_purifier=True,
        )
        res = generate_routine(req)
        assert res.persona == p
        assert len(res.morning.items) > 0
        assert len(res.afternoon.items) > 0
        assert len(res.evening.items) > 0
        assert len(res.night.items) > 0
        assert len(res.exercise_alternatives) > 0
        assert len(res.family_and_school_precautions) > 0
        assert res.morning.items[0].expected_benefit is not None


def test_routine_planner_severe_conditions():
    req = RoutineRequest(
        persona="Parent",
        city="Delhi",
        aqi=420,
        category="Severe",
        pm2_5=280.0,
    )
    res = generate_routine(req)
    assert res.morning.items[0].pollution_risk_level == "Critical"
    assert "certified respirator" in str(res.morning.items)
    assert "not an hourly forecast" in res.caution_notice


def test_routine_does_not_claim_a_safe_hourly_ventilation_window():
    req = RoutineRequest(
        persona="Parent",
        city="Nagpur",
        aqi=240,
        category="Poor",
        pm2_5=98.5,
        has_air_purifier=False,
    )

    res = generate_routine(req)

    assert "not a forecast" in res.afternoon.optimal_time_slot
    assert "cannot identify a safe hourly window" in res.afternoon.items[0].action_guidance
    assert "no purifier was reported" in res.night.items[0].action_guidance


def test_routine_uses_reported_air_purifier_availability():
    req = RoutineRequest(
        persona="Parent",
        city="Nagpur",
        aqi=75,
        category="Satisfactory",
        pm2_5=20.0,
        has_air_purifier=True,
    )

    res = generate_routine(req)

    assert "Use a correctly sized HEPA purifier if available." in res.night.items[0].action_guidance

