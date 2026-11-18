import pytest
from app.services.aqi_calculator import (
    calculate_sub_index,
    calculate_us_aqi_pm25,
    get_cpcb_category,
    get_us_category,
    generate_health_advisories,
    evaluate_air_quality,
)


def test_cpcb_sub_index_pm25():
    # CPCB PM2.5 Breakpoints:
    # 0-30 -> 0-50 (Good)
    # 31-60 -> 51-100 (Satisfactory)
    # 61-90 -> 101-200 (Moderate)
    # 91-120 -> 201-300 (Poor)
    # 121-250 -> 301-400 (Very Poor)
    # 250+ -> 401-500 (Severe)
    assert calculate_sub_index(15.0, "pm2_5") == 25
    assert calculate_sub_index(30.0, "pm2_5") == 50
    assert calculate_sub_index(60.0, "pm2_5") == 100
    assert calculate_sub_index(75.0, "pm2_5") == 150
    assert calculate_sub_index(120.0, "pm2_5") == 300
    assert calculate_sub_index(300.0, "pm2_5") == 421  # 401 + (99/250)*50 = 421
    assert calculate_sub_index(500.0, "pm2_5") == 500


def test_cpcb_sub_index_pm10():
    # 0-50 -> 0-50 (Good)
    # 51-100 -> 51-100 (Satisfactory)
    # 101-250 -> 101-200 (Moderate)
    assert calculate_sub_index(50.0, "pm10") == 50
    assert calculate_sub_index(100.0, "pm10") == 100
    assert calculate_sub_index(175.0, "pm10") == 150


def test_us_epa_pm25_calculation():
    # 0-12 -> 0-50
    # 12.1-35.4 -> 51-100
    # 35.5-55.4 -> 101-150
    assert calculate_us_aqi_pm25(6.0) == 25
    assert calculate_us_aqi_pm25(12.0) == 50
    assert calculate_us_aqi_pm25(35.4) == 100


def test_cpcb_categories():
    cat, col, desc = get_cpcb_category(35)
    assert cat == "Good"
    assert col == "#059669"

    cat, col, desc = get_cpcb_category(85)
    assert cat == "Satisfactory"

    cat, col, desc = get_cpcb_category(160)
    assert cat == "Moderate"

    cat, col, desc = get_cpcb_category(240)
    assert cat == "Poor"

    cat, col, desc = get_cpcb_category(350)
    assert cat == "Very Poor"

    cat, col, desc = get_cpcb_category(450)
    assert cat == "Severe"


def test_evaluate_air_quality_max_rule():
    # Max sub-index should drive overall CPCB AQI
    # PM2.5 = 75 (sub-index 150 - Moderate)
    # PM10 = 40 (sub-index 40 - Good)
    result = evaluate_air_quality(pm2_5=75.0, pm10=40.0)
    assert result["cpcb_aqi"] == 150
    assert result["cpcb_category"] == "Moderate"
    assert result["prominent_pollutant"] == "PM2.5"
    assert "health_risks" in result


def test_health_advisories_do_not_infer_hourly_ventilation_windows():
    advice = generate_health_advisories(150, 75.0, 100.0)

    assert "not an hourly forecast" in advice["ventilation_advice"]
