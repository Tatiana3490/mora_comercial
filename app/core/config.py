# app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Se recomienda usar pydantic-settings para manejar la configuración.
# Asegúrate de instalarla si aún no lo has hecho: pip install 'pydantic-settings[dotenv]'

class Settings(BaseSettings):
    """
    Configuración base de la aplicación.
    Las variables se leen automáticamente de las variables de entorno o de un archivo .env.
    """
    
    # --- Configuración General de la API ---
    APP_NAME: str = "Mora Comercial API"
    DESCRIPTION: str = "API para la gestión de presupuestos y clientes de Ladrillera Mora."
    API_V1_STR: str = "/v1"

    # --- Configuración de URL Base ---
    # Usada para generar URLs completas para imágenes estáticas
    BASE_URL: str = "http://localhost:8000"
    
    # --- Configuración de Seguridad (Ejemplos) ---
    SECRET_KEY: str = "UNA_CLAVE_SUPER_SECRETA_Y_LARGA" 
    # ^^^ CAMBIAR ESTO EN PRODUCCIÓN ^^^
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # --- Configuración de la Base de Datos ---
    # Nota: La URL de DB la manejamos en session.py, pero es bueno tener una variable aquí.
    # En proyectos grandes, esta variable se usaría para crear el motor.
    DATABASE_FILE: str = "mora_comercial.db"
    
    # --- Configuración de Usuario Admin Automático ---
    # Credenciales para el usuario administrador inicial
    # Se crea automáticamente en el startup si no existe
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "AdminPass123"
    
    # Configuración de Pydantic: Carga variables de entorno desde un archivo .env
    model_config = SettingsConfigDict(
        env_file='.env',
        extra='ignore' # Ignorar variables de entorno no definidas en esta clase
    )

# Crear una instancia global para que se pueda importar fácilmente
settings = Settings()