from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select
from app.crud import articulo_crud

from app.models.articulo import Articulo, ArticuloCreate, ArticuloRead, ArticuloUpdate
from app.db.session import get_session

router = APIRouter(tags=["Articulos"])


@router.get("/", response_model=list[ArticuloRead], summary="Listar articulos")
def read_articulos(*, session: Session = Depends(get_session)):
    """Lista todos los artículos del catálogo."""
    articulos = session.exec(select(Articulo)).all()
    return articulos


@router.post("/", response_model=ArticuloRead, status_code=status.HTTP_201_CREATED, summary="Crear articulo")
def create_articulo(*, session: Session = Depends(get_session), articulo_in: ArticuloCreate):
    """
    Crea un nuevo artículo (ladrillo) en el catálogo.
    """
    articulo_db = Articulo.model_validate(articulo_in)
    
    session.add(articulo_db)
    session.commit()
    session.refresh(articulo_db)
    return articulo_db


@router.get("/{articulo_id}", response_model=ArticuloRead, summary="Obtener articulo")
def read_articulo(*, session: Session = Depends(get_session), articulo_id: str):
    """Obtener un artículo por su ID."""
    articulo = session.get(Articulo, articulo_id)
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Articulo no encontrado"
        )
    return articulo


@router.put("/{articulo_id}", response_model=ArticuloRead, summary="Actualizar articulo")
def update_articulo(*, session: Session = Depends(get_session), articulo_id: str, articulo_in: ArticuloUpdate):
    """Actualizar un artículo por su ID."""
    articulo = session.get(Articulo, articulo_id)
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Articulo no encontrado"
        )
    articulo_db = articulo_crud.update_articulo(session=session, articulo=articulo, articulo_in=articulo_in)
    return articulo_db


@router.delete("/{articulo_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar articulo")
def delete_articulo(*, session: Session = Depends(get_session), articulo_id: str):
    """Eliminar un artículo por su ID."""
    articulo = session.get(Articulo, articulo_id)
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Articulo no encontrado"
        )
    articulo_crud.delete_articulo(session=session, articulo=articulo)
    return


