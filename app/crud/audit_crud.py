from sqlmodel import Session, select
from datetime import datetime
from app.models.audit import AuditLog


def create_audit(session: Session, action: str, actor_email: str | None = None, target_email: str | None = None, details: str | None = None) -> AuditLog:
    """Crea un registro de auditoría simple."""
    audit = AuditLog(action=action, actor_email=actor_email, target_email=target_email, details=details)
    session.add(audit)
    session.commit()
    session.refresh(audit)
    return audit


def list_audit_logs(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    actor_email: str | None = None,
    target_email: str | None = None,
    action: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> list[AuditLog]:
    """
    Lista registros de auditoría con filtros opcionales.
    """
    query = select(AuditLog)
    
    if actor_email:
        query = query.where(AuditLog.actor_email == actor_email)
    if target_email:
        query = query.where(AuditLog.target_email == target_email)
    if action:
        query = query.where(AuditLog.action == action)
    if date_from:
        query = query.where(AuditLog.timestamp >= date_from)
    if date_to:
        query = query.where(AuditLog.timestamp <= date_to)
    
    # Ordenar por timestamp descendente (más recientes primero)
    query = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)
    
    return session.exec(query).all()


def count_audit_logs(
    session: Session,
    actor_email: str | None = None,
    target_email: str | None = None,
    action: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> int:
    """
    Cuenta registros de auditoría con filtros opcionales.
    """
    query = select(AuditLog)
    
    if actor_email:
        query = query.where(AuditLog.actor_email == actor_email)
    if target_email:
        query = query.where(AuditLog.target_email == target_email)
    if action:
        query = query.where(AuditLog.action == action)
    if date_from:
        query = query.where(AuditLog.timestamp >= date_from)
    if date_to:
        query = query.where(AuditLog.timestamp <= date_to)
    
    return session.query(AuditLog).filter(*[c for c in query.whereclause.clauses if c is not None]).count() if query.whereclause is not None else session.query(AuditLog).count()
