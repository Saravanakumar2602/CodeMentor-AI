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
