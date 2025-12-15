from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.presupuesto import Presupuesto

# 1. BASE: Campos comunes
class PresupuestoLineaBase(SQLModel):
    id_articulo: str = Field(index=True)
    descripcion: str
    cantidad: float = Field(default=1.0)
    precio_unitario: float = Field(default=0.0)
    descuento: float = Field(default=0.0)
    
    # Opcional: totales calculados (a veces conviene guardarlos, a veces no)
    total_linea: float = Field(default=0.0)

# 2. TABLA: Definición de BD
class PresupuestoLinea(PresupuestoLineaBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    id_presupuesto: int = Field(foreign_key="presupuesto.id")
    # Relación inversa (necesaria para que funcione el cascade delete y la lectura completa)
    presupuesto: Optional["Presupuesto"] = Relationship(back_populates="lineas")

# 3. ESQUEMAS
class PresupuestoLineaCreate(PresupuestoLineaBase):
    pass

class PresupuestoLineaRead(PresupuestoLineaBase):
    id: int
    id_presupuesto: int

class PresupuestoLineaUpdate(SQLModel):
    id_articulo: Optional[str] = None
    descripcion: Optional[str] = None
    cantidad: Optional[float] = None
    precio_unitario: Optional[float] = None
    descuento: Optional[float] = None

__all__ = [
    "PresupuestoLineaBase",
    "PresupuestoLinea",
    "PresupuestoLineaCreate",
    "PresupuestoLineaRead",
    "PresupuestoLineaUpdate",
]