import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.request_log import RequestLoggingMiddleware
from app.middleware.error_handler import GlobalErrorHandlerMiddleware
from app.api.router import api_router

# 1. Initialize global structured logging config
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

# 2. Instantiate the FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for CodeMentor AI. Interfaces with Nemotron AI API and Supabase database.",
    version="1.0.0"
)

# 3. Mount Custom Error Handler Middleware (Should be mounted first so it catches all inner exceptions)
app.add_middleware(GlobalErrorHandlerMiddleware)

# 4. Configure CORS Middleware
# Allows React client to communicate with backend
origins = [
    "http://localhost:5173",       # Default Vite dev server port
    "http://127.0.0.1:5173",
    # Add production frontend URLs here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production requirements
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Mount Request Logging Middleware to track request processing times and statuses
app.add_middleware(RequestLoggingMiddleware)

# 6. Mount the centralized V1 API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["General"])
def read_root():
    """
    Root status endpoint containing app metadata and Swagger documentation path.
    """
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["General"])
def health_check():
    """
    Health check monitoring ping endpoint.
    """
    return {
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}...")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
