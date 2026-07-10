import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the path to the backend directory to locate .env correctly
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_file_path = os.path.join(backend_dir, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeMentor AI API"
    API_V1_STR: str = "/api"
    
    # AI Configuration (OpenAI-compatible)
    AI_API_BASE_URL: str = "https://openrouter.ai/api/v1"
    AI_API_KEY: str
    AI_MODEL_NAME: str = "nvidia/nemotron-3-ultra-550b-a55b:free"
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Service role key or anon key depending on access
    SUPABASE_JWT_SECRET: str
    
    # Run Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # Pydantic v2 configuration to load environment variables from the file
    model_config = SettingsConfigDict(
        env_file=env_file_path,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
