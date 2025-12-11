import sys
import os
import random
from datetime import date, timedelta
from sqlmodel import Session, select, SQLModel
from app.utils.security import get_password_hash

# --- CONFIGURACIÓN DE RUTAS ---
sys.path.append(os.getcwd())

try:
    from app.db import engine
    from app.models.client import Client
    from app.models.presupuesto import Presupuesto
    from app.models.user import User  
except ImportError as e:
    print(f"❌ Error importando: {e}")
    sys.exit(1)

sqlite_file_name = "mora_comercial.db"

def create_fake_data():
    print(f"📂 Conectando a: {sqlite_file_name}...")
    
    with Session(engine) as session:
        print("👤 Verificando usuarios...")
        
        # --- A) USUARIO COMERCIAL ---
        email_comercial = "comercial@mora.com"
        user_comercial = session.exec(select(User).where(User.email == email_comercial)).first()
        
        if not user_comercial:
            user_comercial = User(
                nombre="Juan Comercial",
                apellidos="Pérez",
                email="comercial@mora.com",
                rol="COMERCIAL",
                activo=True,
                password_hash=get_password_hash("comercial123") 
            )
            session.add(user_comercial)
            session.commit()
            session.refresh(user_comercial)
            print("   -> ✅ Usuario 'Juan Comercial' creado (Pass: comercial123).")

        # --- B) USUARIO ADMIN ---
        email_admin = "admin@mora.com"
        user_admin = session.exec(select(User).where(User.email == email_admin)).first()

        if not user_admin:
            user_admin = User(
                nombre="Admin General",
                apellidos="Principal", 
                email="admin@mora.com",
                rol="ADMIN",
                activo=True,
                # AQUÍ EL CAMBIO: Usamos una contraseña real encriptada
                password_hash=get_password_hash("admin123")
            )
            session.add(user_admin)
            session.commit()
            session.refresh(user_admin)
            print("   -> ✅ Usuario 'Admin General' creado (Pass: admin123).")

        # --- CREACIÓN DE CLIENTES ---
        print("🏢 Verificando clientes...")
        empresas = ["Reformas Manolo S.L.", "Hotel Plaza", "Restaurante El Sol"]
        mis_clientes = []

        for nombre in empresas:
            cliente = session.exec(select(Client).where(Client.nombre == nombre)).first()
            if not cliente:
                cliente = Client(
                    nombre=nombre,
                    nif=f"B{random.randint(10000000, 99999999)}",
                    correo=f"info@{nombre.replace(' ', '').lower()}.com",
                    provincia="Madrid",
                    direccion="Calle Falsa 123",
                    telefono="910000000",
                    id_comercial_propietario=user_comercial.id_usuario
                )
                session.add(cliente)
                session.commit()
                session.refresh(cliente)
            mis_clientes.append(cliente)

        # --- CREACIÓN DE PRESUPUESTOS ---
        print("📊 Generando presupuestos...")
        casos = [
            {"estado": "ENVIADO_ADMIN", "ref": "PRE-2025-001"},
            {"estado": "APROBADO", "ref": "PRE-2025-002"},
        ]
        
        for caso in casos:
            if not session.exec(select(Presupuesto).where(Presupuesto.numero_presupuesto == caso["ref"])).first():
                presu = Presupuesto(
                    numero_presupuesto=caso["ref"],
                    fecha_presupuesto=date.today(),
                    estado=caso["estado"],
                    id_cliente=mis_clientes[0].id_cliente, # Asignamos al primero
                    id_comercial_creador=user_comercial.id_usuario
                )
                session.add(presu)
        session.commit()

    print("\n🚀 ¡SEMILLA COMPLETADA! Usuario Admin: admin@mora.com / Pass: admin123")

if __name__ == "__main__":
    SQLModel.metadata.create_all(engine)
    create_fake_data()