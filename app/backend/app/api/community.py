from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/community", tags=["Community Insights"])


class CommunityChallenge(BaseModel):
    id: str
    title: str
    category: str
    duration_days: int
    difficulty: str
    description: str
    impact_summary: str


COMMUNITY_CHALLENGES: List[CommunityChallenge] = [
    CommunityChallenge(
        id="clean-transit",
        title="Choose a lower-emission commute",
        category="Sustainable Transport",
        duration_days=7,
        difficulty="Moderate",
        description="Replace a car or motorcycle trip with public transit, cycling, walking, or a shared ride when practical.",
        impact_summary="Less fossil-fuel use can reduce transport-related greenhouse-gas emissions. Local air-quality effects depend on many sources.",
    ),
    CommunityChallenge(
        id="clean-indoors",
        title="Reduce indoor smoke sources",
        category="Indoor Health",
        duration_days=7,
        difficulty="Easy",
        description="Avoid burning incense or coils indoors and use an externally vented kitchen exhaust fan while cooking.",
        impact_summary="Source control can reduce indoor smoke exposure; results vary by home, ventilation, and activity.",
    ),
    CommunityChallenge(
        id="idle-free",
        title="Make a pickup zone idle-free",
        category="Civic Action",
        duration_days=7,
        difficulty="Easy",
        description="Turn off your engine when parked and encourage others to avoid idling near homes and schools.",
        impact_summary="Avoiding unnecessary idling reduces fuel use and tailpipe emissions near the vehicle.",
    ),
    CommunityChallenge(
        id="report-burning",
        title="Report open waste burning safely",
        category="Community Watch",
        duration_days=30,
        difficulty="Action-Oriented",
        description="Use your local municipality's official reporting channel to report open burning. Do not approach the fire.",
        impact_summary="Official reports can help local authorities identify and respond to open burning.",
    ),
]


@router.get("/challenges", response_model=List[CommunityChallenge])
async def get_community_challenges() -> List[CommunityChallenge]:
    """Return self-guided community actions; participation and outcomes are not tracked."""
    return COMMUNITY_CHALLENGES
