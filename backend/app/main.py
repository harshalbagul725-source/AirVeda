import datetime
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.utils.rate_limiter import limiter
from app.api import aqi, ai, planner, calculator, indoor, community

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AirVeda API",
    description="AirVeda REST API for air quality insights, AI health guidance, routine planning, and eco calculations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate limiter to state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration - strictly using allowed origins from configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    max_age=600,
)


# Security Headers & Request Limit Middleware
@app.middleware("http")
async def security_and_size_middleware(request: Request, call_next):
    # Enforce 1MB request body limit
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1_048_576:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"status": "error", "message": "Request payload exceeds 1MB limit.", "code": 413},
                )
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": "error", "message": "Invalid Content-Length header.", "code": 400},
            )

    try:
        response = await call_next(request)
    except Exception:
        # Centralized error handler avoiding stack trace leak
        logger.exception("Unhandled request error")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "message": "An unexpected error occurred while processing your request. Please try again.",
                "code": 500,
            },
        )

    # Attach protective security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "img-src 'self' data:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; "
        "object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    )
    
    return response


# Include Routers under /api prefix
app.include_router(aqi.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
app.include_router(calculator.router, prefix="/api")
app.include_router(indoor.router, prefix="/api")
app.include_router(community.router, prefix="/api")


@app.get("/api/health", tags=["System Health"])
async def health_check():
    """System health check and diagnostic status."""
    return {
        "status": "healthy",
        "service": "AirVeda API",
        "environment": settings.ENVIRONMENT,
        "ai_provider": f"Google Gemini ({settings.GEMINI_MODEL})" if settings.GEMINI_API_KEY else "Expert Fallback Engine",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "standards_supported": ["CPCB NAQI 2014", "US EPA 2024 PM2.5"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

