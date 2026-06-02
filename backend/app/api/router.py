from fastapi import APIRouter
from app.api.endpoints import auth, explain, history

api_router = APIRouter()

# Grouping endpoints under their respective paths
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(explain.router, prefix="/explain", tags=["Code Explanation"])
api_router.include_router(history.router, prefix="/history", tags=["Chat History"])
