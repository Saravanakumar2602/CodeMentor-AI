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

def get_user_practice_statistics(user_id: str) -> dict:
    """
    Retrieves or initializes the practice statistics record for a user.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Fetching practice statistics for user: {user_id}")
        response = supabase_client.table("practice_statistics") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        # Initialize stats if not present
        logger.info(f"No practice statistics found, initializing for user: {user_id}")
        init_data = {
            "user_id": user_id,
            "attempts_count": 0,
            "correct_attempts_count": 0,
            "streak": 0,
            "last_practice_date": None,
            "weak_topics": [],
            "practice_time_seconds": 0
        }
        insert_response = supabase_client.table("practice_statistics").insert(init_data).execute()
        if insert_response.data and len(insert_response.data) > 0:
            return insert_response.data[0]
        return init_data
    except Exception as e:
        logger.error(f"Database select/insert error in practice_statistics: {str(e)}")
        raise RuntimeError(f"Database error while fetching statistics: {str(e)}")

def get_user_practice_attempts(user_id: str) -> list:
    """
    Retrieves all practice attempts for a user, ordered by creation date desc.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Fetching practice attempts for user: {user_id}")
        response = supabase_client.table("practice_attempts") \
            .select("*, question:practice_questions(*)") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Database select error in practice_attempts: {str(e)}")
        raise RuntimeError(f"Database error while fetching attempts: {str(e)}")

def create_practice_question_entry(user_id: str, question_data: dict) -> dict:
    """
    Inserts a new practice question into the practice_questions table.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Inserting new practice question for user: {user_id}")
        data = {
            "user_id": user_id,
            "question_type": question_data["question_type"],
            "topic": question_data["topic"],
            "difficulty_level": question_data["difficulty_level"],
            "company": question_data.get("company"),
            "programming_language": question_data["programming_language"],
            "title": question_data["title"],
            "description": question_data["description"],
            "code_context": question_data.get("code_context"),
            "options": question_data.get("options", []),
            "correct_answer": question_data["correct_answer"],
            "hints": question_data.get("hints", [])
        }
        response = supabase_client.table("practice_questions").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database insert returned an empty response body.")
    except Exception as e:
        logger.error(f"Database insert error in practice_questions: {str(e)}")
        raise RuntimeError(f"Database error while saving practice question: {str(e)}")

def get_practice_question(question_id: str) -> dict:
    """
    Retrieves a single practice question by ID.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Fetching practice question: {question_id}")
        response = supabase_client.table("practice_questions") \
            .select("*") \
            .eq("id", question_id) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError(f"Practice question with ID {question_id} not found.")
    except Exception as e:
        logger.error(f"Database select error in practice_questions: {str(e)}")
        raise RuntimeError(f"Database error while fetching question: {str(e)}")

def create_practice_attempt_entry(
    user_id: str,
    question_id: str,
    user_answer: str,
    is_correct: bool,
    hints_used: int,
    evaluation: dict
) -> dict:
    """
    Inserts a new practice attempt into the practice_attempts table.
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        logger.info(f"Inserting new practice attempt for user: {user_id}, question: {question_id}")
        data = {
            "user_id": user_id,
            "question_id": question_id,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "hints_used": hints_used,
            "evaluation": evaluation
        }
        response = supabase_client.table("practice_attempts").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database insert returned an empty response body.")
    except Exception as e:
        logger.error(f"Database insert error in practice_attempts: {str(e)}")
        raise RuntimeError(f"Database error while saving practice attempt: {str(e)}")

def update_user_practice_statistics(
    user_id: str,
    is_correct: bool,
    hints_used: int,
    practice_time_seconds: int,
    topic: str
) -> dict:
    """
    Updates a user's practice statistics (attempts, accuracy, streak, weak topics, and practice time).
    """
    if not supabase_client:
        raise RuntimeError("Supabase client is not initialized.")
        
    try:
        from datetime import datetime, timezone
        
        # 1. Fetch current statistics
        stats = get_user_practice_statistics(user_id)
        
        # 2. Update basic fields
        attempts_count = stats.get("attempts_count", 0) + 1
        correct_attempts_count = stats.get("correct_attempts_count", 0)
        if is_correct:
            correct_attempts_count += 1
            
        practice_time_seconds = stats.get("practice_time_seconds", 0) + practice_time_seconds
        
        # 3. Update Streak
        now = datetime.now(timezone.utc)
        today = now.date()
        streak = stats.get("streak", 0)
        last_practice_str = stats.get("last_practice_date")
        
        if last_practice_str:
            try:
                # Normalize Z to ISO format python can parse
                last_date = datetime.fromisoformat(last_practice_str.replace("Z", "+00:00")).date()
                delta = today - last_date
                if delta.days == 1:
                    # Practiced yesterday, increment
                    streak += 1
                elif delta.days > 1:
                    # Streak broken, reset to 1
                    streak = 1
                # If delta.days == 0, streak remains unchanged (already practiced today)
            except Exception as parse_err:
                logger.warning(f"Could not parse last_practice_date '{last_practice_str}': {str(parse_err)}")
                streak = 1
        else:
            streak = 1
            
        # 4. Fetch past attempts with topics to recalculate weak topics
        weak_topics = []
        try:
            # We want to retrieve details of past attempts to calculate per-topic accuracy
            attempts_response = supabase_client.table("practice_attempts") \
                .select("is_correct, question:practice_questions(topic)") \
                .eq("user_id", user_id) \
                .execute()
            
            # Group attempts by topic
            topic_stats = {}
            # Include the current attempt in the calculation
            topic_stats[topic] = {"total": 1, "correct": 1 if is_correct else 0}
            
            if attempts_response.data:
                for att in attempts_response.data:
                    q_data = att.get("question")
                    if q_data and "topic" in q_data:
                        t = q_data["topic"]
                        if t not in topic_stats:
                            topic_stats[t] = {"total": 0, "correct": 0}
                        topic_stats[t]["total"] += 1
                        if att.get("is_correct", False):
                            topic_stats[t]["correct"] += 1
            
            # Determine weak topics: accuracy < 60% with at least 2 attempts
            for t, val in topic_stats.items():
                total = val["total"]
                if total >= 2:
                    acc = val["correct"] / total
                    if acc < 0.6:
                        weak_topics.append(t)
        except Exception as stats_err:
            logger.error(f"Error calculating weak topics: {str(stats_err)}")
            # Fallback to existing weak topics if we fail to compute them dynamically
            weak_topics = stats.get("weak_topics", [])
            
        # 5. Save statistics to Supabase
        update_data = {
            "attempts_count": attempts_count,
            "correct_attempts_count": correct_attempts_count,
            "streak": streak,
            "last_practice_date": now.isoformat(),
            "weak_topics": weak_topics,
            "practice_time_seconds": practice_time_seconds,
            "updated_at": now.isoformat()
        }
        
        response = supabase_client.table("practice_statistics") \
            .update(update_data) \
            .eq("user_id", user_id) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database update returned an empty response body.")
            
    except Exception as e:
        logger.error(f"Database update error in practice_statistics: {str(e)}")
        raise RuntimeError(f"Database error while updating statistics: {str(e)}")

