from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from datetime import timedelta
from pydantic import BaseModel

# Asegúrate de importar tu modelo User si lo necesitas para tipos
# from app.models.user import User 

from app.crud import user_crud
from app.db.session import get_session
from app.utils.security import (
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

# Nota: RefreshTokenRequest estaba definido pero no usado. 
# Si usas lógica de refresh simple (rotación de token), no lo necesitas.
class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/login", response_model=Token, summary="Login")
@rate_limit(RATE_LIMITS["login"])
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """
    Login con email y contraseña.
    Devuelve un access token válido por ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    # Buscar usuario por email
    user = user_crud.get_user_by_email(session, email=form_data.username)
    
    # 1. Verificación de contraseña
    # ¡OJO! Verifica si en tu BD el campo se llama 'password' o 'password_hash'.
    # Aquí asumo 'password' que es lo común en SQLModel.
    if not user or not verify_password(form_data.password, user.password): 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Crear access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # ### CORRECCIÓN CRÍTICA: 
    # Usamos user.id en lugar de email, para que coincida con security.py
    access_token = create_access_token(
        subject=user.id, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }

@router.post("/refresh-token", response_model=Token, summary="Refrescar token")
@rate_limit(RATE_LIMITS["refresh"])
def refresh_token(
    current_user = Depends(get_current_user), # Ya trae el usuario validado
):
    """
    Refrescar el access token usando el token actual (si aún es válido).
    """
    
    # ### CORRECCIÓN DE OPTIMIZACIÓN:
    # No hace falta buscar en la BD de nuevo (user_crud), ya tenemos 'current_user'.
    
    # Crear nuevo access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    new_access_token = create_access_token(
        subject=current_user.id, # Usamos el ID del usuario actual
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": current_user,
    }