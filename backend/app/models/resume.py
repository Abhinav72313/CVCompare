from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field, BaseModel
from beanie import Document


class ResumeAnalysis(Document):
    user_id: str = Field(..., description="Clerk user ID", index=True)
    resume_hash: str = Field(..., description="Resume file hash", index=True)
    jd_hash: str = Field(..., description="Job description hash", index=True)
    analysis_result: Dict[str, Any] = Field(..., description="Analysis result")
    resume_filename: str = Field(..., description="Original resume filename")
    file_path: Optional[str] = Field(None, description="UploadThing file URL/path")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ats_score: Optional[float] = None
    weights: Optional[Dict[str, float]] = None  # Weights for ATS score calculation
    resume_text: Optional[str] = Field(..., description="Extracted text from the resume")
    job_description: str = Field(..., description="Job description text")

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

