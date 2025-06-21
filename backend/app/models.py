from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field, BaseModel
from beanie import Document

class User(Document):
    clerk_user_id: str = Field(..., description="Clerk user ID", index=True, unique=True)
    email: str = Field(..., description="User email", index=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"

class UserCreate(BaseModel):
    clerk_user_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    last_login: Optional[datetime] = None

class ResumeAnalysis(Document):
    user_id: str = Field(..., description="Clerk user ID", index=True)
    resume_hash: str = Field(..., description="Resume file hash", index=True)
    jd_hash: str = Field(..., description="Job description hash", index=True)
    analysis_result: Dict[str, Any] = Field(..., description="Analysis result")
    resume_filename: str = Field(..., description="Original resume filename")
    job_description: str = Field(..., description="Job description text")
    file_path: Optional[str] = Field(None, description="UploadThing file URL/path")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ats_score: Optional[float] = None
    weights: Optional[Dict[str, float]] = None  # Weights for ATS score calculation
    
    class Settings:
        name = "analyses"
        indexes = [
            [("user_id", 1), ("resume_hash", 1), ("jd_hash", 1)]  # Compound index for efficient lookups
        ]


class QueryResumeAnalysis(BaseModel):
    resume_hash: str
    jd_hash: str
    resume_filename: str
    job_description: str
    file_path: Optional[str] = None
    created_at: datetime 
    ats_score: Optional[float]

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