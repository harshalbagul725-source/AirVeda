from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class Message(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=4000)

    model_config = ConfigDict(extra="forbid")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1500)
    history: List[Message] = Field(default_factory=list, max_length=20)
    city: Optional[str] = Field(default="Nagpur", max_length=100)
    aqi: Optional[int] = Field(default=None, ge=0, le=500)
    category: Optional[str] = Field(default=None, max_length=40)
    pm2_5: Optional[float] = Field(default=None, ge=0, le=2000)
    lifestyle: Optional[str] = Field(default="General", max_length=60)

    model_config = ConfigDict(extra="forbid")


class ChatResponse(BaseModel):
    reply: str
    is_fallback: bool = False
    model_used: str
    suggested_followups: List[str] = Field(default_factory=list)
    timestamp: str
    disclaimer: str

