"""Build general exposure guidance adapted to current AQI category and persona."""

from typing import List, Dict, Any
from app.schemas.planner import (
    RoutineRequest,
    RoutineResponse,
    TimeOfDayRoutine,
    RoutineItem,
)


def generate_routine(req: RoutineRequest) -> RoutineResponse:
    aqi = req.aqi
    cat = req.category
    persona = req.persona.lower()
    city = req.city
    pm25 = req.pm2_5

    is_severe = aqi > 300
    is_poor = aqi > 200
    is_moderate = aqi > 100

    purifier_guidance = (
        "Use a correctly sized HEPA purifier if available."
        if req.has_air_purifier
        else "Consider a cleaner indoor space; no purifier was reported."
    )

    # 1. Morning Routine
    if is_severe:
        m_risk = "Critical"
        m_items = [
            RoutineItem(
                time_window="06:00 AM - 08:00 AM",
                activity_name="Wake up & Indoor Hydration",
                action_guidance="Keep exterior windows closed when outdoor pollution is elevated. Run a correctly sized HEPA purifier if available.",
                pollution_risk_level="Critical",
                expected_benefit="Reduces time spent outdoors when the current AQI is very high.",
                transport_or_gear_tips=purifier_guidance,
            ),
            RoutineItem(
                time_window="08:00 AM - 10:00 AM",
                activity_name="Commute / School Transit",
                action_guidance="Prefer enclosed transit over prolonged outdoor exposure. Consider a well-fitting certified respirator if outdoor travel is unavoidable.",
                pollution_risk_level="Critical",
                expected_benefit="May reduce time spent in outdoor traffic pollution.",
                transport_or_gear_tips="Prefer enclosed public transit; consider a well-fitting certified respirator for unavoidable outdoor exposure.",
            ),
        ]
    elif is_poor:
        m_risk = "High"
        m_items = [
            RoutineItem(
                time_window="06:30 AM - 08:30 AM",
                activity_name="Indoor Wake-up & Light Movement",
                action_guidance="Consider postponing strenuous outdoor activity. Substitute with gentle indoor movement when practical.",
                pollution_risk_level="High",
                expected_benefit="Reduces time spent in outdoor air during a period when pollution may be elevated.",
                transport_or_gear_tips=purifier_guidance,
            ),
            RoutineItem(
                time_window="08:30 AM - 10:00 AM",
                activity_name="Commute to Work / Class",
                action_guidance="Prefer enclosed public transit. Consider a well-fitting certified respirator when outdoor exposure cannot be avoided.",
                pollution_risk_level="High",
                expected_benefit="Reduces direct inhalation of toxic nitrogen dioxide (NO2) and diesel soot at traffic signals.",
                transport_or_gear_tips="If using a respirator, follow product fit and use instructions.",
            ),
        ]
    else:
        m_risk = "Moderate" if is_moderate else "Low"
        m_items = [
            RoutineItem(
                time_window="07:00 AM - 08:30 AM",
                activity_name="Morning Exercise / Walk",
                action_guidance="Light outdoor activity may be reasonable in this AQI category. Choose routes away from busy roads and follow local alerts.",
                pollution_risk_level=m_risk,
                expected_benefit="Supports activity planning while taking the current AQI category into account.",
                transport_or_gear_tips="Follow local health advisories; individual needs vary.",
            ),
            RoutineItem(
                time_window="08:30 AM - 09:30 AM",
                activity_name="Morning Transit",
                action_guidance="Walking or cycling may be reasonable in this AQI category. Sensitive individuals should follow local health guidance.",
                pollution_risk_level=m_risk,
                expected_benefit="Lowers carbon footprint while enjoying physical commute.",
                transport_or_gear_tips="Bicycle or public transit.",
            ),
        ]

    # 2. Afternoon Routine
    if is_severe:
        a_risk = "High"
        a_items = [
            RoutineItem(
                time_window="12:30 PM - 02:00 PM",
                activity_name="Lunch & Rest Indoors",
                action_guidance="Remain in a cleaner indoor space where practical. Follow local public-health guidance about ventilation.",
                pollution_risk_level="High",
                expected_benefit="Limits unnecessary outdoor exposure while the AQI is very high.",
                transport_or_gear_tips="Indoor dining.",
            ),
            RoutineItem(
                time_window="02:00 PM - 03:30 PM",
                activity_name="Indoor Air Check",
                action_guidance="Keep windows closed while outdoor AQI remains very high. Use filtration if available and follow official guidance on indoor ventilation.",
                pollution_risk_level="High",
                expected_benefit="Avoids unnecessary outdoor-pollution entry while maintaining awareness of indoor air needs.",
                transport_or_gear_tips="Do not treat this general plan as a substitute for indoor air monitoring.",
            ),
        ]
    elif is_poor:
        a_risk = "Moderate"
        a_items = [
            RoutineItem(
                time_window="12:00 PM - 02:30 PM",
                activity_name="Check Before Ventilating",
                action_guidance="This plan cannot identify a safe hourly window. Check a current local outdoor reading and official advice before opening windows.",
                pollution_risk_level="High",
                expected_benefit="Avoids assuming that a fixed time is cleaner than the current outdoor conditions.",
                transport_or_gear_tips="Use filtration if available; consider indoor air needs as well as outdoor AQI.",
            ),
            RoutineItem(
                time_window="02:30 PM - 04:00 PM",
                activity_name="Plan Essential Outdoor Errands",
                action_guidance="Use updated local air-quality information before scheduling an outdoor errand; this routine is not an hourly forecast.",
                pollution_risk_level="Moderate",
                expected_benefit="Helps avoid relying on a fixed time window when pollution conditions change.",
                transport_or_gear_tips="Reduce time near busy roads where practical.",
            ),
        ]
    else:
        a_risk = "Low"
        a_items = [
            RoutineItem(
                time_window="12:00 PM - 03:00 PM",
                activity_name="Open Ventilation & Outdoor Movement",
                action_guidance="Outdoor activity and ventilation may be reasonable in this AQI category. Recheck local alerts and conditions before making plans.",
                pollution_risk_level="Low",
                expected_benefit="Can bring in outdoor air when current local conditions are suitable.",
                transport_or_gear_tips="Check current local conditions before ventilating.",
            ),
        ]

    # 3. Evening Routine
    if is_poor or is_severe:
        e_risk = "Critical" if is_severe else "High"
        e_items = [
            RoutineItem(
                time_window="05:30 PM - 07:30 PM",
                activity_name="Evening Return Commute",
                action_guidance="When outdoor pollution is elevated, keep vehicle windows closed and use recirculation if available.",
                pollution_risk_level=e_risk,
                expected_benefit="Can reduce direct exposure to traffic-related pollution.",
                transport_or_gear_tips="Metro, train, or closed vehicle with cabin air filter.",
            ),
            RoutineItem(
                time_window="07:30 PM - 09:00 PM",
                activity_name="Family Dinner & Home Air Sealing",
                action_guidance="Close exterior windows while outdoor AQI remains elevated. Use a vented kitchen exhaust when cooking, if available.",
                pollution_risk_level=e_risk,
                expected_benefit="Reduces outdoor pollution entering the home when outdoor conditions are poor.",
                transport_or_gear_tips="Kitchen exhaust active during cooking.",
            ),
        ]
    else:
        e_risk = "Moderate" if is_moderate else "Low"
        e_items = [
            RoutineItem(
                time_window="05:30 PM - 07:30 PM",
                activity_name="Evening Sports / Outdoor Recreation",
                action_guidance="Outdoor play may be reasonable in this AQI category. Check current local conditions, especially near traffic.",
                pollution_risk_level=e_risk,
                expected_benefit="Promotes cardiovascular fitness and family outdoor time.",
                transport_or_gear_tips="Sportswear.",
            ),
        ]

    # 4. Night Routine (9:00 PM - 6:00 AM)
    n_items = [
        RoutineItem(
            time_window="09:30 PM - 10:30 PM",
            activity_name="Bedroom Clean Air Preparation",
            action_guidance=f"Wipe bedroom surfaces with a damp cloth rather than dry sweeping. {purifier_guidance}",
            pollution_risk_level="High" if is_poor else "Low",
            expected_benefit="Helps reduce settled dust and supports a cleaner indoor environment.",
            transport_or_gear_tips=purifier_guidance,
        ),
        RoutineItem(
            time_window="10:30 PM - 06:00 AM",
            activity_name="Restful Sleep in Purified Environment",
            action_guidance="When outdoor pollution is elevated, close exterior windows. Avoid burning mosquito coils or incense indoors.",
            pollution_risk_level="High" if is_poor else "Low",
            expected_benefit="Avoids adding smoke and fragrance sources to indoor air.",
            transport_or_gear_tips=purifier_guidance,
        ),
    ]

    # Persona-specific overrides & extra advice
    if "parent" in persona:
        family_precautions = [
            "Use the current AQI and local advisories when planning children's outdoor activities; this plan does not forecast hourly pollution.",
            "Request school management to replace outdoor assembly with indoor classroom briefings on high AQI days.",
            "Pack an insulated water bottle for school to keep mucous membranes hydrated.",
            "For a child with an individual care plan, follow it and check school arrangements with their caregiver or clinician.",
        ]
    elif "senior" in persona:
        family_precautions = [
            "People with heart or lung conditions should follow their individual care plan and local air-quality advisories.",
            "Choose indoor activity when local air-quality advisories recommend limiting outdoor exertion.",
            "Follow any personal care plan and exposure guidance provided by the person's clinician.",
            "Choose indoor activity when local air-quality advisories recommend limiting outdoor exertion.",
        ]
    elif "fitness" in persona:
        family_precautions = [
            "At higher AQI levels, vigorous exercise can increase the amount of polluted air inhaled; consider lower-exposure indoor alternatives.",
            "Substitute running with indoor treadmill sessions, indoor rower, resistance band circuits, or yoga.",
            "If working out in an indoor gym, ensure the gym operates commercial-grade particulate air filtration.",
            "Follow local public-health alerts when planning outdoor training.",
        ]
    elif "outdoor" in persona:
        family_precautions = [
            "Follow workplace respiratory-protection requirements and the respirator manufacturer's fit and replacement instructions.",
            "Use designated breaks in a cleaner indoor area when available.",
            "Wash exposed skin after an outdoor shift.",
            "Wear wraparound safety glasses to prevent particulate eye irritation and conjunctivitis.",
        ]
    else:
        family_precautions = [
            "Schedule commute via public transit or carpooling with windows firmly closed.",
            "Check local health guidance for appropriate exposure precautions.",
            "Encourage employer to allow work-from-home (WFH) on 'Very Poor' or 'Severe' emergency days.",
            "Ensure office ventilation has MERV-13 or HEPA filtration filters installed.",
        ]

    exercise_alternatives = [
        "Indoor yoga or mobility exercises in a well-ventilated, cleaner indoor space",
        "Bodyweight exercises such as pushups, squats, lunges, and planks",
        "Resistance Band / Dumbbell conditioning for full-body strength",
        "Indoor stair climbing when the space is suitable for exercise",
    ]

    commute_recs = [
        "Consider public transit or carpooling to reduce private vehicle use.",
        "When driving, use the vehicle's recirculation setting if outdoor pollution is elevated.",
        "Avoid traveling directly behind heavy commercial trucks and older diesel buses without particulate filters.",
    ]

    vent_guide = (
        "This routine does not include an hourly outdoor forecast or indoor air measurement. "
        "Check current local conditions and official guidance before ventilating; avoid relying on a fixed time window."
    )

    caution = (
        "This plan uses the current modelled AQI category and general timing heuristics; it is not an hourly forecast or station-specific reading. "
        "Recheck current local readings and official advisories before time-sensitive outdoor plans."
    )

    return RoutineResponse(
        persona=req.persona,
        city=city,
        aqi=aqi,
        category=cat,
        summary_assessment=f"General daily routine for {req.persona} in {city}, adapted to the current {cat} CPCB NAQI category ({aqi}) and PM2.5 ({pm25} µg/m³).",
        morning=TimeOfDayRoutine(title="Morning Routine", optimal_time_slot="General suggested window (not a forecast)", items=m_items),
        afternoon=TimeOfDayRoutine(title="Afternoon Routine", optimal_time_slot="General suggested window (not a forecast)", items=a_items),
        evening=TimeOfDayRoutine(title="Evening Routine", optimal_time_slot="General suggested window (not a forecast)", items=e_items),
        night=TimeOfDayRoutine(title="Night Routine", optimal_time_slot="General suggested window (not a forecast)", items=n_items),
        exercise_alternatives=exercise_alternatives,
        commute_recommendations=commute_recs,
        ventilation_guide=vent_guide,
        family_and_school_precautions=family_precautions,
        caution_notice=caution,
    )

