from typing import List
from fastapi import APIRouter, Request, HTTPException
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.gemini_service import chat_with_assistant
from app.utils.rate_limiter import limiter
from app.config import settings

router = APIRouter(prefix="/ai", tags=["AI Smart Pollution Assistant"])

SUGGESTED_QUESTIONS = [
    {
        "id": "q1",
        "question": "Is it safe to go outside right now?",
        "category": "Immediate Safety",
    },
    {
        "id": "q2",
        "question": "When should my children play outdoors today?",
        "category": "Family & Children",
    },
    {
        "id": "q3",
        "question": "What mask should I use during severe winter smog?",
        "category": "Respiratory Protection",
    },
    {
        "id": "q4",
        "question": "Should I exercise outdoors today or workout inside?",
        "category": "Fitness & Exercise",
    },
    {
        "id": "q5",
        "question": "How can I improve my indoor bedroom air quality?",
        "category": "Indoor Safety",
    },
    {
        "id": "q6",
        "question": "How does PM2.5 affect senior citizens with heart conditions?",
        "category": "Vulnerable Groups",
    },
    {
        "id": "q7",
        "question": "What can I do today to reduce my personal pollution footprint?",
        "category": "Sustainability",
    },
]


@router.post("/chat", response_model=ChatResponse)
@limiter.limit(settings.AI_RATE_LIMIT)
async def chat_endpoint(request: Request, payload: ChatRequest):
    """
    Intelligent conversational endpoint powered by Google Gemini API
    with fallback to expert environmental intelligence.
    """
    try:
        response = await chat_with_assistant(payload)
        return response
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="The AI assistant is temporarily unavailable. Please try again shortly.",
        )


@router.get("/suggested-questions")
async def get_suggested_questions():
    """Retrieve curated prompt suggestions for common smog and health concerns."""
    return SUGGESTED_QUESTIONS

