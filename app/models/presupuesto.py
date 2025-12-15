from typing import TYPE_CHECKING, Optional, List
from datetime import date
from sqlmodel import SQLModel, Field, Relationship

# Importamos lo necesario para las líneas (evitando ciclos si es posible)
# Nota: Si esto da error de importación circular, habría que moverlo,
# pero por ahora asumimos que está bien estructurado en carpetas.
from .presupuesto_linea import (
    PresupuestoLinea,
    PresupuestoLineaCreate,
    PresupuestoLineaRead,
)

if TYPE_CHECKING:
    from app.models.client import Client

# Posibles estados del presupuesto
ESTADO_PRESUPUESTO = ["BORRADOR", "ENVIADO_ADMIN", "APROBADO", "DENEGADO"]


# 1. CLASE BASE (Solo datos comunes, NO es tabla)
class PresupuestoBase(SQLModel):
    """Campos comunes de la cabecera de presupuesto."""
    numero_presupuesto: Optional[str] = None
    fecha_presupuesto: date = Field(default_factory=date.today)
    lugar_suministro: Optional[str] = None
    persona_contacto: Optional[str] = None

    # Cliente asociado
    id_cliente: int = Field(foreign_key="client.id_cliente")
    
    total: float = Field(default=0.0)

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

    # --- CLAVES FORÁNEAS (Foreign Keys) ---
    # ⚠️ IMPORTANTE: Asegúrate de que los nombres de tabla.campo coincidan con tus otros modelos
    
    # FK a Client (usamos 'client.id_cliente' porque así lo definimos en Client)
    id_cliente: int = Field(foreign_key="client.id_cliente")
    
    # FK a User (asumiendo que en User la PK es 'id_usuario')
    id_comercial_creador: int = Field(foreign_key="user.id_usuario")
    
    id_admin_revisor: Optional[int] = Field(
        default=None,
        foreign_key="user.id_usuario",
    )


# 2. ENTIDAD DE BD (Hereda de Base, añade ID y Relaciones)
class Presupuesto(PresupuestoBase, table=True):
    """Entidad de BD: cabecera de presupuesto."""
    # Unificamos el ID a "id" para evitar líos con Pydantic
    id: Optional[int] = Field(default=None, primary_key=True)

    # --- RELACIONES ---
    
    # 1. Relación con Cliente
    # back_populates debe coincidir con el nombre de la variable en app/models/client.py
    cliente: Optional["Client"] = Relationship(back_populates="presupuestos")

    # 2. Relación con Líneas
    # Esto faltaba y es necesario para 'PresupuestoCompletoRead'
    # Asumimos que en PresupuestoLinea existe 'presupuesto: Relationship(...)'
    lineas: List["PresupuestoLinea"] = Relationship(back_populates="presupuesto", sa_relationship_kwargs={"cascade": "all, delete"})


# =====================
# Esquemas de entrada / salida para la API
# =====================

class PresupuestoCreate(PresupuestoBase):
    """Al crear, id_cliente ya viene en la Base, pero lo explicito aquí si quiero validación extra."""
    pass 


class PresupuestoRead(PresupuestoBase):
    id: int    
    # id_cliente ya está en Base, no hace falta repetirlo, pero no daña.

class PresupuestoReadWithRelations(PresupuestoRead):
    # Aquí cargamos el objeto Cliente completo
    cliente: Optional["Client"] = None

class PresupuestoCompletoCreate(PresupuestoCreate):
    # Para crear presupuesto + líneas de golpe
    lineas: List[PresupuestoLineaCreate]


class PresupuestoUpdate(SQLModel):
    """Todos los campos opcionales para PATCH."""
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

    lineas: Optional[List["PresupuestoLineaCreate"]] = None


class PresupuestoCompletoRead(PresupuestoRead):
    """Para leer el presupuesto con todas sus líneas."""
    lineas: List[PresupuestoLineaRead] = []

    # Campos calculados (no están en BD, se calculan en Python)
    total_bruto: float = 0.0
    total_descuento: float = 0.0
    total_neto: float = 0.0


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