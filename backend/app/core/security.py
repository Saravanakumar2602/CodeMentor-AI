import logging
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

logger = logging.getLogger(__name__)
security_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """
    FastAPI dependency to authenticate requests using Supabase JWT.
    Decodes the Bearer token and returns the user's ID and email.
    """
    token = credentials.credentials
    try:
        # Supabase JWTs are signed with HS256 using the JWT Secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Bypassed to avoid potential aud mismatch warnings
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            logger.warning("JWT verification succeeded but subject (sub) was missing in payload.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Subject (sub) is missing."
            )
            
        return {
            "id": user_id,
            "email": email
        }
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT verification failed: token has expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again."
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT verification failed: invalid token structure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
