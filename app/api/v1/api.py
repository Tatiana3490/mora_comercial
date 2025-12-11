from fastapi import APIRouter

# Importar los routers individuales que definen los endpoints
from app.api.v1.endpoints import user, client, articulo, presupuesto, auth, audit, dashboard

# Router principal
api_router = APIRouter(prefix="/v1")

# Incluir los routers individuales
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(audit.router, prefix="/audits", tags=["Auditoría"])
api_router.include_router(user.router, prefix="/usuarios", tags=["Usuarios"])
api_router.include_router(client.router, prefix="/clientes", tags=["Clientes"])
api_router.include_router(articulo.router, prefix="/articulos", tags=["Artículos"])
api_router.include_router(presupuesto.router, prefix="/presupuestos", tags=["Presupuestos"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

