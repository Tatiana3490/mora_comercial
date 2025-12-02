from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session 

from app.crud import user_crud
from app.models.user import UserCreate, UserRead, UserUpdate
from app.db.session import get_session

# SIN prefix aquí (porque lo ponemos en api_router.include_router)
router = APIRouter(tags=["Usuarios"])


@router.get("/", response_model=list[UserRead], summary="Listar usuarios")
def read_users(*, session: Session = Depends(get_session)):
    """Lista todos los usuarios activos (Delegando al CRUD)."""
    users = user_crud.get_users(session)
    return users


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED, summary="Crear usuario")
def create_user_api(
    *, 
    session: Session = Depends(get_session), 
    user_in: UserCreate
):
    """
    Crea un nuevo usuario (Comercial o Admin).
    La lógica de hashing y guardado se delega al user_crud.
    """
    existing_user = user_crud.get_user_by_email(session, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado."
        )

    user_db = user_crud.create_user(session=session, user_in=user_in)
    return user_db


@router.get("/{user_id}", response_model=UserRead,summary="Obtener usuario")
def read_user(*, session: Session = Depends(get_session), user_id: int):
    """Obtener un usuario por su ID (Delegando al CRUD)."""
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user


@router.put("/{user_id}", response_model=UserRead,summary="Actualizar usuario")
def update_user(*, session: Session = Depends(get_session), user_id: int, user_in: UserUpdate):
    """Actualizar un usuario por su ID (Delegando al CRUD)."""
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    user_db = user_crud.update_user(session=session, user=user, user_in=user_in)
    return user_db


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT,summary="Eliminar usuario")
def delete_user(*, session: Session = Depends(get_session), user_id: int):
    """Eliminar un usuario por su ID (Delegando al CRUD)."""
    user = user_crud.get_user(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    user_crud.delete_user(session=session, user=user)
    return

