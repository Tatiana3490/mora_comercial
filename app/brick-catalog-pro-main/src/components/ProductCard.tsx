import { Star } from 'lucide-react';
import { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard = ({ product, onSelect }: ProductCardProps) => (
  <div
    className="bg-card rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-smooth cursor-pointer border border-border group"
    onClick={() => onSelect(product)}
  >
    <div className="relative h-56 overflow-hidden">
      <img 
        src={product.imagenes[0]} 
        alt={product.nombre} 
        className="w-full h-full object-cover group-hover:scale-110 transition-smooth" 
      />
      <Badge 
        className={cn(
          "absolute top-4 right-4 text-white",
          product.categoria === 'Clinker' ? "bg-clinker" :
          product.categoria === 'Gres' ? "bg-gres" :
          product.categoria === 'Multicolor' ? "bg-multicolor" :
          product.categoria === 'Esmaltado' ? "bg-esmaltado" :
          "bg-plaqueta"
        )}
      >
        {product.categoria}
      </Badge>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-1">{product.nombre}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.descripcion}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-primary">€{product.precio.toFixed(2)}</span>
        <div className="flex items-center space-x-1 text-accent">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium text-foreground">{product.rating}</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Stock: {product.stock} uds.
      </div>
    </div>
  </div>
);
