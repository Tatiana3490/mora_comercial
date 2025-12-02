# app/crud/articulo_crud.py

from sqlmodel import Session, select
from app.models.articulo import Articulo, ArticuloCreate, ArticuloUpdate
from typing import Optional

# --- READ OPERATIONS ---

def get_articulo_by_id(session: Session, articulo_id: str) -> Optional[Articulo]:
    """Busca un artículo por su ID."""
    return session.get(Articulo, articulo_id)

def get_articulos(session: Session, skip: int = 0, limit: int = 100) -> list[Articulo]:
    """Lista todos los artículos del catálogo."""
    return session.exec(select(Articulo).offset(skip).limit(limit)).all()

# --- CREATE OPERATION ---

def create_articulo(session: Session, articulo_in: ArticuloCreate) -> Articulo:
    """Crea un nuevo artículo."""
    articulo_db = Articulo.model_validate(articulo_in)
    
    session.add(articulo_db)
    session.commit()
    session.refresh(articulo_db)
    return articulo_db

# --- UPDATE OPERATION ---

def update_articulo(
    session: Session,
    articulo: Articulo,
    articulo_in: ArticuloUpdate,
) -> Articulo:
    """
    Actualiza un artículo existente (parcialmente).

    Usamos model_dump()/dict(exclude_unset=True) para solo aplicar
    los campos que el cliente envíe en el body del PUT/PATCH.
    """
    # Compatibilidad Pydantic v1 / v2
    if hasattr(articulo_in, "model_dump"):
        data = articulo_in.model_dump(exclude_unset=True)
    else:
        data = articulo_in.dict(exclude_unset=True)

    for field, value in data.items():
        # Nunca tocamos la PK desde aquí por si acaso
        if field == "id":
            continue
        setattr(articulo, field, value)

    session.add(articulo)
    session.commit()
    session.refresh(articulo)
    return articulo

# --- DELETE OPERATION ---
def delete_articulo(session: Session, articulo: Articulo) -> None:
    """Elimina un artículo."""
    session.delete(articulo)
    session.commit()