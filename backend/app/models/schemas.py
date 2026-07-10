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

class CodeReviewRequest(BaseModel):
    """
    Validation schema for code review requests.
    """
    code_input: str = Field(..., min_length=1, description="The raw code snippet to review.")
    language: Optional[str] = Field(None, description="The programming language tag of the code snippet.")

class CodeReviewResponse(BaseModel):
    """
    Validation schema for code review database records returned to the client.
    """
    id: str = Field(..., description="Unique UUID identification of the review log.")
    user_id: str = Field(..., description="Unique user profile UUID.")
    code_input: str = Field(..., description="The original submitted code snippet.")
    overall_score: int = Field(..., ge=0, le=100, description="Overall score rating out of 100.")
    readability_score: int = Field(..., ge=0, le=100, description="Readability score rating.")
    performance_score: int = Field(..., ge=0, le=100, description="Performance score rating.")
    maintainability_score: int = Field(..., ge=0, le=100, description="Maintainability score rating.")
    security_score: int = Field(..., ge=0, le=100, description="Security score rating.")
    summary: str = Field(..., description="Summary of the code review.")
    suggestions: List[str] = Field(default=[], description="List of improvement suggestions.")
    refactored_code: Optional[str] = Field(None, description="Optional refactored version of the code.")
    interview_tips: List[str] = Field(default=[], description="List of related interview tips.")
    language: Optional[str] = Field(None, description="Detected or specified code language.")
    created_at: datetime = Field(..., description="Timestamp of creation.")

    class Config:
        from_attributes = True

class CodeLearningPathRequest(BaseModel):
    """
    Validation schema for code learning path roadmap requests.
    """
    code_input: str = Field(..., min_length=1, description="The raw code snippet to analyze.")
    language: Optional[str] = Field(None, description="The programming language tag of the code snippet.")

class CodeLearningPathResponse(BaseModel):
    """
    Validation schema for code learning roadmaps database records returned to the client.
    """
    id: str = Field(..., description="Unique UUID identification of the learning log.")
    user_id: str = Field(..., description="Unique user profile UUID.")
    code_input: str = Field(..., description="The original submitted code snippet.")
    language: Optional[str] = Field(None, description="The programming language tag.")
    difficulty_level: str = Field(..., description="The difficulty level rating (e.g. Intermediate).")
    estimated_learning_time: str = Field(..., description="Estimated learning time frame recommendation.")
    interview_readiness_score: int = Field(..., ge=0, le=100, description="Readiness score rating.")
    mentor_advice: str = Field(..., description="Mentoring advice text.")
    concepts_detected: List[str] = Field(default=[], description="Detected concepts list.")
    prerequisites: List[str] = Field(default=[], description="Prerequisites list.")
    knowledge_gaps: List[str] = Field(default=[], description="Knowledge gaps list.")
    recommended_next_topics: List[str] = Field(default=[], description="Recommended next topics list.")
    practice_plan: List[str] = Field(default=[], description="Structured personalized practice items.")
    suggested_resources: List[str] = Field(default=[], description="Recommended study links and reference materials.")
    created_at: datetime = Field(..., description="Timestamp of creation.")

    class Config:
        from_attributes = True
