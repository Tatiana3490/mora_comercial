import sys
import os

# Ajuste de rutas para que Python encuentre la carpeta 'app'
sys.path.append(os.getcwd())

from sqlmodel import Session, SQLModel, select
from app.db.session import engine
from app.models.user import User
from app.models.client import Client
from app.utils.security import hash_password

def create_initial_data():
    print("🔧 Inicializando datos de Usuarios y Clientes...")
    
    # 1. Crear las tablas si no existen (Usuarios, Clientes, etc.)
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # --- PASO A: CREAR USUARIO ADMIN (JEFE) ---
        admin_email = "adminmora@gmail.com"
        admin = session.exec(select(User).where(User.email == admin_email)).first()
        
        if not admin:
            print(f"👤 Creando Admin: {admin_email}")
            admin = User(
                nombre="Admin",
                apellidos="Mora",
                email=admin_email,
                password_hash=hash_password("admin123"), # Contraseña encriptada
                rol="ADMIN",
                activo=True
            )
            session.add(admin)
        else:
            print(f"ℹ️ El usuario {admin_email} ya existe.")

        # --- PASO B: CREAR USUARIO COMERCIAL ---
        comercial_email = "comercial@mora.com"
        comercial = session.exec(select(User).where(User.email == comercial_email)).first()
        
        if not comercial:
            print(f"👤 Creando Comercial: {comercial_email}")
            comercial = User(
                nombre="Juan",
                apellidos="Vendedor",
                email=comercial_email,
                password_hash=hash_password("comercial123"),
                rol="COMERCIAL",
                activo=True
            )
            session.add(comercial)
        else:
            print(f"ℹ️ El usuario {comercial_email} ya existe.")
        
        # Guardamos los usuarios primero para tener sus IDs
        session.commit()
        session.refresh(admin)
        session.refresh(comercial)

        # --- PASO C: CREAR CLIENTES ---
        # Creamos un cliente asignado al comercial
        cliente_nif = "B12345678"
        cliente = session.exec(select(Client).where(Client.nif == cliente_nif)).first()
        
        if not cliente:
            print("🏢 Creando Cliente de prueba...")
            cliente = Client(
                nombre="Construcciones Ejemplo S.L.",
                nif=cliente_nif,
                correo="contacto@ejemplo.com",
                telefono="600112233",
                direccion="Calle Obra Nueva, 12",
                provincia="Madrid",
                id_comercial_propietario=comercial.id_usuario # Asignado a Juan
            )
            session.add(cliente)
        
        session.commit()
        print("✅ ¡Datos iniciales (Usuarios y Clientes) creados correctamente!")

if __name__ == "__main__":
    create_initial_data()