import React, { useState } from 'react';
import { Plus, Check, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductCard = ({ product, onAddToQuote }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // --- LÓGICA DE IMÁGENES (CARRUSEL) ---
  let gallery = product.imagenes || [];
  
  // Si no hay array de imágenes, usamos la url única si existe
  if (gallery.length === 0 && product.url_imagen) {
      gallery = [product.url_imagen];
  }

  const activeIndex = currentImgIndex >= gallery.length ? 0 : currentImgIndex;
  
  const currentUrl = gallery.length > 0 
    ? `http://localhost:8000${encodeURI(gallery[activeIndex])}`
    : null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleAdd = () => {
    onAddToQuote(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      
      {/* --- ZONA IMAGEN --- */}
      <div className="relative h-56 bg-gray-100 overflow-hidden flex items-center justify-center">
        
        {currentUrl && !imgError ? (
            <img 
                src={currentUrl} 
                alt={product.descripcion}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={() => setImgError(true)}
                loading="lazy"
            />
        ) : (
            <div className="flex flex-col items-center text-gray-300 p-4">
                <ImageOff size={40} />
                <span className="text-[10px] text-center mt-2">{product.descripcion}</span>
            </div>
        )}
        
        {/* FLECHAS DEL CARRUSEL */}
        {gallery.length > 1 && (
            <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-1 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-1 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight size={20} />
                </button>
                
                {/* Puntitos indicadores */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {gallery.map((_, idx) => (
                        <div key={idx} className={`h-1.5 w-1.5 rounded-full shadow-sm ${idx === activeIndex ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                </div>
            </>
        )}

        {/* Etiqueta Familia */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {product.familia || 'General'}
        </div>
      </div>

      {/* --- INFO Y BOTÓN --- */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
            <p className="text-xs text-gray-400 font-mono mb-1 truncate">REF: {product.id}</p>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2" title={product.descripcion}>
                {product.descripcion}
            </h3>
            
            {gallery.length > 1 && (
                <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    📸 {gallery.length} imágenes
                </p>
            )}
        </div>

        {/* --- BOTÓN DE AÑADIR (SIN PRECIO) --- */}
        <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-50">
            <button 
                onClick={handleAdd}
                disabled={isAdded}
                className={`h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-all 
                ${isAdded ? 'bg-green-500 text-white scale-110' : 'bg-gray-900 text-white hover:bg-orange-600 hover:scale-110'}`}
                title="Añadir al presupuesto"
            >
                {isAdded ? <Check size={24} /> : <Plus size={24} />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;