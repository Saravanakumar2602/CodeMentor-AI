import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import CodeExplanationRequest, CodeExplanationResponse
from app.core.security import get_current_user
from app.services.gemini import generate_code_explanation
from app.services.supabase import create_chat_history_entry

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("", response_model=CodeExplanationResponse, status_code=status.HTTP_201_CREATED)
def explain_code(
    request: CodeExplanationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Validates input code, gets markdown explanation from Gemini AI,
    logs the event in Supabase chat_history, and returns the response metadata.
    """
    logger.info(f"Received code explanation request from user: {current_user['id']}")
    
    try:
        # Step 1: Send the code input block to the Gemini service
        explanation = generate_code_explanation(
            code_input=request.code_input,
            language=request.language
        )
        
        # Step 2: Write history entry to Supabase database
        new_entry = create_chat_history_entry(
            user_id=current_user["id"],
            code_input=request.code_input,
            ai_response=explanation,
            language=request.language
        )
        
        if not new_entry:
            logger.error("Database insert completed but did not return a valid record payload.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database operation failed to return the logged record."
            )
            
        logger.info(f"Code explanation successfully generated and logged. Record ID: {new_entry['id']}")
        return new_entry
        
    except RuntimeError as err:
        logger.error(f"Execution error in explanation route: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected error in explanation route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
