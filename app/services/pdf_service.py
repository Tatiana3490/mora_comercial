import io
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from sqlmodel import Session, select

from app.models.quote import Quote, QuoteLine
from app.models.client import Client
from app.models.product import Product


TEMPLATES_DIR = Path(__file__).resolve().parents[1] / "templates"

env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))


def render_quote_pdf(session: Session, quote_id: int) -> bytes:
    quote = session.get(Quote, quote_id)
    if not quote:
        raise ValueError("Presupuesto no encontrado")

    client = session.get(Client, quote.client_id)
    if not client:
        raise ValueError("Cliente no encontrado")

    # Sacamos líneas y datos de producto para mostrar nombre/categoría
    lines_db = session.exec(
        select(QuoteLine).where(QuoteLine.quote_id == quote_id)
    ).all()

    lines = []
    for l in lines_db:
        product = session.get(Product, l.product_id)
        lines.append({
            "product_id": l.product_id,
            "product_name": product.name if product else f"Producto {l.product_id}",
            "category": product.category if product else "",
            "quantity": l.quantity,
            "unit_price": l.unit_price,
            "subtotal": l.subtotal
        })

    template = env.get_template("quote.html")
    html = template.render(quote=quote, client=client, lines=lines)

    # Convertir HTML -> PDF
    result = io.BytesIO()
    pisa.CreatePDF(io.StringIO(html), dest=result, encoding="utf-8")

    return result.getvalue()
