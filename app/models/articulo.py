# app/models/articulo.py

from __future__ import annotations

from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from pydantic import field_validator
# Si no usas settings aquí, lo puedes quitar, pero lo dejo por si acaso
from app.core.config import settings


class ArticuloBase(SQLModel):
    """
    Campos comunes de Articulo (sin ID).
    """
    nombre: str
    descripcion: str
    categoria: str
    precio: float
    stock: int
    rating: float
    dimensiones: str

    # --- NUEVO CAMPO PARA IMÁGENES LOCALES (STATIC) ---
    # Guardará la ruta relativa, ej: "mora_materiales/Clinker/foto.jpg"
    imagen_path: Optional[str] = None 

    # Almacenaremos las imágenes como una lista de strings en formato JSON
    # (Esto te sirve para galerías adicionales si quieres)
    imagenes: List[str] = Field(default=[], sa_column=Column(JSON))
    
    # Almacenaremos los datos técnicos como un diccionario en formato JSON
    datos_tecnicos: Dict = Field(default={}, sa_column=Column(JSON))
    
    # Campos antiguos para compatibilidad (opcionales)
    medidas: Optional[str] = None
    color: Optional[str] = None
    precio_base_milar: float = Field(default=0.0)
    url_imagen: Optional[str] = None


class Articulo(ArticuloBase, table=True):
    """
    Tabla de artículos de catálogo.
    """
    # Tu ID es un String (ej: "LAD-001"), asegúrate de enviarlo siempre al crear
    id: str = Field(primary_key=True)


class ArticuloCreate(ArticuloBase):
    """
    Modelo de entrada para crear artículos.
    """
    id: str


class ArticuloRead(ArticuloBase):
    """
    Modelo de salida para leer artículos.
    """
    id: str

    @field_validator("imagenes")
    @classmethod
    def make_full_urls(cls, v: List[str]) -> List[str]:
        # Simple validator to ensure list
        return v or []


class ArticuloUpdate(SQLModel):
    """
    Modelo de entrada para actualizar artículos (PUT/PATCH).
    """
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    rating: Optional[float] = None
    dimensiones: Optional[str] = None
    
    # Añadimos también aquí la opción de actualizar la imagen local
    imagen_path: Optional[str] = None
    
    imagenes: Optional[List[str]] = None
    datos_tecnicos: Optional[Dict] = None
    
    # Campos antiguos
    medidas: Optional[str] = None
    color: Optional[str] = None
    precio_base_milar: Optional[float] = None
    url_imagen: Optional[str] = None