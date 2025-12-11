from sqlmodel import SQLModel
from typing import Optional
from datetime import date
from app.models.presupuesto import Presupuesto
from app.models.client import Client

# 1. Definimos qué parte del Cliente queremos ver (para no enviar contraseñas o datos internos)
class ClientRead(SQLModel):
    id_cliente: int
    nombre: str
    provincia: Optional[str] = None
    # Añade aquí otros campos si los necesitas en la tabla

# 2. Definimos el Presupuesto "completo" (con el cliente incrustado)
class PresupuestoConCliente(Presupuesto):
    # Esta es la clave: añadimos un campo 'cliente' que usa el esquema de arriba
    cliente: Optional[ClientRead] = None