import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.schemas import CodeLearningPathRequest, CodeLearningPathResponse
from app.core.security import get_current_user
from app.services.ai import generate_learning_roadmap
from app.services.supabase import (
    create_learning_history_entry,
    get_user_learning_history,
    delete_learning_history_entry
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("", response_model=CodeLearningPathResponse, status_code=status.HTTP_201_CREATED)
def post_learning_path(
    request: CodeLearningPathRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers personalized programming mentor analysis on a snippet using AI Nemotron,
    logs results securely inside the learning_history table, and returns the response roadmap.
    """
    logger.info(f"Received learning path request from user: {current_user['id']}")
    
    try:
        # Step 1: Query the AI personal mentor service
        roadmap_data = generate_learning_roadmap(
            code_input=request.code_input,
            language=request.language
        )
        
        # Step 2: Save to Supabase Database
        new_entry = create_learning_history_entry(
            user_id=current_user["id"],
            code_input=request.code_input,
            language=request.language,
            difficulty_level=roadmap_data["difficulty_level"],
            estimated_learning_time=roadmap_data["estimated_learning_time"],
            interview_readiness_score=roadmap_data["interview_readiness_score"],
            mentor_advice=roadmap_data["mentor_advice"],
            concepts_detected=roadmap_data["concepts_detected"],
            prerequisites=roadmap_data["prerequisites"],
            knowledge_gaps=roadmap_data["knowledge_gaps"],
            recommended_next_topics=roadmap_data["recommended_next_topics"],
            practice_plan=roadmap_data["practice_plan"],
            suggested_resources=roadmap_data["suggested_resources"]
        )
        
        if not new_entry:
            logger.error("Database insert completed but did not return a valid learning record payload.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database operation failed to return the logged record."
            )
            
        logger.info(f"Personal learning path successfully generated and logged. Record ID: {new_entry['id']}")
        return new_entry
        
    except RuntimeError as err:
        logger.error(f"Execution error in learning path route: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected error in learning path route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("", response_model=List[CodeLearningPathResponse])
def get_learning_logs(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the complete learning path logs list for the logged-in user.
    """
    logger.info(f"Retrieving learning history listings for user: {current_user['id']}")
    try:
        logs = get_user_learning_history(user_id=current_user["id"])
        return logs
    except RuntimeError as err:
        logger.error(f"Runtime error fetching learning history: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected database exception in GET learning logs route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_learning_log(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deletes a single learning path record log belonging to the authenticated user.
    """
    logger.info(f"Request to delete learning log ID: {id} from user: {current_user['id']}")
    try:
        deleted = delete_learning_history_entry(user_id=current_user["id"], entry_id=id)
        if not deleted:
            logger.warning(f"Could not find or delete learning record ID: {id} for user: {current_user['id']}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The requested record could not be found or you do not have permission to delete it."
            )
            
        logger.info(f"Successfully deleted learning log ID: {id}")
        return {"status": "deleted", "message": f"Successfully deleted learning path {id}"}
        
    except HTTPException:
        raise
    except RuntimeError as err:
        logger.error(f"Runtime error deleting learning path entry: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected database exception in DELETE learning path route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
