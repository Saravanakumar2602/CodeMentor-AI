import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the path to the backend directory to ensure .env is found correctly
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_file_path = os.path.join(backend_dir, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeMentor AI API"
    API_V1_STR: str = "/api"
    
    # Gemini Configuration
    GEMINI_API_KEY: str
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str  # service role key or anon key depending on access
    SUPABASE_JWT_SECRET: str
    
    # Run Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Pydantic v2 config to load environment variables from file
    model_config = SettingsConfigDict(
        env_file=env_file_path,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
