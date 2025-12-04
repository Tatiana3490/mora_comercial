from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class AuditLog(SQLModel, table=True):
    """Registro de auditoría simple para acciones sobre usuarios."""
    id: Optional[int] = Field(default=None, primary_key=True)
    action: str
    actor_email: Optional[str] = None
    target_email: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[str] = None
