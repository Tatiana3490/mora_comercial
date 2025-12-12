import sys
import os
import random

# Ajuste de rutas
sys.path.append(os.getcwd())

from sqlmodel import Session, select, SQLModel
from app.db.session import engine
from app.models.articulo import Articulo

# Configuración
STATIC_ROOT = "app/static"
BASE_FOLDER = "mora_materiales"  # La carpeta dentro de static donde están las fotos

def clean_name(filename):
    """Convierte 'Clinker_BLANCO.jpg' en 'Clinker Blanco'"""
    name = os.path.splitext(filename)[0] # Quitar .jpg
    name = name.replace("_", " ").replace("-", " ") # Quitar guiones
    
    # Separar mayúsculas juntas (estético)
    import re
    name = re.sub(r'(?<!^)(?=[A-Z])', ' ', name)
    
    return name.strip()

def seed_from_images():
    print(f"📂 Escaneando carpeta: {os.path.join(STATIC_ROOT, BASE_FOLDER)}...")
    
    # Asegurar que las tablas existen
    SQLModel.metadata.create_all(engine)
    
    products_to_create = []
    count = 1

    # Ruta completa de inicio
    start_dir = os.path.join(STATIC_ROOT, BASE_FOLDER)
    
    if not os.path.exists(start_dir):
        print(f"❌ Error: No encuentro la carpeta {start_dir}")
        return

    # Recorremos carpetas y archivos
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            # Filtramos solo imágenes
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                
                # 1. Rutas
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, STATIC_ROOT).replace("\\", "/")
                
                # 2. Datos automáticos
                folder_name = os.path.basename(root)
                file_name_clean = clean_name(file)
                
                parts = relative_path.split("/")
                categoria = parts[1] if len(parts) > 1 else "General"
                
                # ID secuencial
                sku = f"AUTO-{count:04d}" 
                
                # 3. Objeto Artículo
                articulo = {
                    "id": sku,
                    "nombre": file_name_clean,
                    "descripcion": f"Material cerámico de la serie {folder_name}.",
                    "categoria": categoria,
                    "familia": folder_name,
                    
                    # --- CAMBIO AQUÍ: PRECIO Y STOCK A CERO ---
                    "precio": 0.0, 
                    "stock": 0,
                    
                    "rating": 5.0, # Dejamos rating 5 por estética
                    "dimensiones": "Estándar",
                    "imagen_path": relative_path,
                    "imagenes": [],
                    "datos_tecnicos": {}
                }
                
                products_to_create.append(articulo)
                count += 1

    print(f"🔍 Se han encontrado {len(products_to_create)} imágenes.")
    print("💾 Guardando en base de datos...")

    with Session(engine) as session:
        added = 0
        for p_data in products_to_create:
            try:
                # Insertamos el artículo
                # Si quieres que actualice los existentes en vez de fallar, habría que hacer un chequeo antes
                existing = session.get(Articulo, p_data["id"])
                if not existing:
                    item = Articulo(**p_data)
                    session.add(item)
                    added += 1
            except Exception as e:
                print(f"⚠️ Error en {p_data['nombre']}: {e}")

        session.commit()
        print(f"✅ ¡Proceso terminado! {added} artículos añadidos (Precio/Stock a 0).")

if __name__ == "__main__":
    seed_from_images()