import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, ArrowRight, Folder, ChevronLeft, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

// Las carpetas EXACTAS que tienes en static/mora_materiales
const FOLDERS = ['Clinker', 'Destonificados', 'Esmaltados', 'Gres', 'Thin Brick'];

const Catalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null); // Null = Viendo carpetas
  const [searchTerm, setSearchTerm] = useState('');
  
  // Carrito
  const [cartItems, setCartItems] = useState(() => {
      const saved = localStorage.getItem('quoteItems');
      return saved ? JSON.parse(saved) : [];
  });

  // 1. CARGAR Y CLASIFICAR PRODUCTOS
  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/v1/articulos/', { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            
            // 🔥 TRUCO: Adivinamos la carpeta si la familia en BD viene vacía
            const classifiedData = data.map(p => {
                let folder = p.familia; // Usamos la de la BD si existe
                
                // Si no tiene familia o es "Otros", buscamos palabras clave en la descripción
                if (!folder || folder === 'Otros') {
                    const desc = p.descripcion.toLowerCase();
                    if (desc.includes('clinker')) folder = 'Clinker';
                    else if (desc.includes('gres')) folder = 'Gres';
                    else if (desc.includes('esmaltado')) folder = 'Esmaltados';
                    else if (desc.includes('thin')) folder = 'Thin Brick';
                    else if (desc.includes('destonificado')) folder = 'Destonificados';
                    else folder = 'Otros';
                }
                return { ...p, familia: folder };
            });
            
            setProducts(classifiedData);
        }
      } catch (error) {
        console.error("Error cargando catálogo:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Función añadir al carrito
  const handleAddToQuote = (product) => {
    const currentItems = [...cartItems];
    const index = currentItems.findIndex(i => i.id_articulo === product.id_articulo);
    if (index >= 0) currentItems[index].cantidad++;
    else currentItems.push({
        id_temp: Date.now(),
        id_articulo: product.id_articulo,
        nombre: product.descripcion,
        descripcion: product.descripcion,
        familia: product.familia,
        cantidad: 1,
        precio: parseFloat(product.precio_unitario || 0)
    });
    setCartItems(currentItems);
    localStorage.setItem('quoteItems', JSON.stringify(currentItems));
  };

  // Filtrar productos según carpeta seleccionada y buscador
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFolder = selectedFolder ? p.familia === selectedFolder : true;
      return matchesSearch && matchesFolder;
  });

  if (loading) return <div className="p-20 text-center text-gray-500">Cargando materiales...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* --- CABECERA --- */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 px-6 py-4">
          <div className="container mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Botón Volver (Solo si estamos dentro de una carpeta) */}
                {selectedFolder && (
                    <button onClick={() => setSelectedFolder(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ChevronLeft size={24} className="text-gray-600"/>
                    </button>
                )}
                
                <h1 className="text-2xl font-bold text-gray-900">
                    {selectedFolder ? selectedFolder : 'Catálogo General'}
                </h1>

                {/* Buscador (Solo visible dentro de carpeta para no saturar) */}
                {selectedFolder && (
                    <div className="relative ml-4 flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input 
                            type="text" placeholder="Buscar en esta carpeta..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-orange-100"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
              </div>

              {/* Botón Carrito */}
              {cartItems.length > 0 && (
                  <button onClick={() => navigate('/dashboard')} className="bg-orange-600 text-white px-5 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-orange-700 transition">
                      <ShoppingCart size={18} />
                      <span className="font-bold">{cartItems.length}</span>
                      <span className="hidden md:inline text-sm">Ver Presupuesto</span>
                  </button>
              )}
          </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="container mx-auto px-6 py-8">
        
        {/* VISTA 1: LAS CARPETAS (Si no has seleccionado ninguna) */}
        {!selectedFolder ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {FOLDERS.map(folderName => {
                    // Contamos cuántos productos hay dentro para mostrar el numerito
                    const count = products.filter(p => p.familia === folderName).length;
                    
                    return (
                        <button 
                            key={folderName}
                            onClick={() => setSelectedFolder(folderName)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 hover:scale-105 transition-all flex flex-col items-center gap-4 group"
                        >
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Folder size={40} fill="currentColor" fillOpacity={0.2} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-gray-800 text-lg">{folderName}</h3>
                                <p className="text-sm text-gray-400">{count} artículos</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        ) : (
            // VISTA 2: LOS PRODUCTOS (Grid de tarjetas)
            <div>
                 {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={64} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-500">No hay productos en esta carpeta o no coinciden con tu búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredProducts.map((product, index) => (
                            <ProductCard 
                                // CAMBIAMOS LA KEY: Usamos ID + index para garantizar que sea única
                                key={`${product.id}-${index}`} 
                                product={product} 
                                onAddToQuote={handleAddToQuote} 
                            />
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default Catalog;