import { useState, useEffect } from 'react';
import { ArrowLeft, Star, PlusCircle, Package } from 'lucide-react';
import { Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ItemDetailScreenProps {
  product: Product | null;
  onNavigate: (page: string) => void;
  onAddToBudget: (product: Product) => void;
  setMessage: (msg: { text: string; type: 'success' | 'error' }) => void;
}

export const ItemDetailScreen = ({ product, onNavigate, onAddToBudget, setMessage }: ItemDetailScreenProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Producto no encontrado.</p>
      </div>
    );
  }

  const handleAddToBudget = () => {
    onAddToBudget(product);
    setMessage({ text: `${product.nombre} añadido al presupuesto.`, type: 'success' });
  };

  return (
    <div className="p-8 h-full overflow-y-auto animate-fade-in">
      <Button
        onClick={() => onNavigate('catalogo')}
        variant="outline"
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Catálogo
      </Button>

      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
              <img 
                src={product.imagenes[currentImageIndex]} 
                alt={`${product.nombre} - Imagen ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <Badge className={cn(
                "absolute top-4 right-4",
                product.categoria === 'Clinker' ? "bg-clinker text-white" : "bg-plaqueta text-white"
              )}>
                {product.categoria}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.imagenes.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all",
                    currentImageIndex === index ? "border-primary scale-105" : "border-border hover:border-primary/50"
                  )}
                >
                  <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-foreground mb-3">{product.nombre}</h1>
            <p className="text-lg text-muted-foreground mb-6">{product.descripcion}</p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Star className="w-6 h-6 fill-current text-accent" />
                <span className="text-xl font-medium text-foreground">{product.rating} / 5.0</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6 text-primary" />
                <span className="text-lg text-foreground">
                  <span className="font-semibold">{product.stock}</span> unidades en stock
                </span>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Dimensiones</p>
                <p className="text-lg font-semibold text-foreground">{product.dimensiones}</p>
              </div>
            </div>

            <div className="text-5xl font-bold text-primary mb-8">
              €{product.precio.toFixed(2)}
              <span className="text-lg text-muted-foreground font-normal"> / unidad</span>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button
                onClick={handleAddToBudget}
                size="lg"
                className="flex-1"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Añadir a Presupuesto
              </Button>
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Características destacadas</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Alta resistencia y durabilidad</li>
                <li>✓ Fabricación sostenible</li>
                <li>✓ Certificación de calidad AENOR</li>
                <li>✓ Fabricado en España</li>
              </ul>
            </div>

            {/* Datos Técnicos */}
            <div className="mt-6 p-6 bg-card border border-border rounded-xl">
              <h3 className="text-xl font-bold text-foreground mb-4">Datos Técnicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Dimensiones</p>
                    <p className="text-base font-semibold text-foreground">{product.dimensiones}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Absorción de agua</p>
                    <p className="text-base font-semibold text-foreground">{product.datosTecnicos.absorcionAgua}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Succión inicial</p>
                    <p className="text-base font-semibold text-foreground">{product.datosTecnicos.succionInicial}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Resistencia a la compresión</p>
                    <p className="text-base font-semibold text-foreground">{product.datosTecnicos.resistenciaCompresion}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Eflorescencias</p>
                    <p className="text-base font-semibold text-foreground">{product.datosTecnicos.eflorescencias}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Heladicidad</p>
                    <p className="text-base font-semibold text-foreground">{product.datosTecnicos.heladicidad}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
