# app/models/presupuesto_linea.py
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class PresupuestoLineaBase(SQLModel):
    # FKs
    id_presupuesto: int = Field(foreign_key="presupuesto.id_presupuesto")
    articulo_id: str = Field(foreign_key="articulo.id")

    # Datos de línea
    cantidad_m2: float = Field(default=0.0)
    precio_m2: float = Field(default=0.0)
    descuento_pct: float = Field(default=0.0)

    # Snapshot de la descripción del artículo en el momento del presupuesto
    descripcion_articulo: Optional[str] = None


class PresupuestoLinea(PresupuestoLineaBase, table=True):
    id_linea: Optional[int] = Field(default=None, primary_key=True)

    # 🔗 Relaciones
    presupuesto: "Presupuesto" = Relationship(
        back_populates="lineas"
    )
    articulo: "Articulo" = Relationship(
        back_populates="lineas_presupuesto"
    )
    
    articulo: Optional["Articulo"] = Relationship()


class PresupuestoLineaCreate(PresupuestoLineaBase):
    """Esquema para crear líneas de presupuesto."""
    pass


class PresupuestoLineaRead(PresupuestoLineaBase):
    """Esquema para leer líneas de presupuesto."""
    id_linea: int


__all__ = [
    "PresupuestoLineaBase",
    "PresupuestoLinea",
    "PresupuestoLineaCreate",
    "PresupuestoLineaRead",
]
