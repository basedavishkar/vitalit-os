import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from .logger import logger, log_api_request, log_security_event
from .config import settings


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging API requests."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Get user ID from request if available
        user_id = None
        if hasattr(request.state, "user"):
            user_id = request.state.user.get("id")
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log request
        log_api_request(
            logger=logger,
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
            duration=duration,
            user_id=user_id
        )
        
        return response


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for security monitoring."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Check for suspicious patterns
        user_agent = request.headers.get("user-agent", "")
        if self._is_suspicious_request(request, user_agent):
            log_security_event(
                logger=logger,
                event_type="SUSPICIOUS_REQUEST",
                user_id=None,
                details=f"Path: {request.url.path}, Method: {request.method}",
                ip_address=client_ip
            )
        
        response = await call_next(request)
        
        # Log failed authentication attempts
        if response.status_code == 401:
            log_security_event(
                logger=logger,
                event_type="AUTHENTICATION_FAILURE",
                user_id=None,
                details=f"Path: {request.url.path}",
                ip_address=client_ip
            )
        
        return response
    
    def _is_suspicious_request(self, request: Request, user_agent: str) -> bool:
        """Check if request appears suspicious."""
        suspicious_patterns = [
            "/admin", "/wp-admin", "/phpmyadmin", "/.env",
            "sqlmap", "nikto", "nmap", "dirb"
        ]
        
        path = request.url.path.lower()
        user_agent_lower = user_agent.lower()
        
        for pattern in suspicious_patterns:
            if pattern in path or pattern in user_agent_lower:
                return True
        
        return False


class CORSMiddleware(BaseHTTPMiddleware):
    """Enhanced CORS middleware."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add CORS headers
        origin = request.headers.get("origin")
        if origin in settings.allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
        
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization, X-Requested-With"
        )
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware."""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        self._clean_old_entries(current_time)
        
        # Check rate limit
        if self._is_rate_limited(client_ip, current_time):
            log_security_event(
                logger=logger,
                event_type="RATE_LIMIT_EXCEEDED",
                user_id=None,
                details=f"IP: {client_ip}",
                ip_address=client_ip
            )
            return Response(
                content="Rate limit exceeded",
                status_code=429,
                media_type="text/plain"
            )
        
        # Increment request count
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []
        self.request_counts[client_ip].append(current_time)
        
        return await call_next(request)
    
    def _clean_old_entries(self, current_time: float):
        """Remove entries older than 1 minute."""
        cutoff_time = current_time - 60
        for ip in list(self.request_counts.keys()):
            self.request_counts[ip] = [
                t for t in self.request_counts[ip] 
                if t > cutoff_time
            ]
            if not self.request_counts[ip]:
                del self.request_counts[ip]
    
    def _is_rate_limited(self, client_ip: str, current_time: float) -> bool:
        """Check if client is rate limited."""
        if client_ip not in self.request_counts:
            return False
        
        # Count requests in the last minute
        cutoff_time = current_time - 60
        recent_requests = [
            t for t in self.request_counts[client_ip] 
            if t > cutoff_time
        ]
        
        return len(recent_requests) >= self.requests_per_minute 