from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter()

@router.get("/me")
def get_current_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns authentication details for the currently logged-in user.
    Useful for testing authentication and token validity.
    """
    return {
        "status": "authenticated",
        "user": current_user
    }
