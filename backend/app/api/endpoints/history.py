from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.schemas import CodeExplanationResponse
from app.core.security import get_current_user
from app.services.supabase import get_user_chat_history

router = APIRouter()

@router.get("", response_model=List[CodeExplanationResponse])
def get_history(current_user: dict = Depends(get_current_user)):
    """
    Endpoint to retrieve the chat history for the currently logged-in user.
    Uses Supabase JWT authentication to fetch records filtered by user_id.
    """
    try:
        history = get_user_chat_history(user_id=current_user["id"])
        return history
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching history: {str(e)}"
        )
