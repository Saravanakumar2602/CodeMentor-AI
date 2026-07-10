import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize the Supabase Client
try:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.error("Supabase URL or Key is missing from settings. DB connections will fail.")
        supabase_client = None
    else:
        supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Successfully connected to Supabase client.")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    supabase_client = None

def get_user_chat_history(user_id: str) -> list:
    """
    Retrieves all explanation history records for a user, ordered by creation date desc.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Fetching chat history for user: {user_id}")
        response = supabase_client.table("chat_history") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Database select error: {str(e)}")
        raise RuntimeError(f"Database error while fetching history: {str(e)}")

def create_chat_history_entry(user_id: str, code_input: str, ai_response: str, language: str = None) -> dict:
    """
    Inserts a new explanation record into the chat_history table.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Inserting new chat history log for user: {user_id}")
        data = {
            "user_id": user_id,
            "code_input": code_input,
            "ai_response": ai_response,
            "language": language
        }
        response = supabase_client.table("chat_history").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database insert returned an empty response body.")
    except Exception as e:
        logger.error(f"Database insert error: {str(e)}")
        raise RuntimeError(f"Database error while saving history entry: {str(e)}")

def delete_chat_history_entry(user_id: str, entry_id: str) -> bool:
    """
    Deletes a specific history record belonging to the user.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Deleting chat log {entry_id} for user: {user_id}")
        # Enforcing user_id check is a backup validation matching database RLS constraints
        response = supabase_client.table("chat_history") \
            .delete() \
            .eq("id", entry_id) \
            .eq("user_id", user_id) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return True
        return False
    except Exception as e:
        logger.error(f"Database delete error: {str(e)}")
        raise RuntimeError(f"Database error while deleting entry: {str(e)}")

def get_user_code_reviews(user_id: str) -> list:
    """
    Retrieves all code review logs for a user, ordered by creation date desc.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Fetching code reviews for user: {user_id}")
        response = supabase_client.table("code_reviews") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Database select error: {str(e)}")
        raise RuntimeError(f"Database error while fetching code reviews: {str(e)}")

def create_code_review_entry(
    user_id: str,
    code_input: str,
    overall_score: int,
    readability_score: int,
    performance_score: int,
    maintainability_score: int,
    security_score: int,
    summary: str,
    suggestions: list,
    refactored_code: str = None,
    interview_tips: list = [],
    language: str = None
) -> dict:
    """
    Inserts a new code review entry into the code_reviews table.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Inserting new code review log for user: {user_id}")
        data = {
            "user_id": user_id,
            "code_input": code_input,
            "overall_score": overall_score,
            "readability_score": readability_score,
            "performance_score": performance_score,
            "maintainability_score": maintainability_score,
            "security_score": security_score,
            "summary": summary,
            "suggestions": suggestions,
            "refactored_code": refactored_code,
            "interview_tips": interview_tips,
            "language": language
        }
        response = supabase_client.table("code_reviews").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database insert returned an empty response body.")
    except Exception as e:
        logger.error(f"Database insert error: {str(e)}")
        raise RuntimeError(f"Database error while saving code review: {str(e)}")

def delete_code_review_entry(user_id: str, entry_id: str) -> bool:
    """
    Deletes a specific code review record belonging to the user.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Deleting code review log {entry_id} for user: {user_id}")
        response = supabase_client.table("code_reviews") \
            .delete() \
            .eq("id", entry_id) \
            .eq("user_id", user_id) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return True
        return False
    except Exception as e:
        logger.error(f"Database delete error: {str(e)}")
        raise RuntimeError(f"Database error while deleting code review entry: {str(e)}")

def get_user_learning_history(user_id: str) -> list:
    """
    Retrieves all learning path roadmap logs for a user, ordered by creation date desc.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Fetching learning history roadmaps for user: {user_id}")
        response = supabase_client.table("learning_history") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Database select error: {str(e)}")
        raise RuntimeError(f"Database error while fetching learning history: {str(e)}")

def create_learning_history_entry(
    user_id: str,
    code_input: str,
    language: str,
    difficulty_level: str,
    estimated_learning_time: str,
    interview_readiness_score: int,
    mentor_advice: str,
    concepts_detected: list = [],
    prerequisites: list = [],
    knowledge_gaps: list = [],
    recommended_next_topics: list = [],
    practice_plan: list = [],
    suggested_resources: list = []
) -> dict:
    """
    Inserts a new learning roadmap entry into the learning_history table.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Inserting new learning roadmap entry for user: {user_id}")
        data = {
            "user_id": user_id,
            "code_input": code_input,
            "language": language,
            "difficulty_level": difficulty_level,
            "estimated_learning_time": estimated_learning_time,
            "interview_readiness_score": interview_readiness_score,
            "mentor_advice": mentor_advice,
            "concepts_detected": concepts_detected,
            "prerequisites": prerequisites,
            "knowledge_gaps": knowledge_gaps,
            "recommended_next_topics": recommended_next_topics,
            "practice_plan": practice_plan,
            "suggested_resources": suggested_resources
        }
        response = supabase_client.table("learning_history").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database insert returned an empty response body.")
    except Exception as e:
        logger.error(f"Database insert error: {str(e)}")
        raise RuntimeError(f"Database error while saving learning entry: {str(e)}")

def delete_learning_history_entry(user_id: str, entry_id: str) -> bool:
    """
    Deletes a specific learning roadmap record belonging to the user.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Deleting learning roadmap log {entry_id} for user: {user_id}")
        response = supabase_client.table("learning_history") \
            .delete() \
            .eq("id", entry_id) \
            .eq("user_id", user_id) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return True
        return False
    except Exception as e:
        logger.error(f"Database delete error: {str(e)}")
        raise RuntimeError(f"Database error while deleting learning entry: {str(e)}")
