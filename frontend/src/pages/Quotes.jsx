import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Save, Plus, FileText, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Quotes = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [items, setItems] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(''); // Usamos ID para la Base de Datos
  const [loading, setLoading] = useState(true);

  // --- 1. CARGA INICIAL (Clientes y Carrito) ---
  useEffect(() => {
    // A. Cargar productos que vienen del Catálogo
    const savedItems = localStorage.getItem('quoteItems');
    if (savedItems) {
        setItems(JSON.parse(savedItems));
    }

    // B. Cargar CLIENTES REALES del Backend
    async function fetchClients() {
        try {
            const token = localStorage.getItem('token');
            // Nota: Ajusta si tu ruta es /v1/clients o /v1/clientes
            const response = await fetch('http://localhost:8000/v1/clients/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setAvailableClients(data); // Guardamos la lista real
            } else {
                console.error("Error cargando clientes");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchClients();
  }, []);

  // Guardar carrito en local por si refrescas la página
  useEffect(() => {
    localStorage.setItem('quoteItems', JSON.stringify(items));
  }, [items]);

  // --- CÁLCULOS ---
  // Convertimos a números por si acaso vienen como texto
  const baseImponible = items.reduce((acc, item) => acc + ((parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 0)), 0);
  const iva = baseImponible * 0.21;
  const total = baseImponible + iva; 

  // --- FUNCIÓN GUARDAR (CONECTADA AL BACKEND) ---
  const handleSaveQuote = async () => {
    if (!selectedClientId) {
      alert("⚠️ Por favor, selecciona un cliente primero.");
      return;
    }

    try {
        const token = localStorage.getItem('token');
        
        // 1. Preparamos el JSON tal cual lo quiere Python
        const budgetData = {
            id_cliente: parseInt(selectedClientId),
            // id_comercial_creador: 1, // El backend lo coge automático del token
            estado: "PENDIENTE",
            fecha_validez: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Validez 15 días
            total: total,
            // Traducimos las líneas para el backend
            lineas: items.map(item => ({
                id_articulo: item.id_articulo || item.id, // El ID del producto (ej: "KLK-001")
                cantidad: parseInt(item.cantidad),
                precio_unitario: parseFloat(item.precio)
            }))
        };

        console.log("🚀 Enviando presupuesto al servidor:", budgetData);

        // 2. Petición POST al servidor
        const response = await fetch('http://localhost:8000/v1/presupuestos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(budgetData)
        });

        if (response.ok) {
            alert("✅ ¡Presupuesto guardado con éxito en la Base de Datos!");
            // Limpiamos el carrito y volvemos al inicio
            localStorage.removeItem('quoteItems');
            setItems([]);
            navigate('/dashboard');
        } else {
            const errorData = await response.json();
            alert("❌ Error al guardar. Revisa la consola.");
            console.error("Detalle del error:", errorData);
        }

    } catch (error) {
        console.error("Error grave:", error);
        alert("Error de conexión con el servidor.");
    }
  };

  // --- GENERAR PDF (Solo visual, sin guardar) ---
  const generatePDFOnly = () => {
    if (!selectedClientId) return alert("Selecciona cliente.");
    // Buscamos los datos del cliente seleccionado para pintarlos en el PDF
    const client = availableClients.find(c => c.id_cliente == selectedClientId) || {};
    
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(234, 88, 12); doc.text("Cerámicas Mora", 14, 20);
    doc.setFontSize(12); doc.setTextColor(100); doc.text(`Presupuesto - ${new Date().toLocaleDateString()}`, 14, 30);
    
    doc.setFontSize(14); doc.setTextColor(0); doc.text("Cliente:", 14, 45);
    doc.setFontSize(10); doc.text(`${client.nombre_completo || 'Cliente'}`, 14, 52);
    doc.text(`NIF: ${client.nif || '-'}`, 14, 57);

    const rows = items.map(i => [
        i.nombre, 
        i.cantidad, 
        `${parseFloat(i.precio).toFixed(2)}€`, 
        `${(i.cantidad * i.precio).toFixed(2)}€`
    ]);
    
    autoTable(doc, { 
        startY: 70, 
        head: [['Producto', 'Cant.', 'Precio Unit.', 'Total']], 
        body: rows,
        headStyles: { fillColor: [234, 88, 12] }
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 80) + 10;
    doc.text(`Total a Pagar: ${total.toFixed(2)} €`, 140, finalY + 10);
    
    doc.save(`Presupuesto_${client.nombre_completo || 'cliente'}.pdf`);
  };

  // --- MANEJADORES DE LA TABLA (Actualizar precios/cantidades) ---
  const handleUpdate = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = val;
    setItems(newItems);
  };
  
  const handleDelete = (idx) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuevo Presupuesto</h1>
        <p className="text-gray-500 mb-8">Configura los precios finales para el cliente.</p>
        
        {/* SELECTOR DE CLIENTE (CONECTADO A LA API) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16}/> Cliente
            </label>
            {loading ? (
                <p className="text-sm text-gray-400">Cargando clientes...</p>
            ) : (
                <select 
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                >
                    <option value="">-- Seleccionar Cliente --</option>
                    {availableClients.map((client) => (
                        <option key={client.id_cliente} value={client.id_cliente}>
                            {client.nombre_completo}
                        </option>
                    ))}
                </select>
            )}
          </div>
          
          <button onClick={generatePDFOnly} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition">
            <FileText size={18}/> Previsualizar PDF
          </button>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Precio Unit. (€)</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">El presupuesto está vacío. Ve al catálogo.</td></tr>
              ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{item.nombre}</div>
                          <div className="text-xs text-gray-500">{item.familia || item.categoria}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                            type="number" min="1"
                            className="w-20 border rounded p-1 text-center"
                            value={item.cantidad}
                            onChange={(e) => handleUpdate(index, 'cantidad', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* CASILLA DE PRECIO PARA RELLENAR */}
                        <input 
                            type="number" step="0.01"
                            className="w-24 border-2 border-orange-100 rounded p-1 text-center font-bold text-gray-800 focus:border-orange-500 outline-none"
                            placeholder="0.00"
                            value={item.precio}
                            onChange={(e) => handleUpdate(index, 'precio', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-700">
                        {((parseFloat(item.precio)||0) * (parseInt(item.cantidad)||0)).toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          
          <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
             <button onClick={() => navigate('/catalogo')} className="text-orange-600 font-bold flex items-center gap-2 hover:underline">
                <Plus size={18}/> Añadir más productos
             </button>
          </div>
        </div>
      </div>

      {/* BARRA LATERAL DE TOTALES */}
      <div className="w-full lg:w-96 bg-slate-900 text-white p-8 flex flex-col justify-between h-auto lg:h-screen sticky top-0">
        <div>
          <h2 className="text-xl font-bold text-orange-500 mb-6">Resumen Económico</h2>
          <div className="space-y-4 text-gray-300 text-sm">
            <div className="flex justify-between"><span>Base Imponible</span><span>{baseImponible.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span>IVA (21%)</span><span>{iva.toFixed(2)} €</span></div>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-end">
                  <span className="font-bold text-white text-lg">TOTAL</span>
                  <span className="font-bold text-white text-3xl">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* BOTÓN FINAL DE GUARDAR */}
        <button 
          onClick={handleSaveQuote}
          disabled={items.length === 0}
          className={`w-full py-4 px-6 rounded-lg mt-8 shadow-lg font-bold flex justify-center items-center gap-2 transition
            ${items.length === 0 ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
        >
          <Save size={20}/> {items.length === 0 ? 'Presupuesto Vacío' : 'Guardar y Finalizar'}
        </button>
      </div>
    </div>
  );
};

export default Quotes;