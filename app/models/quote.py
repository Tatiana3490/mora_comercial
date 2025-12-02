from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class QuoteLineBase(SQLModel):
    product_id: int = Field(foreign_key="product.id")
    quantity: int
    unit_price: float
    subtotal: float


class QuoteLine(QuoteLineBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quote_id: int = Field(foreign_key="quote.id")


class QuoteBase(SQLModel):
    client_id: int = Field(foreign_key="client.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "draft"   # draft | sent | accepted
    total: float = 0.0


class Quote(QuoteBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lines: List[QuoteLine] = Relationship()


# ---- Esquemas para API ----

class QuoteCreate(SQLModel):
    client_id: int


class QuoteLineCreate(SQLModel):
    product_id: int
    quantity: int = Field(gt=0)



class QuoteLineRead(QuoteLineBase):
    id: int
    quote_id: int


class QuoteRead(QuoteBase):
    id: int
    lines: List[QuoteLineRead] = []
