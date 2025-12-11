from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON

# 1. CLASE BASE (Padre)
# Contiene los campos comunes. NO es una tabla (table=False por defecto).
class AuditLogBase(SQLModel):
    """Campos compartidos entre la tabla y los esquemas de lectura/creación."""
    action: str
    actor_email: str
    target_email: str
    timestamp: datetime = Field(default_factory=datetime.now)
    details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

# 2. CLASE TABLA (Modelo de Base de Datos)
# Hereda de Base + añade el ID + añade table=True
class AuditLog(AuditLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

# 3. CLASE LECTURA (Schema Pydantic)
# Hereda de Base + asegura que el ID siempre esté presente al leer
class AuditLogRead(AuditLogBase):
    id: int