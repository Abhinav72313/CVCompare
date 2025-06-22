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


