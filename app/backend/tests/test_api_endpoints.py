import asyncio
import pytest
import httpx
from unittest.mock import patch, AsyncMock
from app.main import app
from app.schemas.aqi import (
    AQIDataResponse,
    CitySearchItem,
    HistoricalDataResponse,
    HealthRisk,
    HourlyPoint,
    PollutantBreakdown,
    PollutantValue,
    WeatherConditions,
)


def sample_aqi_response():
    return AQIDataResponse(
        city="Nagpur",
        state="Maharashtra",
        country="India",
        latitude=21.1458,
        longitude=79.0882,
        timestamp="2025-01-01T10:00:00Z",
        data_source="Test fixture",
        data_mode="live",
        cpcb_aqi=82,
        cpcb_category="Satisfactory",
        us_aqi=110,
        us_category="Unhealthy for Sensitive Groups",
        prominent_pollutant="PM2.5",
        pollutants=PollutantBreakdown(
            pm2_5=PollutantValue(value=35, unit="µg/m³", description="Test fixture"),
            pm10=PollutantValue(value=50, unit="µg/m³", description="Test fixture"),
        ),
        weather=WeatherConditions(
            temperature=25,
            humidity=50,
            wind_speed=5,
            weather_description="Clear",
        ),
        health_risks=HealthRisk(
            general_public="Test guidance",
            sensitive_groups="Test guidance",
            children_and_elderly="Test guidance",
            outdoor_workers="Test guidance",
            recommended_mask="None",
            ventilation_advice="Test guidance",
            outdoor_activity_advice="Test guidance",
        ),
        methodology_notes="Test fixture only",
    )


def run_async(coro):
    return asyncio.run(coro)


def test_health_endpoint():
    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/health")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "healthy"
            assert "CPCB NAQI 2014" in data["standards_supported"]
            assert resp.headers["content-security-policy"].startswith("default-src 'self'")
    run_async(_run())


def test_current_aqi_endpoint_returns_modelled_data():
    async def _run():
        with patch("app.api.aqi.get_air_quality", new=AsyncMock(return_value=sample_aqi_response())):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                resp = await client.get("/api/aqi/current?city=Nagpur")
                assert resp.status_code == 200
                data = resp.json()
                assert data["city"] == "Nagpur"
                assert "cpcb_aqi" in data
                assert "pollutants" in data
                assert "weather" in data
                assert data["data_mode"] == "live"
                assert "Test fixture" in data["data_source"]
    run_async(_run())


def test_current_aqi_does_not_substitute_readings_when_upstream_fails():
    async def _run():
        with patch("app.api.aqi.get_air_quality", new=AsyncMock(side_effect=httpx.ConnectError("offline"))):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                resp = await client.get("/api/aqi/current?city=Nagpur")
                assert resp.status_code == 503
                assert "temporarily unavailable" in resp.json()["detail"]
    run_async(_run())


def test_historical_aqi_endpoint():
    async def _run():
        history = HistoricalDataResponse(
            city="Nagpur",
            data_source="Test fixture",
            data_mode="live",
            points=[
                HourlyPoint(
                    timestamp="2025-01-01T10:00:00Z",
                    cpcb_aqi=50,
                    us_aqi=80,
                    pm2_5=30,
                    pm10=45,
                )
            ],
        )
        with patch("app.api.aqi.get_historical_air_quality", new=AsyncMock(return_value=history)):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                resp = await client.get("/api/aqi/historical?city=Nagpur")
                assert resp.status_code == 200
                data = resp.json()
                assert len(data["points"]) == 1
                assert data["points"][0]["cpcb_aqi"] == 50
    run_async(_run())


def test_city_search_endpoint():
    async def _run():
        city = CitySearchItem(name="Nagpur", state="Maharashtra", country="India", latitude=21.1458, longitude=79.0882)
        with patch("app.api.aqi.search_cities", new=AsyncMock(return_value=[city])):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                resp = await client.get("/api/aqi/cities?q=nag")
                assert resp.status_code == 200
                data = resp.json()
                assert data[0]["name"] == "Nagpur"
    run_async(_run())


def test_methodology_endpoint():
    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/aqi/methodology")
            assert resp.status_code == 200
            data = resp.json()
            assert "primary_standard" in data
            assert "comparative_standard" in data
    run_async(_run())


def test_ai_chat_endpoint():
    async def _run():
        from app.schemas.ai import ChatResponse

        payload = {
            "message": "Is it safe to go outside?",
            "city": "Nagpur",
            "aqi": 180,
            "category": "Moderate",
            "pm2_5": 85.0,
            "lifestyle": "Senior Citizen",
        }
        response = ChatResponse(
            reply="Test response",
            is_fallback=True,
            model_used="Test fixture",
            timestamp="2025-01-01T10:00:00Z",
            disclaimer="Test disclaimer",
        )
        with patch("app.api.ai.chat_with_assistant", new=AsyncMock(return_value=response)):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                resp = await client.post("/api/ai/chat", json=payload)
                assert resp.status_code == 200
                data = resp.json()
                assert data["reply"] == "Test response"
                assert "disclaimer" in data
    run_async(_run())


def test_routine_planner_endpoint():
    async def _run():
        payload = {
            "persona": "Working professional",
            "city": "Nagpur",
            "aqi": 175,
            "category": "Moderate",
            "pm2_5": 82.0,
        }
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/planner/generate", json=payload)
            assert resp.status_code == 200
            data = resp.json()
            assert data["persona"] == "Working professional"
            assert "morning" in data
            assert "afternoon" in data
    run_async(_run())


def test_eco_calculator_endpoint():
    async def _run():
        payload = {
            "baseline_mode": "petrol_car",
            "chosen_mode": "metro",
            "daily_distance_km": 25.0,
            "days_per_week": 5,
        }
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.post("/api/calculator/eco-impact", json=payload)
            assert resp.status_code == 200
            data = resp.json()
            assert data["daily_co2_saved_kg"] > 0
            assert data["sustainable_travel_score"] > 80
    run_async(_run())


def test_invalid_eco_transport_mode_rejected():
    async def _run():
        payload = {
            "baseline_mode": "unknown_vehicle",
            "chosen_mode": "teleport",
            "daily_distance_km": 10,
            "days_per_week": 5,
        }
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/calculator/eco-impact", json=payload)
            assert response.status_code == 422
    run_async(_run())


def test_unpaired_coordinates_rejected():
    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/aqi/current?city=Nagpur&lat=21.1458")
            assert resp.status_code == 400
            assert "coordinate pair" in resp.json()["detail"].lower()
    run_async(_run())


def test_invalid_lat_range_rejected():
    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/aqi/current?city=Nagpur&lat=120.0&lon=79.0")
            assert resp.status_code == 422 or resp.status_code == 400
    run_async(_run())


def test_indoor_and_community_endpoints():
    async def _run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/indoor/checklist")
            assert resp.status_code == 200
            assert len(resp.json()) >= 6
            ventilation_check = next(item for item in resp.json() if item["id"] == "smart_ventilation")
            assert "cleanest hour" in ventilation_check["description"]

            resp = await client.get("/api/indoor/ventilation-advice?aqi=240")
            assert resp.status_code == 200
            advice = resp.json()
            assert advice["recommended_window"] == "Check current conditions and official guidance"
            assert "2:00 PM" not in advice["recommended_window"]
            assert "AQI is elevated" in advice["summary"]

            resp = await client.get("/api/community/challenges")
            assert resp.status_code == 200
            assert len(resp.json()) >= 3
            assert all("participant_count" not in challenge for challenge in resp.json())
    run_async(_run())
