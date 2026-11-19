"""
Gemini AI Service with Graceful Fallback Engine
Integrates Google Gemini API for personalized air quality recommendations,
with a robust fallback expert engine when API key is unset or calls fail.
"""

import datetime
import logging
import httpx
from app.config import settings
from app.schemas.ai import ChatRequest, ChatResponse, Message

MEDICAL_DISCLAIMER = (
    "DISCLAIMER: This application provides environmental air quality guidance and preventative recommendations. "
    "It is NOT medical advice and does NOT diagnose or treat respiratory, cardiovascular, or other medical conditions. "
    "If you experience chest tightness, wheezing, severe coughing, or breathlessness, seek immediate professional medical attention."
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are AirVeda, a compassionate, scientifically rigorous environmental health advisor.
Your mission is to help individuals and families navigate urban smog and air pollution safely.

CRITICAL INSTRUCTIONS:
1. Use supplied AQI and PM2.5 values only when present; explicitly state when current readings are unavailable.
   Treat supplied air-quality readings as modelled estimates, not station measurements.
2. Explain recommendations in clear, accessible language without overstating health effects.
   Never call a reading "safe" or identify a cleaner hour unless the context includes that information.
3. Tailor advice to the user's selected lifestyle/vulnerability (e.g. parents protecting children whose lungs are still developing, senior citizens, outdoor workers, fitness enthusiasts).
4. NEVER diagnose diseases or prescribe medications.
5. NEVER invent fictional air quality measurements; refer strictly to the verified measurements in context.
6. If discussing respiratory protection, say that a well-fitting, certified particulate respirator may reduce exposure; do not promise complete protection or prescribe one for an individual.
7. Always maintain an encouraging, constructive tone that empowers users to protect their families.
"""


def is_gemini_active() -> bool:
    key = (settings.GEMINI_API_KEY or "").strip()
    return bool(key) and not key.startswith("your_") and key != "PLACEHOLDER"


def generate_expert_fallback(req: ChatRequest) -> str:
    """
    Expert rule-based fallback assistant when Gemini API key is not configured or offline.
    Provides structured, contextual guidance matching user query and AQI levels.
    """
    q = req.message.lower()
    city = req.city or "your area"
    aqi = req.aqi
    pm25 = req.pm2_5
    category = req.category or (
        "Unavailable" if aqi is None else
        ("Good" if aqi <= 50 else "Satisfactory" if aqi <= 100 else "Moderate" if aqi <= 200 else "Poor" if aqi <= 300 else "Very Poor" if aqi <= 400 else "Severe")
    )
    lifestyle = req.lifestyle or "General"

    context = [f"Location: **{city}**"]
    if aqi is not None:
        context.append(f"CPCB NAQI: **{aqi} ({category})**")
    else:
        context.append("Current air-quality reading: **unavailable**")
    if pm25 is not None:
        context.append(f"PM2.5: **{pm25} µg/m³**")
    intro = "Available context — " + "; ".join(context) + ".\n\n"

    if aqi is None:
        return intro + (
            "I don't have a verified current reading for this location, so I can't assess whether outdoor conditions are safe or recommend a time based on today's pollution. "
            "Check your local official air-quality monitoring service before making exposure decisions. "
            "As general precautions, reduce strenuous activity near traffic, avoid indoor smoke sources, and follow advice from your healthcare professional."
        )

    # 1. Going outside / general outdoor safety
    if any(k in q for k in ["safe to go outside", "go out", "leave house", "step outside"]):
        if aqi <= 50:
            return intro + (
                "**The reported AQI is in the Good category.** Ordinary outdoor activities are generally reasonable at this level, but no AQI guarantees zero exposure or risk.\n\n"
                "• Follow local public-health alerts and any individual advice from your healthcare professional.\n"
                "• Conditions can vary near busy roads and over time."
            )
        elif aqi <= 100:
            return intro + (
                "**The reported AQI is in the Satisfactory category.** Most people can generally follow their usual routine, while unusually sensitive people should monitor how they feel.\n\n"
                "• Keep distance from idling vehicles and busy traffic where feasible.\n"
                "• Follow local public-health alerts and individual medical guidance."
            )
        elif aqi <= 200:
            pm25_guidance = (
                f"• **Why it matters:** PM2.5 is {pm25} µg/m³; fine particles can irritate airways.\n"
                if pm25 is not None
                else "• **Why it matters:** Fine particles can irritate airways, especially during prolonged outdoor exertion.\n"
            )
            return intro + (
                "**Caution is advised for outdoor activities.**\n\n"
                "• **Vulnerability:** With an AQI of " + str(aqi) + " (" + category + "), prolonged outdoor exposure can irritate mucous membranes.\n"
                + pm25_guidance
                + "• **Action Steps:** "
                "1. Consider reducing prolonged or strenuous outdoor activity, especially if you are sensitive to air pollution.\n"
                "2. Avoid busy roads where practical and follow current local public-health advice.\n"
                "3. This reading is not an hourly forecast, so I cannot identify a cleaner time of day."
            )
        elif aqi <= 300:
            return intro + (
                "**Consider limiting prolonged outdoor exposure.**\n\n"
                "• The reported AQI is in the Poor category; individual responses to air pollution vary.\n"
                "• **Action Steps:**\n"
                "1. Keep non-essential trips to a minimum.\n"
                "2. If you choose respiratory protection, use a well-fitting certified particulate respirator according to its instructions.\n"
                "3. In a vehicle, consider closing windows and using recirculation when outdoor pollution is elevated."
            )
        else:
            pm25_guidance = (
                f"• **Measured PM2.5:** {pm25} µg/m³.\n"
                if pm25 is not None
                else "• **PM2.5 measurement:** Not available for this response.\n"
            )
            return intro + (
                "**The reported AQI is very high.** Consider minimizing outdoor exposure and follow local public-health advisories.\n\n"
                "• Individual effects vary; this general guidance is not a personal medical assessment.\n"
                + pm25_guidance
                + "• **Action Steps:**\n"
                "1. Reduce unnecessary outdoor exertion and use a cleaner indoor space where practical.\n"
                "2. If outdoor transit is unavoidable, a well-fitting certified particulate respirator may reduce exposure but cannot eliminate it.\n"
                "3. Follow local health advisories and any individual care plan."
            )

    # 2. Children playing outdoors
    if any(k in q for k in ["children", "kids", "play outdoors", "school"]):
        if aqi <= 100:
            return intro + (
                "**The reported AQI is in a lower category.** Usual outdoor play may be reasonable, subject to current local conditions and any individual care plan.\n\n"
                "• This reading is not an hourly forecast; check local advisories before planning activities."
            )
        else:
            return intro + (
                "**Consider reducing children's prolonged or strenuous outdoor activity while the reported AQI is elevated.**\n\n"
                "• Children may be more affected by air pollution; individual needs vary. This is general guidance, not a medical assessment or hourly forecast.\n"
                "• **Action Steps for Parents:**\n"
                "1. Consider indoor alternatives for strenuous activity.\n"
                "2. Check local public-health and school advisories.\n"
                "3. Follow the child's individual care plan, if applicable."
            )

    # 3. Mask recommendations
    if any(k in q for k in ["mask", "respirator", "n95", "cloth mask"]):
        return intro + (
            "**Mask & Respiratory Protection Guide:**\n\n"
            "• A well-fitting, certified **N95, KN95, or FFP2** particulate respirator may reduce exposure when used as directed.\n"
            "• Fit and consistent use matter. Respirators do not eliminate exposure, and fit or suitability varies by person.\n"
            "• Cloth and surgical masks are not equivalent to certified particulate respirators.\n"
            "• For children or people with health concerns, follow applicable public-health and clinician guidance."
        )

    # 4. Exercise / workout outdoors
    if any(k in q for k in ["exercise", "running", "jogging", "gym", "workout", "cycling"]):
        if aqi <= 100:
            return intro + (
                "**Outdoor activity may be reasonable in this AQI category.**\n\n"
                "• Check current local conditions; this reading is not an hourly forecast.\n"
                "• Choose routes away from busy roads where practical."
            )
        else:
            return intro + (
                "**Consider moving strenuous exercise indoors while the reported AQI is elevated.**\n\n"
                "• Exercise increases breathing, which can increase the amount of polluted air inhaled.\n"
                "• **Alternatives:**\n"
                "1. Consider indoor stretching, resistance exercises, or other activity in a cleaner space.\n"
                "2. Follow local public-health guidance and any individual care plan."
            )

    # 5. Improving indoor air quality
    if any(k in q for k in ["indoor", "purifier", "ventilation", "windows", "home air"]):
        return intro + (
            "**Comprehensive Indoor Air Quality Action Plan:**\n\n"
            "1. **Filtration:** If available, use an appropriately sized mechanical air purifier and follow its maintenance instructions.\n"
            "2. **Ventilation:** This AQI is not an hourly forecast or indoor-air measurement. Check current local outdoor conditions and indoor ventilation needs before opening windows.\n"
            "3. **Smoke sources:** Reduce indoor smoke from incense, mosquito coils, and other combustion sources.\n"
            "4. **Cooking:** Use a vented kitchen exhaust where available when cooking.\n"
            "5. **Cleaning:** Damp wiping or mopping can help avoid stirring settled dust."
        )

    # 6. Reducing personal pollution contribution
    if any(k in q for k in ["reduce pollution", "contribution", "eco", "sustainable", "carbon"]):
        return intro + (
            "**Ways to Choose Lower-Emission Options:**\n\n"
            "1. **Shift Commute Modes:** Consider public transit, cycling, walking, or carpooling where practical. The *Eco Impact Calculator* provides estimates based on its stated assumptions, not measured personal emissions.\n"
            "2. **Zero Waste Burning:** Never burn garden leaves, dry biomass, or plastic garbage. Report neighborhood open burning immediately to local municipal authorities.\n"
            "3. **Vehicle Maintenance:** Keep your vehicle's engine tuned and ensure an active Pollution Under Control (PUC) certificate. Avoid prolonged idling at traffic lights.\n"
            "4. **Construction Dust Suppression:** Wet down sand, soil, and building materials around residential renovation sites to prevent windblown PM10."
        )

    # Default general recommendation
    pm25_summary = f"• **PM2.5:** **{pm25} µg/m³**.\n" if pm25 is not None else ""
    return (
        intro
        + f"**Personalized Guidance for {lifestyle}:**\n\n"
        + f"• **Air Assessment:** Current CPCB NAQI is **{aqi} ({category})**.\n"
        + pm25_summary
        + "• **Key Recommendations:** Consider limiting strenuous activity when pollution is elevated, follow local guidance on exposure precautions, and reduce indoor smoke sources.\n\n"
        + "Check official local monitoring before making time-sensitive outdoor plans."
    )


async def chat_with_assistant(req: ChatRequest) -> ChatResponse:
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    suggested_followups = [
        "What mask is best for PM2.5?",
        "When is the best time to ventilate my home?",
        "Should my children play outdoors today?",
        "What indoor exercise alternatives do you suggest?",
    ]

    # Fast path: If Gemini is not configured, return immediately without network attempt
    if not is_gemini_active():
        reply_text = generate_expert_fallback(req)
        return ChatResponse(
            reply=reply_text,
            is_fallback=True,
            model_used="Urban Air Quality Expert Intelligence (Offline Rule Engine)",
            suggested_followups=suggested_followups,
            timestamp=now_iso,
            disclaimer=MEDICAL_DISCLAIMER,
        )

    # Attempt Gemini API call
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
        context_str = (
            "Air quality context (only values included below are available; do not infer missing measurements):\n"
            f"- City: {req.city or 'Not supplied'}\n"
            f"- CPCB NAQI: {req.aqi if req.aqi is not None else 'Unavailable'}\n"
            f"- Category: {req.category or 'Unavailable'}\n"
            f"- PM2.5: {f'{req.pm2_5} µg/m³' if req.pm2_5 is not None else 'Unavailable'}\n"
            f"- User Lifestyle Persona: {req.lifestyle or 'General'}\n\n"
        )

        contents = []
        if req.history:
            for m in req.history[-6:]:
                role = "user" if m.role == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m.content}]})

        user_message_full = f"{context_str}User Question: {req.message}"
        contents.append({"role": "user", "parts": [{"text": user_message_full}]})

        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "topP": 0.85,
                "maxOutputTokens": 1000,
            },
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers={"x-goog-api-key": settings.GEMINI_API_KEY})
            if resp.status_code == 200:
                data = resp.json()
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                if text:
                    return ChatResponse(
                        reply=text,
                        is_fallback=False,
                        model_used=f"Google Gemini ({settings.GEMINI_MODEL})",
                        suggested_followups=suggested_followups,
                        timestamp=now_iso,
                        disclaimer=MEDICAL_DISCLAIMER,
                    )
    except Exception as exc:
        logger.warning("Gemini request failed; using expert guidance: %s", type(exc).__name__)

    fallback_text = generate_expert_fallback(req)
    return ChatResponse(
        reply=fallback_text,
        is_fallback=True,
        model_used="Urban Air Quality Expert Intelligence (Fallback)",
        suggested_followups=suggested_followups,
        timestamp=now_iso,
        disclaimer=MEDICAL_DISCLAIMER,
    )
