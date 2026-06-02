from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CodeExplanationRequest(BaseModel):
    """
    Request model for explaining code.
    """
    code_input: str = Field(..., min_length=1, description="The code block paste to explain.")
    language: Optional[str] = Field(None, description="The programming language of the code (optional).")

class CodeExplanationResponse(BaseModel):
    """
    Response model for code explanation containing database record details.
    """
    id: str
    user_id: str
    code_input: str
    ai_response: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    """
    Response model containing user profiles linked from Supabase.
    """
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
