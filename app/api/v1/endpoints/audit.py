from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from datetime import datetime
from typing import Optional

from app.crud import audit_crud
from app.db.session import get_session
from app.core.security import get_current_user
from app.models.audit import AuditLog
from app.models.user import UserRead

router = APIRouter(tags=["Auditoría"])


class AuditLogRead(AuditLog):
    """Schema de lectura para audit logs."""
    pass


@router.get("/", response_model=list[AuditLogRead], summary="Listar registros de auditoría")
def list_audit_logs(
    *,
    session: Session = Depends(get_session),
    current_user: UserRead = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="Cantidad de registros a saltar"),
    limit: int = Query(100, ge=1, le=500, description="Cantidad máxima de registros a retornar"),
    actor_email: Optional[str] = Query(None, description="Filtrar por email del actor"),
    target_email: Optional[str] = Query(None, description="Filtrar por email del usuario afectado"),
    action: Optional[str] = Query(None, description="Filtrar por acción (create_user, update_user, delete_user)"),
    date_from: Optional[datetime] = Query(None, description="Filtrar desde fecha (ISO 8601)"),
    date_to: Optional[datetime] = Query(None, description="Filtrar hasta fecha (ISO 8601)"),
):
    """
    Lista registros de auditoría (solo para ADMIN).
    
    Filtros disponibles:
    - actor_email: Email del usuario que realizó la acción
    - target_email: Email del usuario afectado por la acción
    - action: Tipo de acción (create_user, update_user, delete_user)
    - date_from: Fecha desde (ISO 8601, ej: 2025-12-04T10:00:00)
    - date_to: Fecha hasta (ISO 8601, ej: 2025-12-04T23:59:59)
    """
    # Solo ADMIN puede ver audit logs
    if getattr(current_user, "rol", None) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden acceder a los registros de auditoría"
        )
    
    logs = audit_crud.list_audit_logs(
        session,
        skip=skip,
        limit=limit,
        actor_email=actor_email,
        target_email=target_email,
        action=action,
        date_from=date_from,
        date_to=date_to,
    )
    return logs


@router.get("/{log_id}", response_model=AuditLogRead, summary="Obtener registro de auditoría")
def get_audit_log(
    *,
    session: Session = Depends(get_session),
    current_user: UserRead = Depends(get_current_user),
    log_id: int,
):
    """
    Obtiene un registro de auditoría específico por su ID (solo para ADMIN).
    """
    # Solo ADMIN puede ver audit logs
    if getattr(current_user, "rol", None) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden acceder a los registros de auditoría"
        )
    
    log = session.get(AuditLog, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de auditoría no encontrado"
        )
    return log
