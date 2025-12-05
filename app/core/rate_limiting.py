"""
Rate limiting configuration for sensitive endpoints.
Uses SlowAPI to prevent brute force attacks and DoS.
"""

import os
import inspect
from functools import wraps
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# Define rate limit policies
RATE_LIMITS = {
    "login": "5/minute",           # Max 5 login attempts per minute
    "refresh": "10/minute",        # Max 10 refresh requests per minute
    "create_user": "10/hour",      # Max 10 user creations per hour
    "delete_user": "5/hour",       # Max 5 user deletions per hour
    "general": "100/hour",         # General rate limit: 100 requests per hour
}


def rate_limit(limit_string: str):
    """
    Conditional decorator that applies rate limiting only in production.
    In testing mode (TESTING=1 env var), it's a no-op.
    
    Note: endpoints using this decorator MUST include 'request: Request' parameter
    for slowapi to properly track the client IP and apply rate limits.
    """
    def decorator(func):
        # Skip rate limiting if in testing mode
        if os.getenv("TESTING"):
            return func
        
        # Apply slowapi limiter directly
        # The endpoint function must have 'request: Request' parameter
        return limiter.limit(limit_string)(func)
    
    return decorator


def setup_rate_limiting(app: FastAPI):
    """Setup rate limiting for the FastAPI app."""
    app.state.limiter = limiter
    
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_exceeded_handler(request, exc):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."},
        )
