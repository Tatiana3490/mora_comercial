// app/services/dashboardService.js

// 1. Define la URL base de tu API (FastAPI suele correr en el puerto 8000)
// Si en el futuro subes esto a producción, cambiarás esta URL.
const API_URL = '${import.meta.env.VITE_API_URL}/api'; 

/**
 * Obtiene las estadísticas para el Dashboard (Inicio)
 * Retorna un objeto con total_clientes, presupuestos_pendientes, etc.
 */
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ...` // Descomentar si usas token
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getDashboardStats:", error);
    return null; // Retornamos null para que el componente sepa que falló
  }
};