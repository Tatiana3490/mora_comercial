import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate

const Catalog = () => {
  const navigate = useNavigate(); // Hook para navegar

  // Datos de ejemplo del catálogo
  const [products] = useState([
    { id: 101, name: 'Cerámica Rústica', category: 'Suelos', price: 25.50, image: 'https://via.placeholder.com/150' },
    { id: 102, name: 'Azulejo Blanco Brillo', category: 'Baños', price: 12.00, image: 'https://via.placeholder.com/150' },
    { id: 103, name: 'Teja Curva Roja', category: 'Tejados', price: 0.85, image: 'https://via.placeholder.com/150' },
    { id: 104, name: 'Porcelánico Madera', category: 'Suelos', price: 34.90, image: 'https://via.placeholder.com/150' },
    { id: 105, name: 'Cemento Cola', category: 'Materiales', price: 4.50, image: 'https://via.placeholder.com/150' },
    { id: 106, name: 'Rodapié Rústico', category: 'Acabados', price: 3.20, image: 'https://via.placeholder.com/150' },
  ]);

  // Función para añadir al presupuesto y redirigir
  const handleAddToQuote = (product) => {
    // 1. Leer los items guardados
    const existingItems = JSON.parse(localStorage.getItem('quoteItems')) || [];

    // 2. Crear el nuevo objeto
    const newItem = {
      id: Date.now(), // ID único
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1
    };

    // 3. Guardar en memoria
    localStorage.setItem('quoteItems', JSON.stringify([...existingItems, newItem]));

    // 4. Volver a Presupuestos
    navigate('/presupuestos');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Catálogo de Productos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gray-300 w-full flex items-center justify-center text-gray-500">
              {/* Aquí iría la imagen real */}
              <span>Imagen {product.name}</span> 
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
              <p className="text-gray-500 text-sm">{product.category}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-orange-600 font-bold text-xl">€{product.price.toFixed(2)}</span>
                
                {/* BOTÓN DE ACCIÓN */}
                <button 
                  onClick={() => handleAddToQuote(product)}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 px-3 rounded shadow transition"
                >
                  + Añadir a Presupuesto
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;