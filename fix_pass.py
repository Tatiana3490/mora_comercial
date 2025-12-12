import sys
import os

# Aseguramos que Python encuentre la carpeta 'app'
sys.path.append(os.getcwd())

from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import User
from app.utils.security import hash_password

def reset_password():
    print("🔧 Iniciando reparación manual de contraseña...")
    
    # Intentamos conectar
    try:
        with Session(engine) as session:
            # 1. Buscar al usuario
            email = "jefe@mora.com"
            print(f"   Searching for user: {email}...")
            
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()
            
            if not user:
                print(f"❌ Error: No encuentro al usuario {email} en la base de datos.")
                print("   Asegúrate de haberlo creado antes en Swagger.")
                return

            print(f"✅ Usuario encontrado: {user.nombre} (ID: {user.id_usuario})")
            
            # 2. Crear el nuevo hash limpio
            nueva_pass = "1234"
            nuevo_hash = hash_password(nueva_pass)
            
            # 3. Guardar
            user.password_hash = nuevo_hash
            session.add(user)
            session.commit()
            session.refresh(user)
            
            print("-" * 30)
            print(f"🚀 ¡ÉXITO! La contraseña de '{email}' ha sido reseteada.")
            print(f"🔑 Nueva contraseña: '{nueva_pass}'")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")

if __name__ == "__main__":
    reset_password()