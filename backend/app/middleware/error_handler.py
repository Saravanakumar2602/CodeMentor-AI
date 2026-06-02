import logging
import traceback
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app.error")

class GlobalErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Middleware that catches all unhandled exceptions, logs them with details,
    and returns a standardized JSON response.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled exception occurred: {str(exc)}\n{traceback.format_exc()}")
            return self.handle_exception(exc)

    def handle_exception(self, exc: Exception) -> JSONResponse:
        # 1. Handle FastAPI's built-in HTTPExceptions
        if isinstance(exc, StarletteHTTPException):
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": {
                        "detail": exc.detail,
                        "status_code": exc.status_code,
                        "type": "HTTPException"
                    }
                }
            )
            
        # 2. Handle request validation errors (Pydantic / body errors)
        elif isinstance(exc, RequestValidationError):
            errors = []
            for error in exc.errors():
                loc = " -> ".join(str(l) for l in error.get("loc", []))
                msg = error.get("msg", "Validation error")
                errors.append(f"{loc}: {msg}")
            
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": {
                        "detail": "Input validation failed.",
                        "errors": errors,
                        "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                        "type": "ValidationError"
                    }
                }
            )
            
        # 3. Handle all other general Python exceptions (DB exceptions, runtime failures, SDK errors, etc.)
        else:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "detail": "An internal server error occurred. Please contact system support.",
                        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                        "type": "InternalServerError"
                    }
                }
            )
