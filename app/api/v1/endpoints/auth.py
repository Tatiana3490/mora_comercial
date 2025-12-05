from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from datetime import timedelta
from pydantic import BaseModel

from app.crud import user_crud
from app.db.session import get_session
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.config import settings
from app.core.rate_limiting import rate_limit, RATE_LIMITS
from app.models.user import UserRead

router = APIRouter(tags=["Autenticación"])


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/login", response_model=Token, summary="Login")
@rate_limit(RATE_LIMITS["login"])
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """
    Login con email y contraseña.
    Devuelve un access token válido por ACCESS_TOKEN_EXPIRE_MINUTES (default: 60 min).
    
    Rate limit: 5 intentos por minuto por IP.
    """
    # Buscar usuario por email (username en OAuth2)
    user = user_crud.get_user_by_email(session, email=form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/refresh-token", response_model=Token, summary="Refrescar token")
@rate_limit(RATE_LIMITS["refresh"])
def refresh_token(
    request: Request,
    current_user=Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Refrescar el access token usando el token actual.
    El usuario debe estar autenticado con un token válido.
    
    Rate limit: 10 intentos por minuto por IP.
    """
    # Verificar que el usuario existe
    user = user_crud.get_user_by_email(session, email=current_user.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear nuevo access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": user,
    }
