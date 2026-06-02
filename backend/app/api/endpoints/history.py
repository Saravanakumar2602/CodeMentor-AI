import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.schemas import CodeExplanationResponse
from app.core.security import get_current_user
from app.services.supabase import get_user_chat_history, delete_chat_history_entry

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=List[CodeExplanationResponse])
def get_history(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the complete explanation history for the logged-in user.
    """
    logger.info(f"Retrieving explanation history logs for user: {current_user['id']}")
    try:
        history = get_user_chat_history(user_id=current_user["id"])
        return history
    except RuntimeError as err:
        logger.error(f"Runtime error fetching history: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected database exception in history route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching history: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_history_item(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deletes a single explanation record belonging to the authenticated user.
    """
    logger.info(f"Request to delete history log ID: {id} from user: {current_user['id']}")
    try:
        deleted = delete_chat_history_entry(user_id=current_user["id"], entry_id=id)
        if not deleted:
            logger.warning(f"Could not find or delete record ID: {id} for user: {current_user['id']}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="The requested record could not be found or you do not have permission to delete it."
            )
            
        logger.info(f"Successfully deleted record ID: {id}")
        return {"status": "deleted", "message": f"Successfully deleted history record {id}"}
        
    except HTTPException:
        raise
    except RuntimeError as err:
        logger.error(f"Runtime error deleting history: {str(err)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        logger.error(f"Unexpected database exception in delete route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while deleting history: {str(e)}"
        )
