# app/db/__init__.py
from sqlmodel import create_engine, Session

# 1. Definimos el nombre del archivo de la base de datos
sqlite_file_name = "mora_comercial.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. Argumentos necesarios para SQLite (evita errores de hilos)
connect_args = {"check_same_thread": False}

# 3. Creamos el ENGINE (el motor de conexión)
# Esta es la variable que tu seed_data.py no encontraba
engine = create_engine(sqlite_url, connect_args=connect_args)

# 4. Función para obtener sesión (usada por FastAPI)
def get_session():
    with Session(engine) as session:
        yield session