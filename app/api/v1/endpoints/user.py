from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.crud import user_crud
from app.crud import audit_crud
from app.models.user import UserCreate, UserRead, UserUpdate, ROL_USUARIO
from app.db.session import get_session
from app.utils.security import get_current_user, get_password_hash
from app.core.rate_limiting import rate_limit, RATE_LIMITS

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
   # current_user = Depends(get_current_user),
    user_in: UserCreate
):
    """
    Crea un nuevo usuario (Comercial o Admin).
    Solo usuarios con rol ADMIN pueden crear usuarios.
    """
    # Autorizacion: solo ADMIN
   # if getattr(current_user, "rol", None) != "ADMIN":
    #    raise HTTPException(
    #       status_code=status.HTTP_403_FORBIDDEN,
    #       detail="Solo los administradores pueden crear usuarios"
    #   )

    # Verificar que el rol a crear sea válido
    if user_in.rol not in ROL_USUARIO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles permitidos: {', '.join(ROL_USUARIO)}"
        )

    existing_user = user_crud.get_user_by_email(session=session, email=user_in.email) 
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado."
        )

    # ### CAMBIO CRÍTICO DE SEGURIDAD: Hashear contraseña antes de guardar
    user_in.password = get_password_hash(user_in.password)

    user_db = user_crud.create_user(session=session, user_in=user_in)
    
    # Audit
    try:
        # ### CAMBIO: Usamos user_db.id (asumiendo que tu modelo usa 'id')
        audit_crud.create_audit(
            session, 
            action="create_user", 
       #     actor_email=getattr(current_user, "email", None), 
            target_email=getattr(user_db, "email", None), 
            details=f"id={getattr(user_db, 'id', None)}"
        )
    except Exception:
        pass
    return user_db

@router.get("/me", response_model=UserRead, summary="Obtener perfil actual")
def get_current_user_profile(*, current_user=Depends(get_current_user)):
    """Obtener el perfil del usuario autenticado."""
    return current_user

@router.get("/{user_id}", response_model=UserRead, summary="Obtener usuario")
def read_user(*, session: Session = Depends(get_session), current_user=Depends(get_current_user), user_id: int):
    """Obtener un usuario por su ID."""
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user

@router.put("/{user_id}", response_model=UserRead, summary="Actualizar usuario")
def update_user(
    *, 
    session: Session = Depends(get_session), 
    current_user=Depends(get_current_user), 
    user_id: int, 
    user_in: UserUpdate
):
    """Actualizar un usuario por su ID."""
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Permisos: Admin o el propio usuario
    # ### CAMBIO: Usamos user.id en vez de user_id suelto para comparar atributos del objeto
    current_id = getattr(current_user, "id", None)
    current_rol = getattr(current_user, "rol", None)
    
    if current_id != user_id and current_rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este usuario"
        )

    # Si intenta cambiar rol sin ser ADMIN
    if user_in.rol is not None and current_rol != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden cambiar el rol"
        )

    if user_in.rol is not None and user_in.rol not in ROL_USUARIO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol inválido. Roles permitidos: {', '.join(ROL_USUARIO)}"
        )

    # ### CAMBIO CRÍTICO: Si viene password nueva, la hasheamos
    if user_in.password:
        user_in.password = get_password_hash(user_in.password)

    user_db = user_crud.update_user(session=session, user=user, user_in=user_in)
    
    # Audit
    try:
        audit_crud.create_audit(
            session, 
            action="update_user", 
            actor_email=getattr(current_user, "email", None), 
            target_email=getattr(user_db, "email", None), 
            details=f"id={getattr(user_db, 'id', None)}"
        )
    except Exception:
        pass
    return user_db

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar usuario")
@rate_limit(RATE_LIMITS["delete_user"])
def delete_user(*, session: Session = Depends(get_session), current_user=Depends(get_current_user), user_id: int):
    """Eliminar un usuario por su ID. Solo ADMIN."""
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
        audit_crud.create_audit(
            session, 
            action="delete_user", 
            actor_email=getattr(current_user, "email", None), 
            target_email=getattr(user, "email", None), 
            details=f"id={getattr(user, 'id', None)}"
        )
    except Exception:
        pass
    return