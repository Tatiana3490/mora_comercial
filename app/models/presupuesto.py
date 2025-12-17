from typing import TYPE_CHECKING, Optional, List
from datetime import date
from sqlmodel import SQLModel, Field, Relationship

# ⚠️ OJO: Si obtienes un error de "ImportError: cannot import name..."
# es por una referencia circular. Si pasa eso, avísame y separamos los Schemas (Pydantic) de los Models (Tablas).
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
    # (He eliminado el id_cliente duplicado que tenías arriba)
    
    id_cliente: int = Field(foreign_key="client.id_cliente")
    
    id_comercial_creador: int = Field(foreign_key="user.id_usuario")
    
    id_admin_revisor: Optional[int] = Field(
        default=None,
        foreign_key="user.id_usuario",
    )


# 2. ENTIDAD DE BD (Hereda de Base, añade ID y Relaciones)
class Presupuesto(PresupuestoBase, table=True):
    """Entidad de BD: cabecera de presupuesto."""
    id: Optional[int] = Field(default=None, primary_key=True)

    # --- RELACIONES ---
    
    # Relación con Cliente
    cliente: Optional["Client"] = Relationship(back_populates="presupuestos")

    # Relación con Líneas
    # CORRECCIÓN AQUÍ: Añadido 'delete-orphan' para limpieza total
    lineas: List["PresupuestoLinea"] = Relationship(
        back_populates="presupuesto", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# =====================
# Esquemas de entrada / salida para la API
# =====================

class PresupuestoCreate(PresupuestoBase):
    pass 


class PresupuestoRead(PresupuestoBase):
    id: int    

class PresupuestoReadWithRelations(PresupuestoRead):
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

    # Uso comillas en la lista para evitar problemas si el import falla, 
    # aunque Pydantic prefiere el tipo real si es posible.
    lineas: Optional[List[PresupuestoLineaCreate]] = None


class PresupuestoCompletoRead(PresupuestoRead):
    """Para leer el presupuesto con todas sus líneas."""
    lineas: List[PresupuestoLineaRead] = []

    # Campos calculados
    total_bruto: float = 0.0
    total_descuento: float = 0.0
    total_neto: float = 0.0