# app/models/__init__.py

# Importar los modelos base para que SQLModel los encuentre
# (No importa si son 'table=True' o solo clases Base)

from .user import User, UserCreate, UserRead, UserReadInternal, UserBase
from .client import Client, ClientCreate, ClientRead, ClientBase
from .articulo import Articulo, ArticuloCreate, ArticuloRead, ArticuloBase
from .presupuesto import Presupuesto, PresupuestoCreate, PresupuestoRead, PresupuestoReadWithRelations, PresupuestoBase
from .presupuesto_linea import PresupuestoLinea, PresupuestoLineaCreate, PresupuestoLineaRead, PresupuestoLineaBase

# Opcional: Si quieres una variable que contenga todos los modelos base (SQLModel)
# Esto es útil si usas Alembic para migraciones, aunque no es estrictamente necesario 
# para la funcionalidad básica de SQLModel en SQLite.
# from sqlmodel import SQLModel

# class Base(SQLModel):
#     pass