# app/models/presupuesto.py

from typing import Optional, List
from datetime import date

from sqlmodel import SQLModel, Field, Relationship

from .presupuesto_linea import (
    PresupuestoLinea,
    PresupuestoLineaCreate,
    PresupuestoLineaRead,
)

# Posibles estados del presupuesto (referencia)
ESTADO_PRESUPUESTO = ["BORRADOR", "ENVIADO_ADMIN", "APROBADO", "DENEGADO"]


class PresupuestoBase(SQLModel):
    """Campos comunes de la cabecera de presupuesto."""

    numero_presupuesto: Optional[str] = None
    fecha_presupuesto: date = Field(default_factory=date.today)
    lugar_suministro: Optional[str] = None
    persona_contacto: Optional[str] = None

    # Estado y revisión
    estado: str = Field(default="BORRADOR")
    fecha_revision: Optional[date] = None
    motivo_denegacion: Optional[str] = None

    # Condiciones del presupuesto
    forma_pago: Optional[str] = None
    validez_dias: Optional[int] = Field(default=30)
    precio_palet: float = Field(default=0.0)
    condiciones_camion: Optional[str] = None
    condiciones_descarga: Optional[str] = None
    condiciones_impuestos: Optional[str] = None
    observaciones: Optional[str] = None

    # Claves foráneas (solo IDs, sin relaciones ORM complejas)
    id_cliente: int = Field(foreign_key="client.id_cliente")
    id_comercial_creador: int = Field(foreign_key="user.id_usuario")
    id_admin_revisor: Optional[int] = Field(
        default=None,
        foreign_key="user.id_usuario",
    )


class Presupuesto(PresupuestoBase, table=True):
    """Entidad de BD: cabecera de presupuesto."""

    id_presupuesto: Optional[int] = Field(default=None, primary_key=True)

    # 🔗 Relación con líneas: borrado en cascada
    lineas: List["PresupuestoLinea"] = Relationship(
        back_populates="presupuesto",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


# =====================
# Esquemas de entrada / salida para la API
# =====================

class PresupuestoCreate(PresupuestoBase):
    """Esquema para crear solo la cabecera del presupuesto."""
    pass


class PresupuestoRead(PresupuestoBase):
    """Esquema básico de lectura de cabecera."""
    id_presupuesto: int


class PresupuestoReadWithRelations(PresupuestoRead):
    """
    Esquema de lectura con las líneas incluidas.
    Útil para endpoints que devuelven el presupuesto completo
    pero sin campos de totales calculados.
    """

    lineas: List[PresupuestoLineaRead] = []


class PresupuestoCompletoCreate(PresupuestoCreate):
    """
    Esquema para crear presupuesto + líneas en una sola llamada.

    Estructura esperada en el body:
    {
      ...campos de cabecera...,
      "lineas": [ {...}, {...} ]
    }
    """

    lineas: List[PresupuestoLineaCreate]


class PresupuestoUpdate(SQLModel):
    """
    Esquema para actualizar la cabecera de un presupuesto.

    Todos los campos son opcionales para permitir actualizaciones parciales.
    """

    numero_presupuesto: Optional[str] = None
    fecha_presupuesto: Optional[date] = None
    lugar_suministro: Optional[str] = None
    persona_contacto: Optional[str] = None

    estado: Optional[str] = None
    fecha_revision: Optional[date] = None
    motivo_denegacion: Optional[str] = None

    forma_pago: Optional[str] = None
    validez_dias: Optional[int] = None
    precio_palet: Optional[float] = None
    condiciones_camion: Optional[str] = None
    condiciones_descarga: Optional[str] = None
    condiciones_impuestos: Optional[str] = None
    observaciones: Optional[str] = None

    id_cliente: Optional[int] = None
    id_comercial_creador: Optional[int] = None
    id_admin_revisor: Optional[int] = None


class PresupuestoCompletoRead(PresupuestoRead):
    """
    Esquema de lectura completo:
    - Cabecera
    - Líneas
    - Totales calculados (no almacenados en BD)
    """

    lineas: List[PresupuestoLineaRead]

    total_bruto: float
    total_descuento: float
    total_neto: float


__all__ = [
    "ESTADO_PRESUPUESTO",
    "PresupuestoBase",
    "Presupuesto",
    "PresupuestoCreate",
    "PresupuestoRead",
    "PresupuestoReadWithRelations",
    "PresupuestoCompletoCreate",
    "PresupuestoUpdate",
    "PresupuestoCompletoRead",
]
