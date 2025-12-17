from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

# Modelo de Base de Datos
class Nota(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contenido: str
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    id_cliente: int = Field(index=True) # A qué cliente pertenece
    id_usuario: int = Field(index=True) # Quién la escribió (SOLO este usuario podrá verla)

# Esquema para crear una nota (lo que recibe la API)
class NotaCreate(SQLModel):
    contenido: str
    id_cliente: int

# Esquema para leer (lo que devuelve la API)
class NotaRead(SQLModel):
    id: int
    contenido: str
    fecha_creacion: datetime
    id_usuario: int