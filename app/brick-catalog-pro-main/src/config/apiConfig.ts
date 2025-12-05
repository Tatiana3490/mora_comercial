/**
 * API Configuration
 * 
 * Archivo centralizado para la configuración de la API del backend.
 * Usa variables de entorno de Vite para determinar la URL base.
 * 
 * En desarrollo: http://localhost:8000/api/v1
 * En producción: https://api.moracomericial.com/api/v1 (ajustable en .env)
 */

// Obtener la URL base de la API desde variables de entorno
// VITE_API_BASE_URL se define en .env.local / .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Fallback a ruta relativa si no está definida (para compatibilidad)
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

/**
 * Crear una URL completa para una ruta de API
 * @param endpoint - La ruta del endpoint, ej: "/usuarios/me"
 * @returns URL completa para la llamada fetch
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Asegurar que endpoint empieza con /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Si baseUrl es absoluto (tiene protocolo), concatenar directamente
  if (baseUrl.startsWith("http")) {
    return `${baseUrl}${path}`;
  }
  
  // Si es relativo, usar como antes
  return `${baseUrl}${path}`;
};

export default {
  API_BASE_URL,
  getApiBaseUrl,
  getApiUrl,
};
