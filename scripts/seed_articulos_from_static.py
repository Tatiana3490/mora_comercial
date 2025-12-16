import sys
import os
from pathlib import Path

# --- ARREGLO DE RUTAS ---
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.articulo import Articulo 

# Ruta base: app/static/mora_materiales
STATIC_MATERIALS_DIR = ROOT_DIR / "app" / "static" / "mora_materiales"
APP_DIR = ROOT_DIR / "app"

def main():
    print(f"🌍 Iniciando escáner profundo en: {STATIC_MATERIALS_DIR}")
    
    if not STATIC_MATERIALS_DIR.exists():
        print(f"❌ Error: No encuentro la carpeta {STATIC_MATERIALS_DIR}")
        return

    exts = {".jpg", ".jpeg", ".png", ".webp"}

    with Session(engine) as session:
        # Recorremos SOLO las carpetas principales (Familias: Clinker, Thin Brick...)
        # para saber a qué familia asignar lo que encontremos dentro.
        for familia_dir in STATIC_MATERIALS_DIR.iterdir():
            if not familia_dir.is_dir(): continue
            
            nombre_familia = familia_dir.name # Ej: "Thin Brick"
            print(f"\n📂 Familia detectada: {nombre_familia}")
            
            # --- 🚀 MODO ESCÁNER PROFUNDO ---
            # os.walk baja hasta el último rincón de la carpeta de la familia
            for root, dirs, files in os.walk(familia_dir):
                
                # 'root' es la ruta de la carpeta actual que está mirando
                current_folder_path = Path(root)
                
                # Buscamos imágenes en esta carpeta específica
                imagenes_en_carpeta = [
                    f for f in files 
                    if Path(f).suffix.lower() in exts
                ]
                
                if not imagenes_en_carpeta:
                    continue # Si la carpeta está vacía de fotos, pasamos a la siguiente

                # --- LÓGICA DE PRODUCTO ---
                # Si estamos aquí, es porque 'current_folder_path' tiene fotos.
                # Por tanto, ESTA carpeta es un PRODUCTO.
                
                # 1. Nombre del modelo = Nombre de la carpeta donde están las fotos
                # (Si las fotos están sueltas en la raíz de la familia, usamos el nombre del archivo)
                es_raiz_familia = (current_folder_path == familia_dir)
                
                productos_a_crear = []

                if es_raiz_familia:
                    # CASO A: Fotos sueltas en "Clinker/"
                    # Cada foto es un producto distinto
                    for img_name in imagenes_en_carpeta:
                        nombre_modelo = Path(img_name).stem
                        # Calculamos la ruta relativa exacta para la URL
                        # Ej: /static/mora_materiales/Clinker/foto.jpg
                        full_path = current_folder_path / img_name
                        rel_path = full_path.relative_to(APP_DIR)
                        url = "/" + str(rel_path).replace("\\", "/") # Fix para Windows
                        
                        productos_a_crear.append({
                            "id": nombre_modelo,
                            "urls": [url]
                        })
                else:
                    # CASO B: Carpeta con fotos (Thin Brick/Serie/Color...)
                    # La carpeta es el producto. Agrupamos todas las fotos.
                    nombre_modelo = current_folder_path.name
                    lista_urls = []
                    
                    # Ordenamos por "Pared" (Tu preferencia)
                    imagenes_en_carpeta.sort(key=lambda x: 0 if 'pared' in x.lower() else 1)
                    
                    for img_name in imagenes_en_carpeta:
                        full_path = current_folder_path / img_name
                        # Magia: Calculamos la ruta relativa desde 'app' automáticamente
                        rel_path = full_path.relative_to(APP_DIR)
                        # Convertimos a formato web (barras /)
                        url = "/" + str(rel_path).replace("\\", "/")
                        lista_urls.append(url)
                    
                    productos_a_crear.append({
                        "id": nombre_modelo,
                        "urls": lista_urls
                    })

                # --- GUARDAR EN BD ---
                for prod in productos_a_crear:
                    p_id = prod["id"]
                    p_urls = prod["urls"]
                    url_portada = p_urls[0]

                    existing = session.exec(select(Articulo).where(Articulo.id == p_id)).first()

                    if existing:
                        existing.url_imagen = url_portada
                        existing.imagenes = p_urls
                        existing.familia = nombre_familia
                        session.add(existing)
                        print(f"   🔄 Actualizado: {p_id} (Nivel profundo)")
                    else:
                        nuevo_art = Articulo(
                            id=p_id,
                            nombre=p_id,
                            descripcion=p_id,
                            familia=nombre_familia,
                            categoria="Material Cerámico",
                            precio=0.0,
                            url_imagen=url_portada,
                            imagenes=p_urls,
                            stock=100,
                            precio_base_milar=0.0,
                            datos_tecnicos={}
                        )
                        session.add(nuevo_art)
                        print(f"   ✅ Creado: {p_id} (Encontrado en subniveles)")

        session.commit()
        print("\n🎉 ¡Catálogo actualizado! Se han escaneado todas las profundidades.")

if __name__ == "__main__":
    main()