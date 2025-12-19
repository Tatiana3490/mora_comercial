import sys
import os
import csv
from pathlib import Path

# Configuración de rutas
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

# Importaciones
from sqlmodel import Session, SQLModel, select
from app.db.session import engine
from app.models.user import User
from app.models.client import Client
from app.models.nota import Nota
from app.utils.security import get_password_hash 

# Ruta del CSV de clientes
ARCHIVO_CLIENTES = ROOT_DIR / "datos" / "clientes.csv"

def inicializar_sistema():
    print("🚀 INICIANDO RESET DEL SISTEMA (Modo Local)...")
    
    # 1. BORRÓN Y CUENTA NUEVA (Crea tablas)
    SQLModel.metadata.create_all(engine)
    print("✅ Tablas de base de datos listas.")

    with Session(engine) as session:
        # 2. CREAR EQUIPO OFICIAL
        equipo = [
            {"nombre": "Andres", "apellidos": "Duran", "email": "informatica@ceramicasmora.com", "rol": "ADMIN", "pass": "mora1234"},
            {"nombre": "Jose", "apellidos": "Ramirez-Fogeda", "email": "info@ceramicasmora.com", "rol": "ADMIN", "pass": "mora1234"},
            {"nombre": "Pedro", "apellidos": "Rognoni", "email": "p.rognoni@ceramicasmora.com", "rol": "COMERCIAL", "pass": "mora1234"},
            {"nombre": "Javier", "apellidos": "De la cruz", "email": "comercial@ceramicasmora.com", "rol": "COMERCIAL", "pass": "mora1234"}
        ]

        print("\n👤 Generando Usuarios Oficiales...")
        for usuario in equipo:
            existe = session.exec(select(User).where(User.email == usuario["email"])).first()
            if not existe:
                nuevo_user = User(
                    nombre=usuario["nombre"],
                    apellidos=usuario["apellidos"],
                    email=usuario["email"],
                    password_hash=get_password_hash(usuario["pass"]),
                    rol=usuario["rol"],
                    activo=True
                )
                session.add(nuevo_user)
                print(f"   -> Creado: {usuario['nombre']}")
        
        session.commit()

        # 3. IMPORTAR CLIENTES (Asignados al Admin Andrés)
        if ARCHIVO_CLIENTES.exists():
            print("\n🏢 Importando Clientes...")
            admin = session.exec(select(User).where(User.email == "informatica@ceramicasmora.com")).first()
            
            if admin:
                with open(ARCHIVO_CLIENTES, mode='r', encoding='utf-8-sig') as f:
                    # Detecta automáticamente si usa ; o ,
                    sample = f.read(1024)
                    f.seek(0)
                    dialect = csv.Sniffer().sniff(sample)
                    
                    reader = csv.DictReader(f, dialect=dialect)
                    
                    # Normalizamos cabeceras a minúsculas y sin espacios
                    reader.fieldnames = [name.strip().lower() for name in reader.fieldnames]

                    # --- 🕵️‍♂️ NUEVO: CHIVATO DE COLUMNAS ---
                    print(f"\n🔍 DEBUG: Las columnas detectadas en el CSV son: {reader.fieldnames}")
                    if 'provincia' not in reader.fieldnames:
                        print("⚠️ ¡ALERTA! No encuentro la columna 'provincia'. Revisa el nombre en el Excel.")
                    # -------------------------------------

                    count = 0
                    for row in reader:
                        if not row.get('nombre'): continue
                        # Evita duplicados
                        if not session.exec(select(Client).where(Client.nombre == row['nombre'])).first():
                            cli = Client(
                                nombre=row.get('nombre'),
                                nif=row.get('nif', ''),
                                correo=row.get('correo', ''),
                                telefono=row.get('telefono', ''),
                                direccion=row.get('direccion', ''),
                                provincia=row.get('provincia', ''),
                                id_comercial_propietario=admin.id_usuario
                            )
                            session.add(cli)
                            count += 1
                session.commit()
                print(f"✅ {count} clientes importados correctamente.")
        else:
            print("⚠️ No se encontró el archivo 'datos/clientes.csv'. Se omiten clientes.")

    print("\n🎉 ¡SISTEMA RESTAURADO!")

if __name__ == "__main__":
    inicializar_sistema()