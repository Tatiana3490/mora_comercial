import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Save, Plus, FileText, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const Quotes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = parseInt(localStorage.getItem('userId') || '1');
  const userRole = localStorage.getItem('userRole') || 'admin';
  const [isEditing, setIsEditing] = useState(false);

  const [items, setItems] = useState(() => {
    if (!id) {
      const savedItems = localStorage.getItem('quoteItems');
      return savedItems ? JSON.parse(savedItems) : [];
    }
    return [];
  });

  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(() => {
    if (!id) return localStorage.getItem('quoteClient') || '';
    return '';
  });

  const [loading, setLoading] = useState(true);

  // --- FUNCIÓN PARA FORMATEAR DINERO ---
  const formatoMoneda = (cantidad) => {
    let numero = parseFloat(cantidad);
    if (isNaN(numero)) numero = 0;
    
    return numero.toFixed(2)
      .replace('.', ',') 
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' €';
  };

  useEffect(() => {
    if (!id) localStorage.setItem('quoteClient', selectedClientId);
  }, [selectedClientId, id]);

  useEffect(() => {
    if (!id) localStorage.setItem('quoteItems', JSON.stringify(items));
  }, [items, id]);

  const cargarPresupuestoParaEditar = async (idPresupuesto) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/presupuestos/${idPresupuesto}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedClientId(data.id_cliente);
        const itemsFormateados = data.lineas.map(linea => ({
          id_articulo: linea.id_articulo,
          nombre: linea.descripcion,
          descripcion: linea.descripcion,
          cantidad: linea.cantidad,
          precio: linea.precio_unitario,
          familia: linea.familia || ''
        }));
        setItems(itemsFormateados);
      }
    } catch (error) {
      console.error("Error al cargar presupuesto:", error);
      toast.error("Error al cargar los datos para editar");
    }
  };

  useEffect(() => {
    async function fetchClients() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('${import.meta.env.VITE_API_URL}/v1/clientes/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          let data = await response.json();
          if (userRole !== 'admin') {
            data = data.filter(c => c.id_comercial_propietario === userId);
          }
          setAvailableClients(data);
        }
      } catch (error) {
        console.error("Error conexión clientes:", error);
        toast.error("No se pudieron cargar los clientes");
      } finally {
        setLoading(false);
      }
    }

    fetchClients();

    if (id) {
      setIsEditing(true);
      cargarPresupuestoParaEditar(id);
    }
  }, [id, userRole, userId]);

  // --- CÁLCULOS TOTALES ---
  const total = items.reduce((acc, item) => acc + ((parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 0)), 0);

  const handleSaveQuote = async () => {
    if (!selectedClientId) return toast.error("⚠️ Selecciona un cliente primero");

    try {
      const token = localStorage.getItem('token');

      const savingPromise = new Promise(async (resolve, reject) => {
        const budgetData = {
          id_cliente: parseInt(selectedClientId),
          id_comercial_creador: userId,
          estado: "PENDIENTE",
          fecha_validez: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total: total, 
          lineas: items.map(item => ({
            id_articulo: item.id_articulo || item.id,
            cantidad: parseInt(item.cantidad),
            precio_unitario: parseFloat(item.precio),
            descripcion: item.descripcion || item.nombre || "Material cerámico"
          }))
        };

        const url = isEditing
          ? `${import.meta.env.VITE_API_URL}/v1/presupuestos/${id}`
          : '${import.meta.env.VITE_API_URL}/v1/presupuestos/';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(budgetData)
        });

        if (response.ok) {
          resolve();
        } else {
          const errorData = await response.json();
          reject(errorData.detail?.[0]?.msg || 'Error desconocido');
        }
      });

      await toast.promise(savingPromise, {
        loading: 'Guardando presupuesto...',
        success: isEditing ? 'Presupuesto actualizado correctamente' : 'Presupuesto creado con éxito',
        error: (err) => `Error: ${err}`
      });

      localStorage.removeItem('quoteItems');
      localStorage.removeItem('quoteClient');
      setItems([]);
      setSelectedClientId('');
      setIsEditing(false);
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
    }
  };

  const generatePDFOnly = () => {
    if (!selectedClientId) return toast.error("Selecciona un cliente para el PDF");

    const toastId = toast.loading("Generando PDF...");

    const client = availableClients.find(c => c.id_cliente == selectedClientId) || {};
    const doc = new jsPDF();
    const brandColor = [45, 55, 72];
    const logo = new Image();
    logo.src = '/logo-mora.png';

    const renderPDF = () => {
      // Cabecera color
      doc.setFillColor(...brandColor); doc.rect(0, 0, 210, 40, 'F');
      
      if (logo.complete && logo.naturalHeight !== 0) {
          doc.addImage(logo, 'PNG', 14, 10, 50, 20);
      }

      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(200, 200, 200);
      doc.text("CIF: B45040227", 200, 12, { align: 'right' });
      doc.text("ANTIGUA CTRA. MADRID- TOLEDO, KM 38,400", 200, 17, { align: 'right' });
      doc.text("45200 Illescas (TOLEDO), España", 200, 22, { align: 'right' });

      doc.setFontSize(18); doc.setTextColor(...brandColor); doc.setFont("helvetica", "bold");
      const titulo = isEditing ? `PRESUPUESTO Nº ${id}` : `PRESUPUESTO - ${new Date().toLocaleDateString('es-ES')}`;
      doc.text(titulo, 14, 60);

      doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal");
      doc.text("FACTURAR A:", 14, 70);
      doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold");
      doc.text(`${client.nombre || 'Cliente'}`, 14, 76);
      doc.setFontSize(10); doc.setTextColor(80); doc.setFont("helvetica", "normal");
      doc.text(`NIF/CIF: ${client.nif || '-'}`, 14, 82);
      doc.text(`${client.direccion || '-'}`, 14, 87);

      const rows = items.map(i => [
        i.nombre,
        i.cantidad,
        formatoMoneda(i.precio),
        formatoMoneda(i.cantidad * i.precio)
      ]);

      autoTable(doc, {
        startY: 105,
        head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO UNIT.', 'TOTAL']],
        body: rows,
        theme: 'plain',
        headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold', halign: 'left', cellPadding: 3 },
        styles: { fontSize: 10, cellPadding: 3, textColor: 50 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        }
      });

      const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 10;
      doc.setFontSize(14); doc.setTextColor(...brandColor); doc.setFont("helvetica", "bold");
      doc.text(`TOTAL`, 160, finalY + 10, { align: 'right' });
      doc.text(`${formatoMoneda(total)}`, 200, finalY + 10, { align: 'right' });

      doc.save(`Presupuesto_${isEditing ? id : 'Nuevo'}.pdf`);
      toast.dismiss(toastId);
      toast.success("PDF descargado");
    };

    logo.onload = renderPDF;
    logo.onerror = () => {
      renderPDF();
    };
  };

  const handleDelete = (idx) => setItems(items.filter((_, i) => i !== idx));
  
  const handleUpdate = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = val;
    setItems(newItems);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? `Editar Presupuesto #${id}` : 'Nuevo Presupuesto'}
        </h1>
        <p className="text-gray-500 mb-8">Configura los precios finales para el cliente.</p>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><User size={16} /> Cliente</label>
            {loading ? <p className="text-sm text-gray-400">Cargando...</p> : (
              <select className="block w-full p-3 border border-gray-300 rounded-lg outline-none" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                <option value="">-- Seleccionar Cliente --</option>
                {availableClients.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
                ))}
              </select>
            )}
          </div>
          <button onClick={generatePDFOnly} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg flex items-center gap-2"><FileText size={18} /> PDF</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Precio (€)</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Presupuesto vacío. Ve al catálogo para añadir productos.</td></tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.nombre}</div>
                      <div className="text-xs text-gray-500">{item.familia}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input type="number" min="1" className="w-20 border rounded p-1 text-center" value={item.cantidad} onChange={(e) => handleUpdate(index, 'cantidad', e.target.value)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input type="number" step="0.01" className="w-24 border-2 border-orange-100 rounded p-1 text-center font-bold text-gray-800 outline-none" value={item.precio} onChange={(e) => handleUpdate(index, 'precio', e.target.value)} />
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-700">
                      {formatoMoneda((parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 0))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(index)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <button onClick={() => navigate('/catalogo')} className="text-orange-600 font-bold flex items-center gap-2 hover:underline"><Plus size={18} /> Añadir productos</button>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR CON LISTADO DE PRODUCTOS --- */}
      <div className="w-full lg:w-96 bg-slate-900 text-white p-8 flex flex-col justify-between h-auto lg:h-screen sticky top-0">
        <div className="flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold text-orange-500 mb-6 shrink-0">Resumen Económico</h2>
          
          {/* LISTA DE PRODUCTOS CON SCROLL Y PRECIO UNITARIO */}
          <div className="space-y-3 mb-6 overflow-y-auto pr-2 flex-1 min-h-0 custom-scrollbar">
            {items.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No hay productos seleccionados.</p>
            ) : (
                items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm border-b border-gray-700 pb-2 last:border-0">
                        <div className="text-gray-300 pr-2">
                            <span className="block text-white font-medium">{item.nombre}</span>
                            
                            {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
                            <div className="text-xs text-gray-400 mt-1">
                                <span>x{item.cantidad} ud.</span>
                                <span className="mx-2 text-gray-600">|</span>
                                <span>{formatoMoneda(item.precio)} /ud.</span>
                            </div>
                            {/* --------------------------- */}
                            
                        </div>
                        <span className="text-gray-200 font-mono whitespace-nowrap pt-1">
                            {formatoMoneda(item.precio * item.cantidad)}
                        </span>
                    </div>
                ))
            )}
          </div>

          <div className="pt-4 border-t border-gray-700 shrink-0">
            <div className="flex justify-between items-end">
              <span className="font-bold text-white text-lg">TOTAL</span>
              <span className="font-bold text-white text-3xl">{formatoMoneda(total)}</span>
            </div>
          </div>
        </div>
        
        <button onClick={handleSaveQuote} disabled={items.length === 0} className={`w-full py-4 px-6 rounded-lg mt-8 shadow-lg font-bold flex justify-center items-center gap-2 transition shrink-0 ${items.length === 0 ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
          <Save size={20} /> {items.length === 0 ? 'Vacío' : (isEditing ? 'Actualizar' : 'Guardar')}
        </button>
      </div>
    </div>
  );
};

export default Quotes;