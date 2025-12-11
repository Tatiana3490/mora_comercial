from pathlib import Path
from sqlmodel import Session, select
from app.db.session import engine
from app.models.articulo import Articulo 


# Carpeta donde están las fotos
STATIC_MATERIALS_DIR = (
    Path(__file__).resolve().parents[1] / "static" / "mora_materiales"
)


def main():
    exts = {".jpg", ".jpeg", ".png", ".webp"}

    with Session(engine) as session:
        for folder in STATIC_MATERIALS_DIR.iterdir():
            if not folder.is_dir():
                continue

            images = [p for p in folder.iterdir() if p.suffix.lower() in exts]
            if not images:
                continue

            # Nombre de modelo = nombre de la carpeta
            slug = folder.name  # ej: CLINKER_BLANCO

            # URLs que verá el frontend
            image_urls = [
                f"/static/mora_materiales/{slug}/{img.name}" for img in images
            ]

            # ¿Ya existe este artículo?
            existing = session.exec(
                select(Articulo).where(Articulo.id == slug)
            ).first()

            if existing:
                # Actualizamos rutas de imagen
                existing.url_imagen = image_urls[0]
                existing.imagenes = image_urls
                print(f"Actualizado artículo {slug}")
            else:
                # Creamos un artículo nuevo básico
                art = Articulo(
                    id=slug,
                    nombre=slug.replace("_", " ").title(),
                    descripcion=f"Modelo {slug.replace('_', ' ').title()}",
                    categoria="Por definir",
                    precio=0,
                    stock=0,
                    rating=4.5,
                    dimensiones="",
                    imagenes=image_urls,
                    datos_tecnicos={},
                    medidas="",
                    color="",
                    precio_base_milar=0,
                    url_imagen=image_urls[0],
                )
                session.add(art)
                print(f"Creado artículo {slug}")

        session.commit()
        print("✅ Semillado de artículos completado.")


if __name__ == "__main__":
    main()
