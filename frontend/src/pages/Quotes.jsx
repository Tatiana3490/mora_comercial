import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Quotes = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('quoteItems');
    if (savedItems) return JSON.parse(savedItems);
    return [{ id: 1, name: 'CLINKER BLANCO', category: 'Clinker', price: 1.15, quantity: 100 }];
  });

  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState('');

  // --- EFECTOS ---
  useEffect(() => {
    const savedClients = localStorage.getItem('clientsData');
    if (savedClients) {
      setAvailableClients(JSON.parse(savedClients));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quoteItems', JSON.stringify(items));
  }, [items]);

  // --- CÁLCULOS ---
  const baseImponible = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const iva = baseImponible * 0.21;
  const shipping = 50.00; 
  const total = baseImponible + iva + shipping;

  // --- FUNCIÓN 1: SOLO GUARDAR EN DASHBOARD (Sin descargar) ---
  const handleSaveQuote = () => {
    // 1. Validar
    if (!selectedClientName) {
      alert("Por favor, selecciona un cliente antes de guardar.");
      return;
    }

    // 2. Buscar datos del cliente
    const clientData = availableClients.find(c => c.name === selectedClientName) || { name: selectedClientName };

    // 3. Crear el registro para el Dashboard
    const newQuoteRecord = {
      id: Date.now(), // ID único
      clientName: clientData.name,
      company: clientData.company || 'Particular',
      date: new Date().toLocaleDateString(), // Fecha de hoy
      amount: total,
      status: 'Pendiente' // <--- ESTADO INICIAL PARA EL DASHBOARD
    };

    // 4. Guardar en el historial (LocalStorage)
    const currentHistory = JSON.parse(localStorage.getItem('quotesHistory')) || [];
    localStorage.setItem('quotesHistory', JSON.stringify([newQuoteRecord, ...currentHistory]));

    // 5. Limpiar el presupuesto actual (Opcional, para que al volver esté vacío)
    // setItems([]); 
    // localStorage.removeItem('quoteItems');

    // 6. Redirigir al Dashboard
    alert("Presupuesto guardado correctamente.");
    navigate('/'); // <--- NOS LLEVA AL INICIO PARA VERLO EN LA TABLA
  };

  // --- FUNCIÓN 2: SOLO DESCARGAR PDF (Opcional) ---
  const generatePDFOnly = () => {
    if (!selectedClientName) {
      alert("Selecciona un cliente para el PDF.");
      return;
    }
    const clientData = availableClients.find(c => c.name === selectedClientName) || { name: selectedClientName };
    const doc = new jsPDF();

    // Diseño del PDF (Mismo que tenías)
    doc.setFontSize(22); doc.setTextColor(234, 88, 12); doc.text("Cerámicas Mora", 14, 20);
    doc.setFontSize(12); doc.setTextColor(100); doc.text("Presupuesto", 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setFontSize(14); doc.setTextColor(0); doc.text("Cliente:", 14, 50);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Nombre: ${clientData.name}`, 14, 56);
    doc.text(`Empresa: ${clientData.company || ''}`, 14, 61);

    const tableRows = items.map(item => [item.name, item.category, item.quantity, `€${item.price.toFixed(2)}`, `€${(item.price * item.quantity).toFixed(2)}`]);
    autoTable(doc, { startY: 80, head: [['Producto', 'Cat.', 'Cant.', 'Precio', 'Total']], body: tableRows, headStyles: { fillColor: [234, 88, 12] } });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 80) + 10;
    doc.text(`Total: €${total.toFixed(2)}`, 140, finalY + 20);

    doc.save(`Borrador_${clientData.name}.pdf`);
  };

  // --- HANDLERS (Igual que antes) ---
  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value) || 0; 
    setItems(items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };
  const handlePriceChange = (id, value) => {
    const newPrice = parseFloat(value) || 0; 
    setItems(items.map(item => item.id === id ? { ...item, price: newPrice } : item));
  };
  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Presupuesto</h1>
        
        {/* PANEL CLIENTE */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md border"
                value={selectedClientName}
                onChange={(e) => setSelectedClientName(e.target.value)}
              >
                <option value="">-- Seleccionar un Cliente --</option>
                {availableClients.map((client) => (
                  <option key={client.id} value={client.name}>{client.name} - {client.company}</option>
                ))}
              </select>
            </div>
            {/* BOTÓN SUPERIOR: Solo descarga PDF (útil para previsualizar) */}
            <button 
              onClick={generatePDFOnly}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded shadow transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar PDF
            </button>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Líneas de Presupuesto ({items.length})</h2>
          <button onClick={() => navigate('/catalogo')} className="bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded flex items-center gap-2 text-sm font-medium transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Añadir Producto
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant.</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 text-right">
                    <input type="number" step="0.01" value={item.price} onChange={(e) => handlePriceChange(item.id, e.target.value)} className="w-20 border rounded px-1 text-right" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} className="w-16 border rounded px-1 text-center" />
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right">€{(item.price * item.quantity).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold">X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="p-8 text-center text-gray-500">Sin productos.</div>}
        </div>
      </div>

      {/* PANEL RESUMEN LATERAL */}
      <div className="w-full lg:w-96 bg-slate-900 text-white p-8 flex flex-col justify-between h-auto lg:h-screen sticky top-0">
        <div>
          <h2 className="text-xl font-bold text-white mb-8 text-orange-500">Resumen de Totales</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex justify-between"><span>Base Imponible</span><span>€{baseImponible.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA (21%)</span><span>€{iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Gastos de Envío</span><span>€{shipping.toFixed(2)}</span></div>
            <div className="border-t border-gray-700 my-4 pt-4">
              <div className="flex justify-between items-end"><span className="text-lg font-bold text-white">TOTAL</span><span className="text-2xl font-bold text-white">€{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
        
        {/* BOTÓN PRINCIPAL: GUARDAR */}
        <button 
          onClick={handleSaveQuote} // LLAMA A LA NUEVA FUNCIÓN
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg mt-8 shadow-lg transition"
        >
          Guardar Presupuesto
        </button>
      </div>
    </div>
  );
};

export default Quotes;