import React, { useState, useEffect } from 'react';
import { LayoutGrid, Users, FileText, TrendingUp, DollarSign, Calendar, Pencil, Trash2, Eye, Check, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // --- 🔒 SECURITY & ROLES ---
  const userRole = localStorage.getItem('userRole') || 'admin'; 
  const userId = parseInt(localStorage.getItem('userId') || '1');
  
  // Data States
  const [stats, setStats] = useState({
    totalIngresos: 0,
    clientesCount: 0,
    presupuestosPendientes: 0
  });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [clientsMap, setClientsMap] = useState({}); // Stores ID -> Name mapping

  // --- 💶 SPANISH FORMAT ---
  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(numero);
  };

  // --- 🚦 CHANGE STATUS (Admin Only) ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/v1/presupuestos/${id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (response.ok) {
        setRecentQuotes(prev => prev.map(q => 
            (q.id_presupuesto === id || q.id === id) ? { ...q, estado: newStatus } : q
        ));
        
        if (newStatus !== 'PENDIENTE') {
            setStats(prev => ({
                ...prev,
                presupuestosPendientes: Math.max(0, prev.presupuestosPendientes - 1)
            }));
        }
      } else {
        alert("❌ Error al cambiar el estado del presupuesto.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al intentar cambiar estado.");
    }
  };

  // --- 🗑️ DELETE QUOTE ---
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este presupuesto?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/v1/presupuestos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("✅ Presupuesto eliminado");
        window.location.reload(); 
      } else {
        alert("❌ Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // --- ✏️ EDIT / VIEW MODIFICADO CON TOAST ---
  const handleEdit = (id, currentStatus) => {
    
    // CASO 1: Si es Comercial y el presupuesto está ACEPTADO -> Mostrar Toast de Confirmación
    if (userRole !== 'admin' && currentStatus === 'ACEPTADO') {
      
      // Creamos un toast personalizado que NO se cierra solo (o dura mucho)
      toast((t) => (
        <div className="flex flex-col w-full max-w-sm">
          {/* Cabecera del aviso */}
          <div className="flex items-start gap-3">
             <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                <AlertTriangle size={20} />
             </div>
             <div>
               <p className="font-bold text-gray-800">¿Editar presupuesto aceptado?</p>
               <p className="text-sm text-gray-500 mt-1">
                 El estado cambiará a <span className="font-bold text-orange-600">PENDIENTE</span> y necesitará nueva aprobación.
               </p>
             </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 mt-4 justify-end border-t pt-3 border-gray-100">
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                // --- EJECUTAMOS LA NAVEGACIÓN AQUÍ DENTRO ---
                localStorage.removeItem('quoteItems');
                localStorage.removeItem('quoteClient');
                navigate(`/presupuestos/editar/${id}`);
              }}
              className="px-3 py-1.5 text-sm bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition"
            >
              Sí, editar
            </button>
          </div>
        </div>
      ), {
        duration: 8000, // Dura 8 segundos, tiempo suficiente para decidir
        position: 'top-center',
        style: {
           background: '#fff',
           boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
           padding: '16px',
           borderRadius: '12px'
        }
      });

      return; // 🛑 IMPORTANTE: Detenemos la función aquí para esperar el click
    }

    // CASO 2: Navegación normal (Admin o no aceptado)
    localStorage.removeItem('quoteItems');
    localStorage.removeItem('quoteClient');
    navigate(`/presupuestos/editar/${id}`);
  };

  // --- 📥 DATA LOADING ---
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Load Clients
        const resClients = await fetch('http://localhost:8000/v1/clientes/', { headers });
        let clientsData = resClients.ok ? await resClients.json() : [];

        // Security Filter for Clients
        if (userRole !== 'admin') {
            clientsData = clientsData.filter(c => c.id_comercial_propietario === userId);
        }

        // --- 🔥 CRITICAL FIX: Build the Dictionary ---
        const clientsDictionary = {};
        clientsData.forEach(client => {
            // Map ID to Name. Adjust property names if your API differs (e.g., id_cliente vs id)
            clientsDictionary[client.id_cliente || client.id] = client.nombre;
        });
        setClientsMap(clientsDictionary); // Update state

        // 2. Load Quotes
        const resQuotes = await fetch('http://localhost:8000/v1/presupuestos/', { headers });
        let quotesData = resQuotes.ok ? await resQuotes.json() : [];

        // Security Filter for Quotes
        if (userRole !== 'admin') {
            quotesData = quotesData.filter(q => q.id_comercial_creador === userId);
        }

        // Calculate Stats
        const totalDinero = quotesData.reduce((acc, q) => acc + (q.total_neto || 0), 0);
        const pendientes = quotesData.filter(q => q.estado === 'PENDIENTE').length;

        setStats({
          totalIngresos: totalDinero,
          clientesCount: clientsData.length,
          presupuestosPendientes: pendientes
        });

        // Show last 10
        const ultimos = [...quotesData].reverse().slice(0, 10);
        setRecentQuotes(ultimos);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [userRole, userId]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Cargando panel de control...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
           <p className="text-gray-500">
             Bienvenido, <span className="font-semibold text-orange-600 capitalize">{userRole}</span>.
             Visión general del negocio.
           </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500"/> 
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Volumen {userRole === 'admin' ? 'Total' : 'Mío'}</p>
                <h2 className="text-3xl font-bold text-gray-900">{formatoMoneda(stats.totalIngresos)}</h2>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <DollarSign size={24} />
            </div>
        </div>

        {/* Clients */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Clientes Activos</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.clientesCount}</h2>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users size={24} />
            </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pendientes de Aprobación</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.presupuestosPendientes}</h2>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <FileText size={24} />
            </div>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-gray-400"/> Últimos Presupuestos
            </h3>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="px-6 py-3 font-semibold">Cliente</th>
                        <th className="px-6 py-3 font-semibold">Fecha</th>
                        <th className="px-6 py-3 font-semibold">Estado</th>
                        <th className="px-6 py-3 font-semibold text-right">Importe Total</th>
                        <th className="px-6 py-3 font-semibold text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {recentQuotes.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                No hay actividad reciente.
                            </td>
                        </tr>
                    ) : (
                        recentQuotes.map((quote) => (
                            <tr key={quote.id_presupuesto || quote.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {/* 🔥 FIXED: Uses the map to show the name */}
                                    {clientsMap[quote.id_cliente] || `Cliente ID: ${quote.id_cliente}`}
                                </td>
                               <td className="px-6 py-4 text-sm text-gray-500">
                                    {/* Usamos el campo correcto que viene de la base de datos */}
                                    {quote.fecha_presupuesto 
                                      ? new Date(quote.fecha_presupuesto).toLocaleDateString('es-ES')
                                      : '-'
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${quote.estado === 'ACEPTADO' ? 'bg-green-100 text-green-700' : 
                                          quote.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' : 
                                          'bg-yellow-100 text-yellow-700'}`}>
                                        {quote.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-700">
                                    {formatoMoneda(quote.total_neto)}
                                </td>

                                <td className="px-6 py-4 text-center flex justify-center gap-2 items-center">
                                    {userRole === 'admin' && quote.estado === 'PENDIENTE' && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusChange(quote.id_presupuesto || quote.id, 'ACEPTADO')} 
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition mr-1"
                                                title="Aprobar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(quote.id_presupuesto || quote.id, 'RECHAZADO')} 
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition mr-2"
                                                title="Rechazar"
                                            >
                                                <X size={18} />
                                            </button>
                                            <div className="w-px h-5 bg-gray-300 mx-1"></div>
                                        </>
                                    )}

                                    <button 
                                        onClick={() => handleEdit(quote.id_presupuesto || quote.id)} 
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        title="Ver detalles"
                                    >
                                        <Eye size={18} />
                                    </button>

                                    <button 
                                        onClick={() => handleEdit(quote.id_presupuesto || quote.id, quote.estado)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button 
                                        onClick={() => handleDelete(quote.id_presupuesto || quote.id)} 
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;