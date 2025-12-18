from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.user import User
from app.utils.security import hash_password
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints import notas


from app.api.v1.api import api_router 

app = FastAPI(title="Mora Comercial API")

app.mount("/static", StaticFiles(directory="app/static"), name="static")


# --- CONFIGURACIÓN CORS ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*"  # Permitimos todo temporalmente para asegurar conexión
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


debug_router = APIRouter(prefix="/debug", tags=["Debug"])
@debug_router.get("/fix-password")
def fix_jefe_password(session: Session = Depends(get_session)):
    # 1. Buscar al usuario Jefe
    email_objetivo = "adminmora@gmail.com"
    user = session.exec(select(User).where(User.email == email_objetivo)).first()
    
    if not user:
        return {"error": f"Usuario {email_objetivo} no encontrado"}
    
    # 2. Forzar la contraseña a '1234' (hasheada UNA SOLA VEZ)
    nueva_pass = "Adminmora1@"
    user.password_hash = hash_password(nueva_pass)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return {
        "msg": "✅ Contraseña arreglada manualmente",
        "usuario": user.email,
        "nueva_password_temporal": nueva_pass,
        "nuevo_hash": user.password_hash
    }
# --- 2. IMPORTANTE: CONECTAMOS LAS RUTAS ---

# Ahora la API ya sabe dónde están tus endpoints (/dashboard, /clientes, etc.)
app.include_router(api_router)



@app.get("/")
def read_root():
    return {"mensaje": "La API está funcionando correctamente y conectada 🚀"}