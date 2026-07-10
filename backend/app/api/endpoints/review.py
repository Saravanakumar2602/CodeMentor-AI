import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.schemas import CodeReviewRequest, CodeReviewResponse
from app.core.security import get_current_user
from app.services.ai import generate_code_review
from app.services.supabase import (
    create_code_review_entry,
    get_user_code_reviews,
    delete_code_review_entry
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("", response_model=CodeReviewResponse, status_code=status.HTTP_201_CREATED)
def post_code_review(
    request: CodeReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers structured code analysis on a snippet using AI Nemotron,
    logs results securely inside the code_reviews table, and returns the response metadata.
    """
    logger.info(f"Received code review request from user: {current_user['id']}")
    
    try:
        # Step 1: Query the AI code review service (returns dict)
        review_data = generate_code_review(
            code_input=request.code_input,
            language=request.language
        )
        
        # Step 2: Save to Supabase Database
        new_entry = create_code_review_entry(
            user_id=current_user["id"],
            code_input=request.code_input,
            overall_score=review_data["overall_score"],
            readability_score=review_data["readability_score"],
            performance_score=review_data["performance_score"],
            maintainability_score=review_data["maintainability_score"],
            security_score=review_data["security_score"],
            summary=review_data["summary"],
            suggestions=review_data["suggestions"],
            refactored_code=review_data["refactored_code"],
            interview_tips=review_data["interview_tips"],
            language=request.language
        )
        
        if not new_entry:
            logger.error("Database insert completed but did not return a valid record payload.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database operation failed to return the logged record."
            )
            
        logger.info(f"Code review successfully completed and logged. Record ID: {new_entry['id']}")
        return new_entry
        
    except RuntimeError as err:
        logger.error(f"Execution error in code review route: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected error in code review route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("", response_model=List[CodeReviewResponse])
def get_reviews(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the complete code reviews history logs list for the logged-in user.
    """
    logger.info(f"Retrieving code reviews history list for user: {current_user['id']}")
    try:
        reviews = get_user_code_reviews(user_id=current_user["id"])
        return reviews
    except RuntimeError as err:
        logger.error(f"Runtime error fetching reviews history: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected database exception in GET reviews route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_review_item(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deletes a single code review record log belonging to the authenticated user.
    """
    logger.info(f"Request to delete code review ID: {id} from user: {current_user['id']}")
    try:
        deleted = delete_code_review_entry(user_id=current_user["id"], entry_id=id)
        if not deleted:
            logger.warning(f"Could not find or delete review record ID: {id} for user: {current_user['id']}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The requested record could not be found or you do not have permission to delete it."
            )
            
        logger.info(f"Successfully deleted code review ID: {id}")
        return {"status": "deleted", "message": f"Successfully deleted code review {id}"}
        
    except HTTPException:
        raise
    except RuntimeError as err:
        logger.error(f"Runtime error deleting code review log: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected database exception in DELETE review route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
