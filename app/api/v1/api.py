from fastapi import APIRouter

# Importar los routers individuales que definen los endpoints
from app.api.v1.endpoints import user, client, articulo, presupuesto

# Router principal
api_router = APIRouter(prefix="/v1")

# Incluir los routers individuales
api_router.include_router(user.router, prefix="/usuarios")
api_router.include_router(client.router, prefix="/clientes")
api_router.include_router(articulo.router, prefix="/articulos")
api_router.include_router(presupuesto.router, prefix="/presupuestos")
