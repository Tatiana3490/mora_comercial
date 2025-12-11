from typing import Optional, List # Importamos List por compatibilidad
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session

from app.db.session import get_session
from app.utils.security import get_current_user
from app.crud import audit_crud

# IMPORTAMOS LOS MODELOS DESDE SU ORIGEN (Sin redefinirlos aquí)
from app.models.audit import AuditLog, AuditLogRead
from app.models.user import UserRead

router = APIRouter(tags=["Auditoría"])

# --- YA NO DEFINIMOS LA CLASE AQUÍ, LA IMPORTAMOS ARRIBA ---

@router.get("/", response_model=List[AuditLogRead], summary="Listar registros de auditoría")
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
    """
    # Verificación de Rol Simplificada
    # Si UserRead tiene el campo 'rol', úsalo directamente.
    if current_user.rol != "ADMIN":
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
    if current_user.rol != "ADMIN":
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