import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.schemas import (
    PracticeGenerationRequest,
    PracticeQuestionResponse,
    PracticeSubmissionRequest,
    PracticeAttemptResponse,
    PracticeStatisticsResponse
)
from app.core.security import get_current_user
from app.services.ai import (
    generate_personalized_practice,
    evaluate_practice_submission
)
from app.services.supabase import (
    create_practice_question_entry,
    get_practice_question,
    create_practice_attempt_entry,
    get_user_practice_statistics,
    get_user_practice_attempts,
    update_user_practice_statistics
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("", response_model=PracticeQuestionResponse, status_code=status.HTTP_201_CREATED)
def generate_question(
    request: PracticeGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a personalized programming practice question based on user history,
    difficulty level, programming language, topic, and optional company focus.
    Saves and returns the question details.
    """
    logger.info(f"Received practice question generation request from user: {current_user['id']}")
    
    try:
        # Step 1: Call AI model to generate question details
        question_data = generate_personalized_practice(
            user_id=current_user["id"],
            topic=request.topic,
            difficulty=request.difficulty_level,
            language=request.programming_language,
            question_type=request.question_type,
            company=request.company
        )
        
        # Inject the parameter variables for storage consistency
        question_data["topic"] = request.topic
        question_data["difficulty_level"] = request.difficulty_level
        question_data["programming_language"] = request.programming_language
        question_data["question_type"] = request.question_type
        question_data["company"] = request.company
        
        # Step 2: Save metadata to Supabase DB
        new_question = create_practice_question_entry(
            user_id=current_user["id"],
            question_data=question_data
        )
        
        if not new_question:
            logger.error("DB insert completed but returned empty question payload.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database operation failed to record generated question."
            )
            
        logger.info(f"Successfully created practice question ID: {new_question['id']}")
        return new_question
        
    except RuntimeError as err:
        logger.error(f"Execution error in practice generation route: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected error in practice generation route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.post("/submit", response_model=PracticeAttemptResponse, status_code=status.HTTP_201_CREATED)
def submit_answer(
    request: PracticeSubmissionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submits a user's answer for evaluation.
    Calls AI to evaluate correctness, logic, readability, complexity, etc.,
    saves the attempt log, updates user statistics, and returns evaluation.
    """
    logger.info(f"Received answer submission from user {current_user['id']} for question {request.question_id}")
    
    try:
        # Step 1: Retrieve question context
        question = get_practice_question(request.question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The requested question context does not exist."
            )
            
        # Step 2: Call AI model to evaluate user answer
        evaluation = evaluate_practice_submission(
            question_data=question,
            user_answer=request.user_answer
        )
        
        is_correct = evaluation.get("is_correct", False)
        
        # Step 3: Record attempt in DB
        new_attempt = create_practice_attempt_entry(
            user_id=current_user["id"],
            question_id=request.question_id,
            user_answer=request.user_answer,
            is_correct=is_correct,
            hints_used=request.hints_used,
            evaluation=evaluation
        )
        
        # Step 4: Update user statistics dashboard
        update_user_practice_statistics(
            user_id=current_user["id"],
            is_correct=is_correct,
            hints_used=request.hints_used,
            practice_time_seconds=request.practice_time_seconds,
            topic=question["topic"]
        )
        
        logger.info(f"Logged practice attempt {new_attempt['id']} for user {current_user['id']}")
        return new_attempt
        
    except HTTPException:
        raise
    except RuntimeError as err:
        logger.error(f"Execution error in practice submission route: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected error in practice submission route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/statistics", response_model=PracticeStatisticsResponse)
def get_statistics(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the aggregated practice statistics for the authenticated user.
    """
    logger.info(f"Retrieving practice statistics for user: {current_user['id']}")
    try:
        stats = get_user_practice_statistics(user_id=current_user["id"])
        return stats
    except RuntimeError as err:
        logger.error(f"Runtime error fetching practice stats: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected exception in GET statistics route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/attempts", response_model=List[PracticeAttemptResponse])
def get_attempts(current_user: dict = Depends(get_current_user)):
    """
    Retrieves all past practice attempts for the authenticated user.
    """
    logger.info(f"Retrieving practice attempts for user: {current_user['id']}")
    try:
        attempts = get_user_practice_attempts(user_id=current_user["id"])
        return attempts
    except RuntimeError as err:
        logger.error(f"Runtime error fetching practice attempts: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected exception in GET attempts route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
