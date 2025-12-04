from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.crud import user_crud
from app.crud import audit_crud
from app.models.user import UserCreate, UserRead, UserUpdate, ROL_USUARIO
from app.db.session import get_session
from app.core.security import get_current_user
from app.core.rate_limiting import rate_limit, RATE_LIMITS

# SIN prefix aquí (porque lo ponemos en api_router.include_router)
router = APIRouter(tags=["Usuarios"])


@router.get("/", response_model=list[UserRead], summary="Listar usuarios")
def read_users(*, session: Session = Depends(get_session), current_user=Depends(get_current_user)):
    """Lista todos los usuarios activos (requiere autenticación)."""
    users = user_crud.get_users(session)
    return users


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED, summary="Crear usuario")
@rate_limit(RATE_LIMITS["create_user"])
def create_user_api(
    *,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user),
    user_in: UserCreate
):
    """
    Crea un nuevo usuario (Comercial o Admin).
    Solo usuarios con rol ADMIN pueden crear usuarios.
    
    Rate limit: 10 creaciones por hora por IP.
    """
    # Autorizacion: solo ADMIN
    if getattr(current_user, "rol", None) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden crear usuarios"
        )

    # Verificar que el rol a crear sea válido (defensa adicional)
    if user_in.rol not in ROL_USUARIO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles permitidos: {', '.join(ROL_USUARIO)}"
        )

    existing_user = user_crud.get_user_by_email(session, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado."
        )

    user_db = user_crud.create_user(session=session, user_in=user_in)
    # Audit
    try:
        audit_crud.create_audit(session, action="create_user", actor_email=getattr(current_user, "email", None), target_email=getattr(user_db, "email", None), details=f"id={getattr(user_db,'id_usuario', None)}")
    except Exception:
        # Don't fail the request if audit logging fails; optionally log in real app
        pass
    return user_db


@router.get("/me", response_model=UserRead, summary="Obtener perfil actual")
def get_current_user_profile(*, current_user=Depends(get_current_user)):
    """Obtener el perfil del usuario autenticado (requiere autenticación)."""
    return current_user


@router.get("/{user_id}", response_model=UserRead, summary="Obtener usuario")
def read_user(*, session: Session = Depends(get_session), current_user=Depends(get_current_user), user_id: int):
    """Obtener un usuario por su ID (requiere autenticación)."""
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user


@router.put("/{user_id}", response_model=UserRead, summary="Actualizar usuario")
def update_user(*, session: Session = Depends(get_session), current_user=Depends(get_current_user), user_id: int, user_in: UserUpdate):
    """Actualizar un usuario por su ID.

    - El usuario puede actualizar su propio perfil
    - Solo ADMIN puede actualizar otros usuarios / cambiar roles
    """
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Si no es admin y no es el mismo usuario, rechazar
    if getattr(current_user, "id_usuario", None) != user_id and getattr(current_user, "rol", None) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este usuario"
        )

    # Si intenta cambiar rol sin ser ADMIN
    if user_in.rol is not None and getattr(current_user, "rol", None) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden cambiar el rol"
        )

    # Validar rol (defensa adicional)
    if user_in.rol is not None and user_in.rol not in ROL_USUARIO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles permitidos: {', '.join(ROL_USUARIO)}"
        )

    user_db = user_crud.update_user(session=session, user=user, user_in=user_in)
    # Audit
    try:
        audit_crud.create_audit(session, action="update_user", actor_email=getattr(current_user, "email", None), target_email=getattr(user_db, "email", None), details=f"id={getattr(user_db,'id_usuario', None)}")
    except Exception:
        pass
    return user_db


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar usuario")
@rate_limit(RATE_LIMITS["delete_user"])
def delete_user(*, session: Session = Depends(get_session), current_user=Depends(get_current_user), user_id: int):
    """
    Eliminar un usuario por su ID. Solo ADMIN puede eliminar usuarios.
    
    Rate limit: 5 eliminaciones por hora por IP.
    """
    # Autorizacion
    if getattr(current_user, "rol", None) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden eliminar usuarios"
        )

    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    user_crud.delete_user(session=session, user=user)
    # Audit
    try:
        audit_crud.create_audit(session, action="delete_user", actor_email=getattr(current_user, "email", None), target_email=getattr(user, "email", None), details=f"id={getattr(user,'id_usuario', None)}")
    except Exception:
        pass
    return

