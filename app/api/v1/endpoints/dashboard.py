from typing import Dict, Any, List
from datetime import date
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, SQLModel
from sqlalchemy.orm import selectinload #para poder traer los datos del cliente

from app.db import get_session
from app.models.client import Client
from app.models.presupuesto import Presupuesto

router = APIRouter(tags=["Dashboard"])

# 1. Esquema de Respuesta
class DashboardStats(SQLModel):
    ventas_mensuales: float = 0.0 
    total_presupuestos_activos: int = 0
    nuevos_clientes_mes: int = 0 
    
    total_clientes: int
    presupuestos_pendientes: int
    presupuestos_aprobados: int
    presupuestos_denegados: int
    presupuestos_borrador: int

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(session: Session = Depends(get_session)) -> DashboardStats:
    
    # --- CALCULAR FECHAS ---
    hoy = date.today()
    inicio_mes = hoy.replace(day=1) 

    # --- A. Ventas Mensuales (APROBADOS este mes) ---
    query_ventas = select(func.sum(Presupuesto.total)).where(
        Presupuesto.estado == "APROBADO",
        Presupuesto.fecha_presupuesto >= inicio_mes
    )
    
    # ### CORRECCIÓN 2: Unificar nombres de variables
    resultado_ventas = session.exec(query_ventas).first()
    # Aquí antes ponías "result_ventas", pero la variable de arriba es "resultado_ventas"
    ventas_mensuales = resultado_ventas if resultado_ventas else 0.0

    # --- B. Nuevos Clientes ---
    nuevos_clientes = 0 # (Lógica pendiente, lo dejamos a 0 por ahora)

    # --- C. Clientes Totales ---
    count_clientes = session.exec(select(func.count()).select_from(Client)).one()

    # --- D. Presupuestos por Estado ---
    statement = (
        select(Presupuesto.estado, func.count())
        .select_from(Presupuesto)
        .group_by(Presupuesto.estado)
    )
    results = session.exec(statement).all()
    
    stats_map: Dict[str, int] = {estado: total for estado, total in results}

    pendientes = stats_map.get("ENVIADO_ADMIN", 0)
    aprobados = stats_map.get("APROBADO", 0)
    denegados = stats_map.get("DENEGADO", 0)
    borradores = stats_map.get("BORRADOR", 0)

    activos = pendientes + borradores 

    return DashboardStats(
        ventas_mensuales=ventas_mensuales,
        total_presupuestos_activos=activos,
        nuevos_clientes_mes=nuevos_clientes,
        total_clientes=count_clientes,
        presupuestos_pendientes=pendientes,
        presupuestos_aprobados=aprobados,
        presupuestos_denegados=denegados,
        presupuestos_borrador=borradores
    )

# Cambiar el response_model
# Al usar selectinload, el objeto Presupuesto ya incluirá dentro los datos del cliente.
@router.get("/history", response_model=List[Presupuesto]) 
def get_dashboard_history(session: Session = Depends(get_session)):
    """
    Devuelve los últimos presupuestos incluyendo los datos del cliente real.
    """
    # 1. Creamos la consulta
    statement = (
        select(Presupuesto)
        # Esto le dice a la BD: "Traete también los datos del cliente asociado"
        .options(selectinload(Presupuesto.cliente)) 
        .order_by(Presupuesto.fecha_presupuesto.desc()) 
        .limit(10) 
    )