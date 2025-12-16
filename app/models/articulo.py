# app/models/articulo.py

from __future__ import annotations
from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from pydantic import field_validator
from app.core.config import settings

class ArticuloBase(SQLModel):
    """
    Campos comunes de Articulo.
    """
    nombre: str
    descripcion: str
    categoria: str
    
    # --- 🔥 CAMBIO CLAVE 1: AÑADIMOS FAMILIA ---
    # Necesario para que el Catálogo agrupe por carpetas (Clinker, Gres...)
    familia: Optional[str] = None 
    
    precio: float
    stock: int
    
    # --- 🔥 CAMBIO CLAVE 2: OPCIONALES ---
    # Rating y Dimensiones opcionales para que no falle el script si faltan datos
    rating: Optional[float] = Field(default=None)
    dimensiones: Optional[str] = None

    # --- IMÁGENES ---
    imagen_path: Optional[str] = None 
    url_imagen: Optional[str] = None

    # Listas y Diccionarios
    imagenes: List[str] = Field(default=[], sa_column=Column(JSON))
    datos_tecnicos: Dict = Field(default={}, sa_column=Column(JSON))
    
    # Compatibilidad
    medidas: Optional[str] = None
    color: Optional[str] = None
    precio_base_milar: float = Field(default=0.0)


class Articulo(ArticuloBase, table=True):
    """
    Tabla de artículos de catálogo.
    """
    # IMPORTANTE: Como tu script usa el nombre del modelo como ID (ej: "ApoloManhattan"),
    # definimos id como string y primary key.
    id: str = Field(primary_key=True)


class ArticuloCreate(ArticuloBase):
    id: str

class ArticuloRead(ArticuloBase):
    id: str

    @field_validator("imagenes")
    @classmethod
    def make_full_urls(cls, v: List[str]) -> List[str]:
        return v or []

class ArticuloUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    familia: Optional[str] = None # También aquí para poder editarlo
    precio: Optional[float] = None
    stock: Optional[int] = None
    rating: Optional[float] = None
    dimensiones: Optional[str] = None
    imagen_path: Optional[str] = None
    imagenes: Optional[List[str]] = None
    datos_tecnicos: Optional[Dict] = None
    medidas: Optional[str] = None
    color: Optional[str] = None
    precio_base_milar: Optional[float] = None
    url_imagen: Optional[str] = None