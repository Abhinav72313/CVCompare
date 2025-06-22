from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field, BaseModel
from beanie import Document

class ChatMessage(Document):
    user_id: str = Field(..., description="Clerk user ID", index=True)
    resume_hash: str = Field(..., description="Resume file hash")
    jd_hash: str = Field(..., description="Job description hash")
    message: str = Field(..., description="Content of the chat message")
    role: str = Field(..., description="Role of the sender ('user' or 'assistant')")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chat_messages"
        indexes = [
            [("user_id", 1), ("resume_hash", 1), ("jd_hash", 1), ("created_at", 1)]
        ]

