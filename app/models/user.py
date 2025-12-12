# app/models/user.py

from typing import Optional
from sqlmodel import SQLModel, Field

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