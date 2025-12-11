# app/models/user.py

from typing import Optional
from sqlmodel import SQLModel, Field

# Posibles roles de usuario
ROL_USUARIO = ["COMERCIAL", "ADMIN"]


class UserBase(SQLModel):
    """Campos comunes del usuario."""
    nombre: str
    # ### NUEVO CAMPO ###
    apellidos: str 
    # -------------------
    email: str = Field(unique=True, index=True)
    rol: str = Field(default="COMERCIAL")
    activo: bool = Field(default=True)


class User(UserBase, table=True):
    """Tabla de usuarios."""
    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str = Field(index=False)


# ===== Esquemas para la API =====

class UserCreate(UserBase):
    """Esquema para crear usuario (recibe contraseña en texto plano)."""
    password: str


class UserRead(UserBase):
    """Esquema para leer usuario (sin contraseña)."""
    id_usuario: int


class UserReadInternal(UserRead):
    """Solo para uso interno (incluye hash)."""
    password_hash: str


class UserUpdate(SQLModel):
    """
    Esquema para actualizar usuario.
    Todos los campos son opcionales.
    """
    nombre: Optional[str] = None
    # ### NUEVO CAMPO (Opcional para update) ###
    apellidos: Optional[str] = None
    # ----------------------------------------
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