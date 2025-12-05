#!/usr/bin/env python
"""
Script para inicializar la base de datos de Mora Comercial API.

Este script:
1. Crea las tablas de la BD (si no existen)
2. Crea un usuario administrador por defecto
3. Muestra las credenciales para acceder

Uso:
    python scripts/init_db.py              # Usar valores por defecto
    python scripts/init_db.py --admin-email custom@example.com --admin-password MiPassword123
    python scripts/init_db.py --help       # Ver todas las opciones
"""

import os
import sys
import argparse
from pathlib import Path

# Agregar el directorio raíz al path para importar app
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, create_engine
from app.db.session import create_db_and_tables, engine, DB_FILE
from app.models.user import User
from app.crud import user_crud
from app.models.user import UserCreate
from app.core.security import hash_password


def init_database(
    admin_email: str = "admin@example.com",
    admin_password: str = "AdminPass123",
    admin_name: str = "Administrador",
    force: bool = False
):
    """
    Inicializar la base de datos y crear un usuario administrador.
    
    Args:
        admin_email: Email del administrador
        admin_password: Contraseña del administrador (será hasheada)
        admin_name: Nombre del administrador
        force: Si es True, elimina el usuario admin si existe y lo recrea
    """
    
    print("=" * 70)
    print("INICIALIZANDO BASE DE DATOS - Mora Comercial API")
    print("=" * 70)
    print()
    
    # Obtener URL de la BD
    print(f"[INFO] Archivo de BD: {DB_FILE}")
    print()
    
    # Crear tablas
    print("[1/3] Creando tablas de la base de datos...")
    try:
        create_db_and_tables()
        print("[✓] Tablas creadas correctamente")
    except Exception as e:
        print(f"[✗] Error al crear tablas: {e}")
        return False
    print()
    
    # Conectar a la BD (usar el engine existente)
    # Crear o actualizar usuario admin
    print("[2/3] Creando usuario administrador...")
    try:
        with Session(engine) as session:
            # Buscar si existe usuario admin
            existing_admin = user_crud.get_user_by_email(session, admin_email)
            
            if existing_admin:
                if force:
                    print(f"[INFO] Usuario {admin_email} ya existe. Actualizando (force=True)...")
                    # Actualizar contraseña y nombre
                    existing_admin.nombre = admin_name
                    existing_admin.password_hash = hash_password(admin_password)
                    existing_admin.rol = "ADMIN"
                    session.add(existing_admin)
                    session.commit()
                    print(f"[✓] Usuario {admin_email} actualizado")
                else:
                    print(f"[INFO] Usuario {admin_email} ya existe. Saltando creación.")
                    admin_user = existing_admin
            else:
                # Crear usuario admin
                admin_in = UserCreate(
                    nombre=admin_name,
                    email=admin_email,
                    password=admin_password,
                    rol="ADMIN"
                )
                admin_user = user_crud.create_user(session=session, user_in=admin_in)
                print(f"[✓] Usuario administrador creado: {admin_email}")
    
    except Exception as e:
        print(f"[✗] Error al crear usuario: {e}")
        return False
    print()
    
    # Mostrar credenciales
    print("[3/3] Resumen de credenciales")
    print("=" * 70)
    print()
    print(f"  Email (username):  {admin_email}")
    print(f"  Contraseña:        {admin_password}")
    print(f"  Rol:               ADMIN")
    print()
    print("=" * 70)
    print()
    print("📝 PRÓXIMOS PASOS:")
    print()
    print("1. Iniciar el backend:")
    print(f"   export SECRET_KEY='tu_clave_secreta'")
    print(f"   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print()
    print("2. Login con curl:")
    print(f"   curl -X POST 'http://localhost:8000/api/v1/auth/login' \\")
    print(f"     -F 'username={admin_email}' \\")
    print(f"     -F 'password={admin_password}'")
    print()
    print("3. Usar token JWT para requests autenticados:")
    print(f"   curl -H 'Authorization: Bearer <ACCESS_TOKEN>' \\")
    print(f"     http://localhost:8000/api/v1/usuarios/me")
    print()
    print("4. Importar colección Postman:")
    print(f"   scripts/mora-comercial-api.postman_collection.json")
    print()
    print("=" * 70)
    print()
    
    return True


def main():
    """Punto de entrada del script."""
    
    parser = argparse.ArgumentParser(
        description="Inicializar base de datos de Mora Comercial API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:

  # Usar valores por defecto
  python scripts/init_db.py

  # Especificar email y contraseña del admin
  python scripts/init_db.py --admin-email mi.admin@empresa.com --admin-password MiPassword123

  # Forzar recreación del usuario admin (overwrite)
  python scripts/init_db.py --force

  # Todas las opciones
  python scripts/init_db.py --admin-email admin@test.com --admin-password Pass123 --admin-name "Mi Admin" --force
        """
    )
    
    parser.add_argument(
        "--admin-email",
        default="admin@example.com",
        help="Email del usuario administrador (default: admin@example.com)"
    )
    
    parser.add_argument(
        "--admin-password",
        default="AdminPass123",
        help="Contraseña del usuario administrador (default: AdminPass123)"
    )
    
    parser.add_argument(
        "--admin-name",
        default="Administrador",
        help="Nombre del usuario administrador (default: Administrador)"
    )
    
    parser.add_argument(
        "--force",
        action="store_true",
        help="Forzar recreación del usuario admin si ya existe"
    )
    
    args = parser.parse_args()
    
    # Ejecutar inicialización
    success = init_database(
        admin_email=args.admin_email,
        admin_password=args.admin_password,
        admin_name=args.admin_name,
        force=args.force
    )
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
