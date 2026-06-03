import logging
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

logger = logging.getLogger(__name__)
security_scheme = HTTPBearer()

# Initialize JWKS Client for ES256 verification (Supabase Auth)
jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(jwks_url)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """
    FastAPI dependency to authenticate requests using Supabase JWT.
    Decodes the Bearer token and returns the user's ID and email.
    Supports both ES256 (via JWKS) and HS256 (via shared secret) signing algorithms.
    """
    token = credentials.credentials
    try:
        # Get the token header to determine the algorithm
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        
        if alg == "ES256":
            # Fetch public key from JWKS to verify ES256 signature
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],
                options={"verify_aud": False}
            )
        else:
            # Fallback to HS256 using local secret key
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
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
