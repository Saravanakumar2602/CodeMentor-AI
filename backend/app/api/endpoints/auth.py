import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.schemas import UserProfileResponse
from app.services.supabase import supabase_client

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
def get_current_profile(current_user: dict = Depends(get_current_user)):
    """
    Retrieves the synchronized profile record for the authenticated user.
    """
    if not supabase_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database service is unavailable."
        )

    try:
        logger.info(f"Retrieving profile for authenticated user ID: {current_user['id']}")
        response = supabase_client.table("profiles") \
            .select("id, email, created_at") \
            .eq("id", current_user["id"]) \
            .execute()
            
        if response.data and len(response.data) > 0:
            return response.data[0]
            
        logger.warning(f"Profile record not found for user ID: {current_user['id']}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile could not be found in the system."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error during profile retrieval: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user profile: {str(e)}"
        )
