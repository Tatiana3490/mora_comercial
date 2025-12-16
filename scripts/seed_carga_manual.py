import sys
import os

# Ajuste de rutas
sys.path.append(os.getcwd())

from sqlmodel import Session, SQLModel # <--- IMPORTANTE: Importar SQLModel
from app.db.session import engine
from app.models.articulo import Articulo

def create_products():
    print("🔧 Inicializando base de datos y tablas...")
    
    # 1. ESTA ES LA LÍNEA MÁGICA: Crea las tablas si no existen
    SQLModel.metadata.create_all(engine)

    print("📦 Creando catálogo con modelo avanzado...")
    
    # Datos completos según tu modelo
    productos = [
        {
            "id": "KLK-001",
            "nombre": "Clinker Apolo Manhattan",
            "descripcion": "Ladrillo caravista klinker de alta calidad.",
            "categoria": "Fachadas",
            "precio": 1.20,
            "stock": 5000,
            "rating": 5.0,
            "dimensiones": "24x11x5 cm",
            "imagen_path": "mora_materiales/Clinker/Clinker-ApoloManhattan/ClinkerApolloManhattanLadrillo.jpg",
            "imagenes": [], 
            "datos_tecnicos": {"resistencia": "Alta", "absorcion": "<6%"}
        },
        {
            "id": "KLK-002",
            "nombre": "Clinker Blanco",
            "descripcion": "Acabado blanco puro y duradero.",
            "categoria": "Fachadas",
            "precio": 1.35,
            "stock": 3000,
            "rating": 4.8,
            "dimensiones": "24x11x5 cm",
            "imagen_path": "mora_materiales/Clinker/Clinker_BLANCO.jpg",
            "imagenes": [],
            "datos_tecnicos": {}
        },
        # Puedes añadir más productos aquí...
    ]

    with Session(engine) as session:
        for p in productos:
            # Verificamos si ya existe
            existing = session.get(Articulo, p["id"])
            if not existing:
                # Usamos **p para pasar todos los datos del diccionario
                nuevo_art = Articulo(**p)
                session.add(nuevo_art)
        
        session.commit()
        print(f"✅ ¡Éxito! Se han procesado {len(productos)} productos.")

if __name__ == "__main__":
    create_products()