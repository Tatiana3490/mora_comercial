from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON

# 1. CLASE BASE
class AuditLogBase(SQLModel):
    """Campos compartidos entre la tabla y los esquemas."""
    action: str
    
    # --- CAMBIO IMPORTANTE AQUÍ ---
    # Convertimos el campo en Opcional y permitimos nulos en la BD (nullable=True)
    # Si no llega nada, intentará poner "SYSTEM"
    actor_email: Optional[str] = Field(default="SYSTEM", nullable=True)
    
    target_email: str
    timestamp: datetime = Field(default_factory=datetime.now)
    details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

# 2. CLASE TABLA
class AuditLog(AuditLogBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

# 3. CLASE LECTURA
class AuditLogRead(AuditLogBase):
    id: int