# app/models/user.py

import re
from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import field_validator

# Posibles roles de usuario
ROL_USUARIO = ["COMERCIAL", "ADMIN"]


class UserBase(SQLModel):
    """Campos comunes del usuario."""
    nombre: str
    apellidos: str 
    email: str = Field(unique=True, index=True)
    rol: str = Field(default="COMERCIAL")
    activo: bool = Field(default=True)


class User(UserBase, table=True):
    """Tabla de usuarios."""
    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str = Field(index=False)


# ===== Esquemas para la API =====
class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Debe incluir al menos una mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("Debe incluir al menos una minúscula")
        if not re.search(r"[0-9]", v):
            raise ValueError("Debe incluir al menos un número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Debe incluir al menos un carácter especial")
        return v

class UserRead(UserBase):
    id_usuario: int


class UserReadInternal(UserRead):
   
    password_hash: str


class UserUpdate(SQLModel):
    
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None


__all__ = [
    "UserBase",
    "User",
    "UserCreate",
    "UserRead",
    "UserReadInternal",
    "UserUpdate",
]