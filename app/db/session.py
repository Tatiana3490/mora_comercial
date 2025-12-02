# app/db/session.py

import os
from sqlmodel import create_engine, SQLModel, Session

# 1. Definición de la ruta a la base de datos
# Como session.py está en app/db, necesitamos ir dos niveles hacia atrás (../../)
# para encontrar mora_comercial.db en la raíz del proyecto.
# Usamos un path absoluto para evitar problemas de rutas relativas al ejecutar la app.

# Obtiene la ruta al directorio actual (app/db)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Define la ruta absoluta al archivo de la base de datos
DB_FILE = os.path.join(BASE_DIR, '..', '..', 'mora_comercial.db')

# URI de conexión de SQLite (con tres barras)
sqlite_file_name = "sqlite:///" + DB_FILE

# Bandera de eco (muestra el SQL generado en la consola)
ECHO_SQL = False 

# 2. Creación del motor (Engine)
# 'connect_args' es necesario para activar las Foreign Keys en SQLite
engine = create_engine(
    sqlite_file_name, 
    echo=ECHO_SQL, 
    connect_args={"check_same_thread": False, "isolation_level": None} 
    # check_same_thread=False es necesario para FastAPI/SQLModel en SQLite
)


# 3. Función para crear las tablas
def create_db_and_tables():
    """
    Crea todas las tablas definidas en los modelos (app/models) si aún no existen.
    Esta función solo debe ejecutarse la primera vez.
    """
    print("Intentando crear tablas en la base de datos...")
    # Importamos todos los modelos aquí para que SQLModel los conozca
    # Importante: Asegúrate de que app/models/__init__.py importa todos los modelos (User, Client, etc.)
    import app.models
    
    SQLModel.metadata.create_all(engine)
    print("Tablas creadas/verificadas.")


# 4. Función generadora de sesiones (dependencia para FastAPI)
# Usada por los endpoints para obtener una conexión a la base de datos
def get_session():
    """
    Generador que provee una nueva sesión de base de datos y la cierra al finalizar.
    """
    with Session(engine) as session:
        yield session