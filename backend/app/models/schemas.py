from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CodeExplanationRequest(BaseModel):
    """
    Validation schema for code explanation requests.
    """
    code_input: str = Field(..., min_length=1, description="The raw code snippet to analyze.")
    language: Optional[str] = Field(None, description="The programming language tag of the code snippet.")

class CodeExplanationResponse(BaseModel):
    """
    Validation schema for code explanation database records returned to the client.
    """
    id: str = Field(..., description="Unique UUID identification of the history log.")
    user_id: str = Field(..., description="Unique user profile UUID.")
    code_input: str = Field(..., description="The original submitted code snippet.")
    ai_response: str = Field(..., description="The generated explanation response formatted as Markdown.")
    language: Optional[str] = Field(None, description="Detected or specified code language.")
    created_at: datetime = Field(..., description="Timestamp of creation.")

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    """
    Validation schema for user authentication profiles.
    """
    id: str = Field(..., description="Unique user identification matching auth.users.")
    email: str = Field(..., description="User registration email address.")
    created_at: datetime = Field(..., description="Timestamp when the user account profile was registered.")

    class Config:
        from_attributes = True

class ErrorDetail(BaseModel):
    """
    Model representing nested details inside an API error response.
    """
    detail: str = Field(..., description="Human-readable descriptive warning.")
    status_code: int = Field(..., description="HTTP status code associated with the error.")
    type: str = Field(..., description="Machine-readable error type identifier.")
    errors: Optional[List[str]] = Field(None, description="Detailed list of specific fields/locations that failed validation.")

class APIErrorResponse(BaseModel):
    """
    Global response container for errors returned by the backend.
    """
    error: ErrorDetail = Field(..., description="Detailed structure of the occurred warning.")
