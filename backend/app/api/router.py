from fastapi import APIRouter
from app.api.endpoints import auth, explain, history, review, learning

api_router = APIRouter()

# Register sub-routers under their respective endpoint categories
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(explain.router, prefix="/explain", tags=["Code Explanation"])
api_router.include_router(history.router, prefix="/history", tags=["Chat History"])
api_router.include_router(review.router, prefix="/review", tags=["Code Review"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning Path"])
