# app/api/v1/endpoints/client.py

from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session, select

from app.db.session import get_session
from app.crud import client_crud
from app.models.client import Client, ClientCreate, ClientRead, ClientUpdate
from app.models.user import User  # Para validar el comercial propietario

router = APIRouter(tags=["Clientes"])


@router.get(
    "/",
    response_model=list[ClientRead],
    summary="Listar clientes",
)
def read_clients(*, session: Session = Depends(get_session)):
    """
    Lista todos los clientes.
    """
    clients = session.exec(select(Client)).all()
    return clients


@router.post(
    "/",
    response_model=ClientRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear cliente",
)
def create_client(
    *,
    session: Session = Depends(get_session),
    client_in: ClientCreate,
):
    """
    Crea un nuevo cliente y lo asigna a un comercial propietario.
    """

    # 1. Validar si el comercial propietario existe
    comercial = session.get(User, client_in.id_comercial_propietario)
    if not comercial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comercial con ID {client_in.id_comercial_propietario} no encontrado.",
        )

    # 2. Crear y guardar el cliente
    client_db = Client.model_validate(client_in)
    session.add(client_db)
    session.commit()
    session.refresh(client_db)
    return client_db


@router.get(
    "/{client_id}",
    response_model=ClientRead,
    summary="Obtener cliente",
)
def read_client(
    *,
    session: Session = Depends(get_session),
    client_id: int,
):
    """
    Obtener un cliente por su ID.
    """
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )
    return client


@router.put(
    "/{client_id}",
    response_model=ClientRead,
    summary="Actualizar cliente",
)
def update_client(
    *,
    session: Session = Depends(get_session),
    client_id: int,
    client_in: ClientUpdate,
):
    """
    Actualizar un cliente por su ID.
    """
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )

    client_db = client_crud.update_client(
        session=session,
        client=client,
        client_in=client_in,
    )
    return client_db


@router.delete(
    "/{client_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar cliente",
)
def delete_client(
    *,
    session: Session = Depends(get_session),
    client_id: int,
):
    """
    Eliminar un cliente por su ID.
    """
    client = session.get(Client, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado",
        )

    client_crud.delete_client(session=session, client=client)
    return
