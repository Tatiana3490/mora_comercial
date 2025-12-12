# app/crud/user_crud.py

from typing import List, Optional

from sqlmodel import Session, select

from app.models.user import User, UserCreate, UserUpdate
from app.utils.security import hash_password


def get_user(session: Session, user_id: int) -> Optional[User]:
    """Obtiene un usuario por ID."""
    return session.get(User, user_id)


#def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """Obtiene un usuario por email."""
#    statement = select(User).where(User.email == email)
#    return session.exec(statement).first()
def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()

def get_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Lista usuarios con paginación simple."""
    statement = select(User).offset(skip).limit(limit)
    return session.exec(statement).all()


#def create_user(session: Session, user_in: UserCreate) -> User:
    """Crea un usuario nuevo con contraseña hasheada."""
#    from app.utils.security import hash_password
    
#    user = User(
#        nombre=user_in.nombre,
#        email=user_in.email,
#        rol=user_in.rol,
#        activo=user_in.activo,
#        password_hash=hash_password(user_in.password),
#    )
#    session.add(user)
#    session.commit()
#    session.refresh(user)
#    return user

def create_user(*, session: Session, user_in: UserCreate) -> User:
    # 1. Hashear la contraseña usando la función importada
    hashed_pass = hash_password(user_in.password)

    # 2. Crear el objeto usuario
    user_db = User(
        nombre=user_in.nombre,
        apellidos=user_in.apellidos,
        email=user_in.email,
        password_hash=hashed_pass, # Guardamos el hash, no la pass plana
        rol=user_in.rol,
        activo=user_in.activo
    )
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db


def update_user(session: Session, user: User, user_in: UserUpdate) -> User:
    """Actualiza un usuario existente (parcialmente)."""

    if user_in.nombre is not None:
        user.nombre = user_in.nombre

    if user_in.email is not None:
        user.email = user_in.email

    if user_in.rol is not None:
        user.rol = user_in.rol

    if user_in.activo is not None:
        user.activo = user_in.activo

    # Si llega una nueva contraseña, la re-hasheamos
    if user_in.password is not None:
        user.password_hash = hash_password(user_in.password)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: User) -> None:
    """Elimina un usuario."""
    session.delete(user)
    session.commit()
