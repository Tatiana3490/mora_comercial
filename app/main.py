from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. IMPORTANTE: Importamos el router principal que creaste antes
# (Asegúrate de que este archivo existe en app/api/v1/api.py)
from app.api.v1.api import api_router 

app = FastAPI(title="Mora Comercial API")

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

# --- 2. IMPORTANTE: CONECTAMOS LAS RUTAS ---
# Esta línea es la que hacía que te saliera "Not Found". 
# Ahora la API ya sabe dónde están tus endpoints (/dashboard, /clientes, etc.)
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"mensaje": "La API está funcionando correctamente y conectada 🚀"}