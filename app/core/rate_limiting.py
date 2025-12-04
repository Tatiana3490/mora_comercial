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
    
    Automatically adds the 'request' parameter if not present, as required by slowapi.
    """
    def decorator(func):
        # Skip rate limiting if in testing mode
        if os.getenv("TESTING"):
            return func
        
        # Check if 'request' parameter exists in the function signature
        sig = inspect.signature(func)
        has_request = any(
            param.annotation == Request or 'request' in param.name.lower()
            for param in sig.parameters.values()
        )
        
        if not has_request:
            # Create a wrapper that accepts request as first parameter
            # WITHOUT @wraps, so the signature changes properly
            def wrapper_with_request(request: Request, *args, **kwargs):
                return func(*args, **kwargs)
            # Copy over metadata manually
            wrapper_with_request.__name__ = func.__name__
            wrapper_with_request.__module__ = func.__module__
            # Apply the limiter to the wrapper
            return limiter.limit(limit_string)(wrapper_with_request)
        else:
            # Function already has request parameter, apply limiter directly
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
