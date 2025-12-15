import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Save, Plus, FileText, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Quotes = () => {
  // --- ESTADOS ---
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [isEditing, setIsEditing] = useState(false); 
  
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('quoteItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  const [availableClients, setAvailableClients] = useState([]);
  // Leemos del localStorage al iniciar
  const [selectedClientId, setSelectedClientId] = useState(localStorage.getItem('quoteClient') || '');
  const [loading, setLoading] = useState(true);

  // --- 🔥 1. EFECTO: PERSISTENCIA DEL CLIENTE ---
  // Cada vez que cambie el cliente seleccionado, lo guardamos en memoria
  useEffect(() => {
    localStorage.setItem('quoteClient', selectedClientId);
  }, [selectedClientId]);

  // --- 2. FUNCIÓN DE CARGA DE DATOS (Definirla antes de usarla) ---
  const cargarPresupuestoParaEditar = async (idPresupuesto) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/v1/presupuestos/${idPresupuesto}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // 1. Poner el cliente
            setSelectedClientId(data.id_cliente);
            
            // 2. Convertir líneas del Backend a formato Frontend
            const itemsFormateados = data.lineas.map(linea => ({
                id_articulo: linea.id_articulo,
                nombre: linea.descripcion,      
                descripcion: linea.descripcion,
                cantidad: linea.cantidad,
                precio: linea.precio_unitario
            }));
            
            setItems(itemsFormateados);
        }
    } catch (error) {
        console.error("Error al cargar presupuesto:", error);
        alert("Error al cargar los datos para editar.");
    }
  };

  // --- 🔥 3. EFECTO: CARGA INICIAL (Clientes y Datos de Edición) ---
  useEffect(() => {
    // A. Cargar Clientes
    async function fetchClients() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/v1/clientes/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableClients(data);
            }
        } catch (error) {
            console.error("Error conexión clientes:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchClients();

    // B. Si hay ID en la URL, gestionamos la edición
    if (id) {
        setIsEditing(true);
        // 🔥 CAMBIO CLAVE: Solo cargamos de la API si la lista está VACÍA.
        // Si ya tiene cosas (items.length > 0), significa que venimos del catálogo
        // con datos frescos, así que NO recargamos para no perderlos.
        if (items.length === 0) {
            cargarPresupuestoParaEditar(id);
        }
    } else {
       // ... (el resto del else se queda igual)
       if (!id) {
            const savedItems = localStorage.getItem('quoteItems');
            if (savedItems) setItems(JSON.parse(savedItems));
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Solo se ejecuta al cambiar el ID (o al montar el componente)


  // --- 4. EFECTO: PERSISTENCIA DE ÍTEMS ---
  // Guardamos SIEMPRE para que el catálogo pueda sumar productos
  useEffect(() => {
    localStorage.setItem('quoteItems', JSON.stringify(items));
  }, [items]); // Quitamos isEditing de las dependencias

  // --- 💶 FORMATO ESPAÑOL ---
  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      useGrouping: true,
    }).format(numero);
  };

  // --- CÁLCULOS ---
  const baseImponible = items.reduce((acc, item) => acc + ((parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 0)), 0);
  const iva = baseImponible * 0.21;
  const total = baseImponible + iva; 

  // --- GUARDAR (CREAR O EDITAR) ---
  const handleSaveQuote = async () => {
    if (!selectedClientId) return alert("⚠️ Selecciona un cliente primero.");

    try {
        const token = localStorage.getItem('token');
        
        const budgetData = {
            id_cliente: parseInt(selectedClientId),
            id_comercial_creador: 1, 
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
            ? `http://localhost:8000/v1/presupuestos/${id}` 
            : 'http://localhost:8000/v1/presupuestos/';
            
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
            alert(isEditing ? "✅ Presupuesto actualizado correctamente" : "✅ Presupuesto creado con éxito");
            
            // Limpieza TOTAL
            localStorage.removeItem('quoteItems');
            localStorage.removeItem('quoteClient'); 
            
            setItems([]);
            setSelectedClientId(''); 
            setIsEditing(false);
            
            navigate('/dashboard');
        } else {
            const errorData = await response.json();
            console.error("Detalle del error:", errorData);
            alert(`❌ Error: ${errorData.detail?.[0]?.msg || 'Revisa la consola'}`);
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
  };

  // --- PDF CON CABECERA NARANJA Y LOGO ---
  // --- PDF ESTILO "CERÁMICAS MORA" (Elegante & Arquitectónico) ---
  const generatePDFOnly = () => {
    if (!selectedClientId) return alert("Selecciona cliente.");
    const client = availableClients.find(c => c.id_cliente == selectedClientId) || {};
    
    const doc = new jsPDF();
    
    // Color Corporativo: Azul Pizarra Oscuro (Inspirado en tu web)
    const brandColor = [45, 55, 72]; 

    // Cargamos el logo (Debe ser el BLANCO que tienes: logo.png)
    const logo = new Image();
    logo.src = '/logo-mora.png'; 
    
    logo.onload = () => {
        // 1. CABECERA: Franja oscura elegante
        doc.setFillColor(...brandColor); 
        doc.rect(0, 0, 210, 40, 'F'); // Un poco más alta (40) para dar aire
        
        // 2. LOGO: Blanco sobre el fondo oscuro
        doc.addImage(logo, 'PNG', 14, 10, 50, 20); 
        
        // 3. DATOS EMPRESA: Texto blanco fino y elegante
        doc.setFont("helvetica", "normal"); // Tipografía limpia
        doc.setFontSize(9); doc.setTextColor(200, 200, 200); // Gris claro, no blanco puro
        doc.text("CIF: B-12345678", 200, 12, { align: 'right' });
        doc.text("Pol. Ind. La Cerámica, Nave 3", 200, 17, { align: 'right' });
        doc.text("12000 Castellón (España)", 200, 22, { align: 'right' });
        doc.text("info@ceramicasmora.com", 200, 27, { align: 'right' });
        doc.text("www.ceramicasmora.com", 200, 32, { align: 'right' });

        // --- CUERPO DEL DOCUMENTO ---
        
        // TÍTULO: Minimalista
        doc.setFontSize(18); doc.setTextColor(...brandColor); doc.setFont("helvetica", "bold");
        const titulo = isEditing 
            ? `PRESUPUESTO Nº ${id}` 
            : `PRESUPUESTO - ${new Date().toLocaleDateString('es-ES')}`;
        doc.text(titulo, 14, 60);

        // DATOS CLIENTE: Diseño limpio
        doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal");
        doc.text("FACTURAR A:", 14, 70);
        
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold");
        doc.text(`${client.nombre || 'Cliente'}`, 14, 76);
        
        doc.setFontSize(10); doc.setTextColor(80); doc.setFont("helvetica", "normal");
        doc.text(`NIF/CIF: ${client.nif || '-'}`, 14, 82);
        doc.text(`${client.direccion || '-'}`, 14, 87);
        doc.text(`${client.poblacion || ''} (${client.provincia || ''})`, 14, 92);

        // TABLA: Estilo arquitectónico (Cabecera oscura, líneas limpias)
        const rows = items.map(i => [
            i.nombre, 
            i.cantidad, 
            formatoMoneda(parseFloat(i.precio)), 
            formatoMoneda(i.cantidad * i.precio)
        ]);
        
        autoTable(doc, { 
            startY: 105, 
            head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO UNIT.', 'TOTAL']], 
            body: rows, 
            theme: 'plain', // Quitamos las rayas de cebra para un look más limpio
            headStyles: { 
                fillColor: brandColor, 
                textColor: 255, 
                fontStyle: 'bold',
                halign: 'left',
                cellPadding: 3
            },
            styles: {
                fontSize: 10,
                cellPadding: 3,
                textColor: 50
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, 
                1: { cellWidth: 25, halign: 'center' }, 
                2: { cellWidth: 35, halign: 'right' }, 
                3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' } 
            },
            // Añadimos una línea gris fina debajo de cada fila para separar
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 0) {
                   // Lógica opcional si quisiéramos bordes custom
                }
            }
        });
        
        // TOTALES: Alineados y elegantes
        const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 10;
        
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`Base Imponible`, 160, finalY, { align: 'right' });
        doc.text(`${formatoMoneda(baseImponible)}`, 200, finalY, { align: 'right' });
        
        doc.text(`IVA (21%)`, 160, finalY + 6, { align: 'right' });
        doc.text(`${formatoMoneda(iva)}`, 200, finalY + 6, { align: 'right' });
        
        // Línea divisoria elegante
        doc.setDrawColor(...brandColor); doc.setLineWidth(0.5);
        doc.line(150, finalY + 10, 200, finalY + 10);
        
        // TOTAL FINAL
        doc.setFontSize(14); doc.setTextColor(...brandColor); doc.setFont("helvetica", "bold");
        doc.text(`TOTAL`, 160, finalY + 20, { align: 'right' });
        doc.text(`${formatoMoneda(total)}`, 200, finalY + 20, { align: 'right' });

        // PIE DE PÁGINA
        const pageHeight = doc.internal.pageSize.height;
        doc.setFillColor(...brandColor);
        // Pequeña franja decorativa abajo del todo
        doc.rect(0, pageHeight - 5, 210, 5, 'F'); 
        
        doc.setFontSize(8); doc.setTextColor(120); doc.setFont("helvetica", "normal");
        doc.text("Validez de la oferta: 15 días. Forma de pago según acuerdo.", 14, pageHeight - 15);

        doc.save(`Presupuesto_${isEditing ? id : 'Nuevo'}.pdf`);
    };

    logo.onerror = () => {
        alert("❌ Error: Asegúrate de tener 'logo-mora.png' en la carpeta public.");
    };
  };
  
  const handleDelete = (idx) => setItems(items.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? `Editar Presupuesto #${id}` : 'Nuevo Presupuesto'}
        </h1>
        <p className="text-gray-500 mb-8">Configura los precios finales para el cliente.</p>
        
        {/* SELECTOR */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><User size={16}/> Cliente</label>
            {loading ? <p className="text-sm text-gray-400">Cargando...</p> : (
                <select className="block w-full p-3 border border-gray-300 rounded-lg outline-none" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                    <option value="">-- Seleccionar Cliente --</option>
                    {availableClients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
                </select>
            )}
          </div>
          <button onClick={generatePDFOnly} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg flex items-center gap-2"><FileText size={18}/> PDF</button>
        </div>

        {/* TABLA */}
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
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">Presupuesto vacío.</td></tr>
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
                        <input type="number" step="0.01" className="w-24 border-2 border-orange-100 rounded p-1 text-center font-bold text-gray-800 outline-none" placeholder="0.00" value={item.precio} onChange={(e) => handleUpdate(index, 'precio', e.target.value)} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-700">
                        {formatoMoneda((parseFloat(item.precio)||0) * (parseInt(item.cantidad)||0))}
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
             <button onClick={() => navigate('/catalogo')} className="text-orange-600 font-bold flex items-center gap-2 hover:underline"><Plus size={18}/> Añadir productos</button>
          </div>
        </div>
      </div>

      {/* TOTALES */}
      <div className="w-full lg:w-96 bg-slate-900 text-white p-8 flex flex-col justify-between h-auto lg:h-screen sticky top-0">
        <div>
          <h2 className="text-xl font-bold text-orange-500 mb-6">Resumen Económico</h2>
          <div className="space-y-4 text-gray-300 text-sm">
            <div className="flex justify-between"><span>Base Imponible</span><span>{formatoMoneda(baseImponible)}</span></div>
            <div className="flex justify-between"><span>IVA (21%)</span><span className="font-medium text-white">{formatoMoneda(iva)}</span></div>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-end">
                  <span className="font-bold text-white text-lg">TOTAL</span>
                  <span className="font-bold text-white text-3xl">{formatoMoneda(total)}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleSaveQuote} disabled={items.length === 0} className={`w-full py-4 px-6 rounded-lg mt-8 shadow-lg font-bold flex justify-center items-center gap-2 transition ${items.length === 0 ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
          <Save size={20}/> {items.length === 0 ? 'Vacío' : (isEditing ? 'Actualizar Presupuesto' : 'Guardar y Finalizar')}
        </button>
      </div>
    </div>
  );
};

export default Quotes;