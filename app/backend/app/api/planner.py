from fastapi import APIRouter
from app.schemas.planner import RoutineRequest, RoutineResponse
from app.services.planner_service import generate_routine

router = APIRouter(prefix="/planner", tags=["Smart Daily Routine Planner"])


@router.post("/generate", response_model=RoutineResponse)
async def generate_schedule(payload: RoutineRequest) -> RoutineResponse:
    """
    Generate personalized 24-hour routine and precautions adapted to
    pollution conditions and user lifestyle persona.
    """
    return generate_routine(payload)

