# app/crud/client_crud.py

from sqlmodel import Session, select
from app.models.client import Client, ClientCreate, ClientUpdate
from app.models.user import User
from typing import Optional

# --- READ OPERATIONS ---

def get_client_by_id(session: Session, client_id: int) -> Optional[Client]:
    """Busca un cliente por su ID."""
    return session.get(Client, client_id)

def get_clients(session: Session, skip: int = 0, limit: int = 100) -> list[Client]:
    """Lista todos los clientes."""
    return session.exec(select(Client).offset(skip).limit(limit)).all()

# --- CREATE OPERATION ---

def create_client(session: Session, client_in: ClientCreate) -> Client:
    """
    Crea un nuevo cliente. Asume que la validación de la FK
    (id_comercial_propietario) se realiza en el endpoint.
    """
    client_db = Client.model_validate(client_in)
    
    session.add(client_db)
    session.commit()
    session.refresh(client_db)
    return client_db

# --- UPDATE OPERATION ---

def update_client(session: Session, client: Client, client_in: ClientUpdate) -> Client:
    """
    Actualiza un cliente existente (parcialmente).

    Usamos model_dump(exclude_unset=True) para solo actualizar
    los campos que vengan en el body del PUT/PATCH.
    """
    # Para Pydantic v2 / SQLModel v0.0.22+
    data_update = client_in.model_dump(exclude_unset=True)

    for field_name, value in data_update.items():
        setattr(client, field_name, value)

    session.add(client)
    session.commit()
    session.refresh(client)
    return client

# --- DELETE OPERATION ---
def delete_client(session: Session, client: Client) -> None:
    """Elimina un cliente."""
    session.delete(client)
    session.commit()

# --- RELATIONAL READ (Opcional, pero útil) ---

def get_clients_by_comercial(session: Session, comercial_id: int) -> list[Client]:
    """Lista los clientes asignados a un comercial específico."""
    return session.exec(
        select(Client).where(Client.id_comercial_propietario == comercial_id)
    ).all()