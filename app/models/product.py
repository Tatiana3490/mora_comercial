from typing import Optional
from sqlmodel import SQLModel, Field


class ProductBase(SQLModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None
    category: str = Field(min_length=1)
    price_unit: float = Field(gt=0)   # > 0 obligatorio
    stock: int = Field(ge=0)
    rating: float = Field(ge=0, le=5)
    image_url: Optional[str] = None


class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int
