"""
JWT Authentication module for Platziflix API.

Provides secure authentication and authorization for API endpoints.
"""
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.core.config import settings


# Security scheme for Swagger UI
security = HTTPBearer(auto_error=False)


class TokenData(BaseModel):
    """Token payload data structure."""
    user_id: int
    email: Optional[str] = None
    exp: Optional[datetime] = None


class User(BaseModel):
    """Authenticated user model."""
    id: int
    email: Optional[str] = None


def create_access_token(user_id: int, email: Optional[str] = None) -> str:
    """
    Create a new JWT access token.

    Args:
        user_id: The user ID to encode in the token
        email: Optional email to include in token payload

    Returns:
        Encoded JWT token string
    """
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[TokenData]:
    """
    Decode and validate a JWT access token.

    Args:
        token: The JWT token string to decode

    Returns:
        TokenData if valid, None if invalid or expired

    Raises:
        None - returns None on any error for security
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return TokenData(
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            exp=payload.get("exp")
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """
    FastAPI dependency to extract and validate the current authenticated user.

    This dependency:
    1. Extracts the Bearer token from Authorization header
    2. Validates the JWT token
    3. Returns the authenticated User

    Args:
        credentials: HTTP Authorization credentials from request header

    Returns:
        User object with authenticated user's information

    Raises:
        HTTPException 401: If no token provided or token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    token_data = decode_access_token(token)

    if token_data is None:
        raise credentials_exception

    if token_data.user_id is None:
        raise credentials_exception

    return User(id=token_data.user_id, email=token_data.email)


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """
    FastAPI dependency to optionally extract the current user.

    Unlike get_current_user, this does not raise an error if no token
    is provided. Useful for endpoints that work with or without auth.

    Args:
        credentials: HTTP Authorization credentials (optional)

    Returns:
        User object if valid token provided, None otherwise
    """
    if credentials is None:
        return None

    token = credentials.credentials
    token_data = decode_access_token(token)

    if token_data is None or token_data.user_id is None:
        return None

    return User(id=token_data.user_id, email=token_data.email)
