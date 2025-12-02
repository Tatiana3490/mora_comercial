# app/models/client.py

from typing import Optional
from sqlmodel import SQLModel, Field


class ClientBase(SQLModel):
    """Campos comunes del cliente."""
    nombre: str
    nif: Optional[str] = None
    correo: Optional[str] = None
    provincia: Optional[str] = None
    direccion: Optional[str] = None


class Client(ClientBase, table=True):
    """Tabla de clientes."""
    id_cliente: Optional[int] = Field(default=None, primary_key=True)

    # Comercial propietario (FK a usuario)
    id_comercial_propietario: int = Field(foreign_key="user.id_usuario")


# ===== Esquemas para la API =====

class ClientCreate(ClientBase):
    """Esquema para crear cliente."""
    id_comercial_propietario: int


class ClientRead(ClientBase):
    """Esquema para leer cliente (sin relaciones)."""
    id_cliente: int
    id_comercial_propietario: int


class ClientUpdate(SQLModel):
    """
    Esquema para actualizar cliente.
    Todos los campos son opcionales para permitir updates parciales.
    """
    nombre: Optional[str] = None
    nif: Optional[str] = None
    correo: Optional[str] = None
    provincia: Optional[str] = None
    direccion: Optional[str] = None
    id_comercial_propietario: Optional[int] = None
