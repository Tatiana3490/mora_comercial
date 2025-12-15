import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, BookOpen } from 'lucide-react';

const Catalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // 1. CARGAR PRODUCTOS DE LA API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/v1/articulos/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error("Error conexión", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 2. FILTROS
  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== 'Todas') {
      result = result.filter(p => (p.familia === selectedCategory) || (p.categoria === selectedCategory));
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  // 3. FUNCIÓN AÑADIR
  const handleAddToQuote = (product) => {
    const existingItems = JSON.parse(localStorage.getItem('quoteItems')) || [];
    
    // Creamos el objeto con LOS MISMOS NOMBRES que espera Quotes.jsx
    const newItem = {
      id_temp: Date.now(), 
      id_articulo: product.id, // Tu ID es un string (ej: KLK-001)
      nombre: product.nombre,
      familia: product.familia || product.categoria,
      descripcion: product.descripcion,
      precio: 0, // Precio a 0 para rellenar luego
      cantidad: 1
    };

    // Guardamos en la mochila
    localStorage.setItem('quoteItems', JSON.stringify([...existingItems, newItem]));
    
    // Nos vamos a la página de presupuestos
    navigate('/presupuestos');
  };

  const categories = ['Todas', ...new Set(products.map(p => p.familia || p.categoria).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">Catálogo</h1>
           <p className="text-gray-500">Selecciona materiales para añadir al presupuesto.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" placeholder="Buscar..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative w-full md:w-48">
                <select 
                    className="w-full pl-3 pr-8 py-2 border rounded-lg bg-white outline-none appearance-none"
                    value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <Filter className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
            </div>
        </div>
      </div>
      
      {loading ? <div className="text-center py-20 text-gray-500">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                
                {/* IMAGEN */}
                <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {product.imagen_path ? (
                        <img 
                            src={`http://localhost:8000/static/${product.imagen_path}`} 
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center text-gray-400 ${product.imagen_path ? 'hidden' : ''}`}>
                        <BookOpen size={40} opacity={0.3} />
                    </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">
                            {product.familia || product.categoria}
                        </span>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{product.nombre}</h3>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                        {product.descripcion}
                    </p>

                    <button 
                        onClick={() => handleAddToQuote(product)}
                        className="w-full bg-gray-900 hover:bg-orange-600 text-white py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <ShoppingCart size={16} /> Añadir al Presupuesto
                    </button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;