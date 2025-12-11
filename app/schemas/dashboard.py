from sqlmodel import SQLModel

class DashboardStats(SQLModel):
    # --- Tarjetas Superiores ---
    ventas_mensuales: float = 0.0  # FALTABA ESTE: Para mostrar "€24,500"
    total_presupuestos_activos: int = 0
    nuevos_clientes_mes: int = 0
    articulos_mas_vendidos: int = 0

    # --- Desglose (opcional para gráficas o detalles internos) ---
    total_clientes: int
    presupuestos_pendientes: int  # ENVIADO_ADMIN
    presupuestos_aprobados: int   # APROBADO
    presupuestos_denegados: int   # DENEGADO
    presupuestos_borrador: int    # Extra: útil para saber cuánto trabajo hay en curso
    