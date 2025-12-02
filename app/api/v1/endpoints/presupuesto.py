# app/api/v1/endpoints/presupuesto.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.crud import presupuesto_crud
from app.models.presupuesto import (
    PresupuestoCompletoCreate,
    PresupuestoCompletoRead,
    PresupuestoUpdate,
)

router = APIRouter(tags=["Presupuestos"])


# ==================================
#   LISTAR PRESUPUESTOS (COMPLETOS)
# ==================================
@router.get(
    "/",
    response_model=List[PresupuestoCompletoRead],
    status_code=status.HTTP_200_OK,
    summary="Listar presupuestos (cabeceras + líneas + totales)",
)
def list_presupuestos(
    *,
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
) -> List[PresupuestoCompletoRead]:
    """
    Listar presupuestos con paginación.

    Devuelve:
    - Cabecera del presupuesto
    - Líneas de detalle
    - Totales calculados (total_bruto, total_descuento, total_neto)
    """
    return presupuesto_crud.get_presupuestos_completos(
        session=session,
        skip=skip,
        limit=limit,
    )


# ==================================
#   CREAR PRESUPUESTO COMPLETO
# ==================================
@router.post(
    "/",
    response_model=PresupuestoCompletoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear presupuesto completo",
)
def create_presupuesto_completo_api(
    *,
    session: Session = Depends(get_session),
    presupuesto_in: PresupuestoCompletoCreate,
) -> PresupuestoCompletoRead:
    """
    Crea un presupuesto completo (cabecera + líneas) en una sola llamada.

    Valida:
    - Que el id_cliente exista
    - Que todos los id_articulo de las líneas existan
    """
    presupuesto_db = presupuesto_crud.create_presupuesto_completo(
        session=session,
        presupuesto_in=presupuesto_in,
    )
    # Devolvemos el presupuesto montado como PresupuestoCompletoRead
    return presupuesto_crud.build_presupuesto_completo_read(presupuesto_db)


# ==================================
#   LEER PRESUPUESTO POR ID
# ==================================
@router.get(
    "/{presupuesto_id}",
    response_model=PresupuestoCompletoRead,
    status_code=status.HTTP_200_OK,
    summary="Leer presupuesto por ID",
)
def read_presupuesto(
    *,
    presupuesto_id: int,
    session: Session = Depends(get_session),
) -> PresupuestoCompletoRead:
    """
    Devuelve un presupuesto por ID, incluyendo:
    - Cabecera
    - Líneas
    - Totales
    """
    presupuesto_read = presupuesto_crud.get_presupuesto_completo_by_id(
        session=session,
        presupuesto_id=presupuesto_id,
    )
    if not presupuesto_read:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado",
        )
    return presupuesto_read


# ==================================
#   LISTAR POR CLIENTE
# ==================================
@router.get(
    "/cliente/{cliente_id}",
    response_model=List[PresupuestoCompletoRead],
    status_code=status.HTTP_200_OK,
    summary="Listar presupuestos por cliente",
)
def read_presupuestos_by_cliente(
    *,
    cliente_id: int,
    session: Session = Depends(get_session),
) -> List[PresupuestoCompletoRead]:
    """
    Lista todos los presupuestos de un cliente, devolviendo:
    - Cabecera
    - Líneas
    - Totales por presupuesto
    """
    return presupuesto_crud.get_presupuestos_completos_by_client(
        session=session,
        client_id=cliente_id,
    )


# ==================================
#   ACTUALIZAR CABECERA
# ==================================
@router.put(
    "/{presupuesto_id}",
    response_model=PresupuestoCompletoRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar presupuesto (solo cabecera)",
)
def update_presupuesto(
    *,
    presupuesto_id: int,
    presupuesto_in: PresupuestoUpdate,
    session: Session = Depends(get_session),
) -> PresupuestoCompletoRead:
    """
    Actualiza la **cabecera** de un presupuesto existente.
    (No modifica las líneas de detalle.)
    """
    presupuesto_db = presupuesto_crud.get_presupuesto_by_id(
        session=session,
        presupuesto_id=presupuesto_id,
    )
    if not presupuesto_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado",
        )

    presupuesto_db = presupuesto_crud.update_presupuesto(
        session=session,
        presupuesto=presupuesto_db,
        presupuesto_in=presupuesto_in,
    )

    # Devolvemos el presupuesto actualizado como PresupuestoCompletoRead
    return presupuesto_crud.build_presupuesto_completo_read(presupuesto_db)


# ==================================
#   ELIMINAR
# ==================================
@router.delete(
    "/{presupuesto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar presupuesto",
)
def delete_presupuesto(
    *,
    presupuesto_id: int,
    session: Session = Depends(get_session),
) -> None:
    """
    Elimina un presupuesto por su ID (cabecera + líneas).
    """
    presupuesto_db = presupuesto_crud.get_presupuesto_by_id(
        session=session,
        presupuesto_id=presupuesto_id,
    )
    if not presupuesto_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presupuesto no encontrado",
        )

    presupuesto_crud.delete_presupuesto(
        session=session,
        presupuesto=presupuesto_db,
    )
    return
