from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.rate_limiting import setup_rate_limiting
from app.db.session import create_db_and_tables, engine
from app.api.v1.api import api_router
import os
from sqlmodel import Session

# Crear la aplicación
app = FastAPI(title=settings.APP_NAME)

# Configurar rate limiting (skip if running tests)
if not os.getenv("TESTING"):
    setup_rate_limiting(app)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica el dominio de Lovable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Evento de arranque
@app.on_event("startup")
def on_startup():
    """
    Crear tablas de la BD e inicializar usuario admin (si no existe).
    """
    create_db_and_tables()
    
    # Inicializar usuario admin automáticamente
    _init_admin_user()


def _init_admin_user():
    """
    Crear usuario administrador por defecto si no existe.
    Las credenciales se definen en app/core/config.py
    """
    from app.crud import user_crud
    from app.models.user import UserCreate
    
    try:
        with Session(engine) as session:
            # Verificar si el usuario admin ya existe
            admin = user_crud.get_user_by_email(session, settings.ADMIN_EMAIL)
            if not admin:
                # Crear usuario admin
                admin_in = UserCreate(
                    nombre="Administrador",
                    email=settings.ADMIN_EMAIL,
                    password=settings.ADMIN_PASSWORD,
                    rol="ADMIN"
                )
                admin = user_crud.create_user(session=session, user_in=admin_in)
    except Exception as e:
        # No fallar si hay error al crear admin (puede ser en test, permisos, etc.)
        pass

# Incluir el router de la API
app.include_router(api_router, prefix="/api")

# Servir archivos estáticos del backend (imágenes)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Servir archivos estáticos del frontend (JS, CSS, etc.)
FRONTEND_DIR = "app/brick-catalog-pro-main/dist"

# Montar assets del frontend
app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIR}/assets"), name="assets")

# Ruta catch-all para servir el index.html del frontend (SPA)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Si la ruta empieza por /api o /static, dejamos que FastAPI la maneje (o devuelva 404 si no existe)
    if full_path.startswith("api") or full_path.startswith("static"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Para cualquier otra ruta, servimos index.html
    return FileResponse(f"{FRONTEND_DIR}/index.html")