from fastapi import APIRouter

# Importar los routers individuales que definen los endpoints
from app.api.v1.endpoints import notas, user, client, articulo, presupuesto, auth, audit, dashboard

# Router principal
api_router = APIRouter(prefix="/v1")

# Incluir los routers individuales
api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(audit.router, prefix="/audits")
api_router.include_router(user.router, prefix="/usuarios")
api_router.include_router(client.router, prefix="/clientes")
api_router.include_router(articulo.router, prefix="/articulos")
api_router.include_router(presupuesto.router, prefix="/presupuestos")
api_router.include_router(dashboard.router, prefix="/dashboard")
api_router.include_router(notas.router, prefix="/notas") 
 

