from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for CodeMentor AI. Interfaces with Gemini API and Supabase.",
    version="1.0.0"
)

# Configure CORS Middleware
# Allows React client to communicate with backend
origins = [
    "http://localhost:5173",       # Default Vite dev server port
    "http://127.0.0.1:5173",
    # Add your Vercel deployment URL here in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP, allow all origins. Secure this in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the centralized API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["General"])
def read_root():
    """
    Root endpoint containing basic api status and documentation link.
    """
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["General"])
def health_check():
    """
    Health check endpoint for deployment environment uptime monitoring (e.g., on Render).
    """
    return {
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
