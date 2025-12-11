from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# Esto evita el error de "importación circular"
if TYPE_CHECKING:
    from app.models.presupuesto import Presupuesto

class ClientBase(SQLModel):
    """Campos comunes del cliente."""
    nombre: str
    nif: Optional[str] = None
    correo: Optional[str] = None
    provincia: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None


class Client(ClientBase, table=True):
    """Tabla de clientes."""
    # Usamos id_cliente como Primary Key
    id_cliente: Optional[int] = Field(default=None, primary_key=True)

    # Comercial propietario (FK a la tabla 'user', columna 'id_usuario')
    id_comercial_propietario: int = Field(foreign_key="user.id_usuario")

    # Fecha de registro automática
    fecha_registro: datetime = Field(default_factory=datetime.now)

    # --- ⚠️ ESTO ES LO QUE FALTABA ---
    # Relación inversa: Un Cliente tiene muchos Presupuestos.
    # Esto permite hacer: cliente.presupuestos
    presupuestos: List["Presupuesto"] = Relationship(back_populates="cliente")


# ===== Esquemas para la API =====

class ClientCreate(ClientBase):
    """Esquema para crear cliente."""
    id_comercial_propietario: int


class ClientRead(ClientBase):
    """Esquema para leer cliente."""
    id_cliente: int
    id_comercial_propietario: int
    fecha_registro: datetime


class ClientUpdate(SQLModel):
    """Esquema para actualizar cliente (todo opcional)."""
    nombre: Optional[str] = None
    nif: Optional[str] = None
    correo: Optional[str] = None
    provincia: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    id_comercial_propietario: Optional[int] = None