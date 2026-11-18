import asyncio
import pytest
from app.schemas.ai import ChatRequest
from app.services.gemini_service import generate_expert_fallback, chat_with_assistant


def test_expert_fallback_mask_advice():
    req = ChatRequest(
        message="What mask should I buy for winter smog?",
        city="Nagpur",
        aqi=260,
        category="Poor",
        pm2_5=110.0,
        lifestyle="Parent",
    )
    reply = generate_expert_fallback(req)
    assert "N95" in reply or "FFP2" in reply
    assert "cloth" in reply.lower()


def test_expert_fallback_children_play():
    req = ChatRequest(
        message="Can my children play outdoors today?",
        city="Nagpur",
        aqi=280,
        category="Poor",
        pm2_5=115.0,
        lifestyle="Parent",
    )
    reply = generate_expert_fallback(req)
    assert "children" in reply.lower()
    assert "air pollution" in reply.lower()
    assert "hourly forecast" in reply.lower()


def test_chat_with_assistant_returns_disclaimer():
    req = ChatRequest(
        message="Is it safe to go outside today?",
        city="Nagpur",
        aqi=140,
        category="Moderate",
    )
    from unittest.mock import patch
    with patch("app.services.gemini_service.is_gemini_active", return_value=False):
        res = asyncio.run(chat_with_assistant(req))
    assert res.reply is not None
    assert len(res.suggested_followups) > 0
    assert "DISCLAIMER" in res.disclaimer


def test_fallback_does_not_invent_current_readings_when_missing():
    req = ChatRequest(message="Is it safe to go outside?", city="Nagpur")
    reply = generate_expert_fallback(req)
    assert "unavailable" in reply.lower()
    assert "165" not in reply
    assert "78.0" not in reply
