import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("app.request")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that captures performance metrics and logs information for every incoming request.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        
        # Capture basic details of the incoming request
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"
        
        logger.info(f"Incoming: {method} {path} | Client IP: {client_ip}")
        
        try:
            response = await call_next(request)
            
            # Calculate execution duration
            duration = time.perf_counter() - start_time
            logger.info(
                f"Completed: {method} {path} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.4f}s"
            )
            return response
            
        except Exception as e:
            # Note: GlobalErrorHandlerMiddleware runs inside this scope, 
            # but if something escapes, we log the failure here.
            duration = time.perf_counter() - start_time
            logger.error(
                f"Failed: {method} {path} | "
                f"Error: {str(e)} | "
                f"Duration: {duration:.4f}s"
            )
            raise e
