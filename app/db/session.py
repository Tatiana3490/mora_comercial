import os
from sqlmodel import create_engine, SQLModel, Session

# 1. Definición de la ruta a la base de datos
# Buscamos la carpeta raíz del proyecto (donde estará tu archivo .db)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# El archivo se guardará en la raíz del proyecto para que sea fácil de encontrar
DB_PATH = os.path.join(BASE_DIR, "mora_comercial.db")

# URI de conexión de SQLite (con tres barras)
sqlite_url = f"sqlite:///{DB_PATH}"

# 2. Creación del motor (Engine)
# 'check_same_thread=False' es vital para que FastAPI funcione con SQLite
engine = create_engine(
    sqlite_url, 
    echo=False, 
    connect_args={"check_same_thread": False} 
)

# 3. Función para crear las tablas
def create_db_and_tables():
    """Crea las tablas en el NAS si no existen."""
    import app.models # Aseguramos que SQLModel vea tus modelos
    SQLModel.metadata.create_all(engine)

# 4. Función generadora de sesiones
def get_session():
    with Session(engine) as session:
        yield session