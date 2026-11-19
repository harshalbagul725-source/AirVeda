from fastapi import APIRouter
from app.schemas.calculator import EcoImpactRequest, EcoImpactResponse
from app.services.eco_calculator import calculate_eco_impact

router = APIRouter(prefix="/calculator", tags=["Eco Impact Calculator"])


@router.post("/eco-impact", response_model=EcoImpactResponse)
async def calculate_impact_endpoint(payload: EcoImpactRequest) -> EcoImpactResponse:
    """
    Calculate carbon emissions avoided, equivalent trees planted,
    and fuel expenses saved when choosing lower-emission commutes.
    """
    return calculate_eco_impact(payload)

