from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from pydantic import BaseModel

# Importamos las utilidades y modelos necesarios
from app.crud import user_crud
from app.db.session import get_session
from app.utils.security import (
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.config import settings
from app.core.rate_limiting import rate_limit, RATE_LIMITS
from app.models.user import UserRead, User # Importamos User por si acaso

router = APIRouter(tags=["Autenticación"])

# Esquema de respuesta del Token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

@router.post("/login", response_model=Token, summary="Login")
@rate_limit(RATE_LIMITS["login"])
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    # --- DEBUG: CHIVATOS PARA VER QUÉ PASA EN LA CONSOLA ---
    print(f"🔍 DEBUG LOGIN: Email recibido: '{form_data.username}'")
    print(f"🔍 DEBUG LOGIN: Pass recibida: '{form_data.password}'")
    
    # 1. Buscar usuario por email
    # Nota: form_data.username contiene el email porque así funciona OAuth2
    user = user_crud.get_user_by_email(session=session, email=form_data.username)
    
    # 2. Verificar si el usuario existe
    if not user:
        print("❌ DEBUG LOGIN: Usuario NO encontrado en DB.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Añade ESTA línea para ver el hash real:
    print(f"💀 HASH EN BASE DE DATOS: '{user.password_hash}'")

    # 3. Verificar contraseña (comparar texto plano con el hash)
    # CORRECCIÓN: Usamos user.password_hash
    if not verify_password(form_data.password, user.password_hash):
        print("❌ DEBUG LOGIN: La contraseña no coincide.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ DEBUG LOGIN: ¡Acceso concedido a {user.email}!")

    # 4. Crear access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # CORRECCIÓN IMPORTANTE: Usamos 'id_usuario' (según tu modelo), no 'id'
    access_token = create_access_token(
        subject=user.id_usuario, 
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
    current_user: User = Depends(get_current_user), # Trae el usuario completo
):
    """
    Refrescar el access token usando el token actual (si aún es válido).
    """
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # CORRECCIÓN: Aquí también usamos 'id_usuario'
    new_access_token = create_access_token(
        subject=current_user.id_usuario, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": current_user,
    }