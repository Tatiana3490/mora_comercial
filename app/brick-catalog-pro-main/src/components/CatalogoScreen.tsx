import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Product } from '@/data/products';
import { ProductCard } from './ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CatalogoScreenProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const CatalogoScreen = ({ products, onSelectProduct }: CatalogoScreenProps) => {
  const [filtro, setFiltro] = useState('');
  const [categoria, setCategoria] = useState<string>('todos');

  const productosFiltrados = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(filtro.toLowerCase());
    
    if (categoria === 'todos') return matchesSearch;
    
    // Agrupar plaquetas
    if (categoria === 'Plaquetas') {
      return matchesSearch && (
        product.categoria === 'Plaqueta Lisa' || 
        product.categoria === 'Plaqueta Texturada' || 
        product.categoria === 'Plaqueta Larga' || 
        product.categoria === 'Plaqueta Esmaltada'
      );
    }
    
    return matchesSearch && product.categoria === categoria;
  });

  const clinkerCount = products.filter(p => p.categoria === 'Clinker').length;
  const gresCount = products.filter(p => p.categoria === 'Gres').length;
  const multicolorCount = products.filter(p => p.categoria === 'Multicolor').length;
  const esmaltadoCount = products.filter(p => p.categoria === 'Esmaltado').length;
  const plaquetaCount = products.filter(p => 
    p.categoria === 'Plaqueta Lisa' || 
    p.categoria === 'Plaqueta Texturada' || 
    p.categoria === 'Plaqueta Larga' || 
    p.categoria === 'Plaqueta Esmaltada'
  ).length;

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-extrabold text-foreground">Catálogo de Productos</h2>
          <p className="text-muted-foreground mt-2">
            {clinkerCount} Clinker • {gresCount} Gres • {multicolorCount} Multicolor • {esmaltadoCount} Esmaltado • {plaquetaCount} Plaquetas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            className="pl-10"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <Select value={categoria} onValueChange={(value: any) => setCategoria(value)}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            <SelectItem value="Clinker">Clinker ({clinkerCount})</SelectItem>
            <SelectItem value="Gres">Gres ({gresCount})</SelectItem>
            <SelectItem value="Multicolor">Multicolor ({multicolorCount})</SelectItem>
            <SelectItem value="Esmaltado">Esmaltado ({esmaltadoCount})</SelectItem>
            <SelectItem value="Plaquetas">Plaquetas ({plaquetaCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Productos */}
      <div className="flex-grow overflow-y-auto pr-2">
        {productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map(product => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold">No se encontraron productos</p>
            <p>Intente ajustar su búsqueda o filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};
