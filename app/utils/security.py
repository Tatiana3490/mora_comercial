from datetime import datetime, timedelta
from typing import Optional, Union, Any

# Librerías externas
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlmodel import Session # <--- Usamos Session de SQLModel
import bcrypt 

# --- IMPORTS DE CONFIGURACIÓN ---
from app.core.config import settings 
from app.models.user import User 

# --- SOLUCIÓN: IMPORTAMOS TU FUNCIÓN REAL ---
# En lugar de get_db, importamos get_session desde tu archivo
from app.db.session import get_session 

# Definimos el esquema de seguridad
# NOTA: Asegúrate que settings.API_V1_STR exista, si no, pon "/api/v1" a mano.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")

# ==========================================
# 1. FUNCIONES DE CONTRASEÑA (BCRYPT)
# ==========================================

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except (ValueError, TypeError, AttributeError):
        return False

# ==========================================
# 2. FUNCIONES DE TOKENS (JWT)
# ==========================================

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# ==========================================
# 3. DEPENDENCIA DE USUARIO ACTUAL
# ==========================================

def get_current_user(
    # AQUÍ ESTÁ EL CAMBIO CLAVE: Usamos get_session
    db: Session = Depends(get_session), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_sub: str = payload.get("sub")
        if token_sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Buscamos al usuario por ID
    user = db.query(User).filter(User.id == token_sub).first()
    
    if user is None:
        raise credentials_exception
        
    return user