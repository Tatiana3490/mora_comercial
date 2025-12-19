import React, { useState, useEffect } from 'react';
import { LayoutGrid, Users, FileText, TrendingUp, DollarSign, Calendar, Pencil, Trash2, Eye, Check, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// ==========================================
// COMPONENTE LOCAL: DeleteModal
// ==========================================
const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">¿Eliminar presupuesto?</h3>
          <p className="text-sm text-gray-500 mt-3">
            Esta acción es permanente y no se podrá recuperar la información. 
            ¿Estás seguro de que deseas continuar?
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-sm"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL: Dashboard
// ==========================================
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  const userRole = localStorage.getItem('userRole') || 'admin'; 
  const userId = parseInt(localStorage.getItem('userId') || '1');
  
  const [stats, setStats] = useState({
    totalIngresos: 0,
    clientesCount: 0,
    presupuestosPendientes: 0
  });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [clientsMap, setClientsMap] = useState({}); 

  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true 
    }).format(numero);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/presupuestos/${id}`, {
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
        toast.success(`Presupuesto ${newStatus.toLowerCase()}`);
      } else {
        toast.error("Error al actualizar el estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteClick = (id) => {
    setQuoteToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleteModalOpen(false);

    const token = localStorage.getItem('token');

    toast.promise(
      fetch(`${import.meta.env.VITE_API_URL}/v1/presupuestos/${quoteToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(async (res) => {
        if (!res.ok) throw new Error();
        setRecentQuotes(prev => prev.filter(q => (q.id_presupuesto || q.id) !== quoteToDelete));
        return "Eliminado";
      }),
      {
        loading: 'Eliminando...',
        success: <b>Presupuesto eliminado</b>,
        error: <b>Error al eliminar</b>,
      }
    );
    setQuoteToDelete(null);
  };

  const handleEdit = (id, currentStatus) => {
    if (userRole !== 'admin' && currentStatus === 'ACEPTADO') {
      toast((t) => (
        <div className="flex flex-col w-full max-w-sm">
          <div className="flex items-start gap-3">
             <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                <AlertTriangle size={20} />
             </div>
             <div>
               <p className="font-bold text-white">¿Editar presupuesto aceptado?</p>
               <p className="text-sm text-gray-300 mt-1">
                 El estado cambiará a <span className="font-bold text-orange-400">PENDIENTE</span>.
               </p>
             </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end border-t pt-3 border-gray-700">
            <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition">
              Cancelar
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
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
        duration: 8000,
        position: 'top-center',
        style: {
          background: '#2d2d30', 
          color: '#fff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #444'
        }
      }); // <--- CORREGIDO AQUÍ
      return;
    }
    localStorage.removeItem('quoteItems');
    localStorage.removeItem('quoteClient');
    navigate(`/presupuestos/editar/${id}`);
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const resClients = await fetch('${import.meta.env.VITE_API_URL}/v1/clientes/', { headers });
        let clientsData = resClients.ok ? await resClients.json() : [];

        if (userRole !== 'admin') {
            clientsData = clientsData.filter(c => c.id_comercial_propietario === userId);
        }

        const clientsDictionary = {};
        clientsData.forEach(client => {
            clientsDictionary[client.id_cliente || client.id] = client.nombre;
        });
        setClientsMap(clientsDictionary); 

        const resQuotes = await fetch('${import.meta.env.VITE_API_URL}/v1/presupuestos/', { headers });
        let quotesData = resQuotes.ok ? await resQuotes.json() : [];

        if (userRole !== 'admin') {
            quotesData = quotesData.filter(q => q.id_comercial_creador === userId);
        }

        const totalDinero = quotesData.reduce((acc, q) => acc + (q.total_neto || 0), 0);
        const pendientes = quotesData.filter(q => q.estado === 'PENDIENTE').length;

        setStats({
          totalIngresos: totalDinero,
          clientesCount: clientsData.length,
          presupuestosPendientes: pendientes
        });

        const ultimos = [...quotesData].reverse().slice(0, 10);
        setRecentQuotes(ultimos);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [userRole, userId]);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
           <p className="text-gray-500">
             Bienvenido, <span className="font-semibold text-orange-600 capitalize">{userRole}</span>.
           </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500"/> 
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Volumen {userRole === 'admin' ? 'Total' : 'Mío'}</p>
                <h2 className="text-3xl font-bold text-gray-900">{formatoMoneda(stats.totalIngresos)}</h2>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <DollarSign size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Clientes Activos</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.clientesCount}</h2>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pendientes</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.presupuestosPendientes}</h2>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <FileText size={24} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
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
                        <th className="px-6 py-3 font-semibold text-right">Total</th>
                        <th className="px-6 py-3 font-semibold text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {recentQuotes.map((quote) => (
                        <tr key={quote.id_presupuesto || quote.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {clientsMap[quote.id_cliente] || `ID: ${quote.id_cliente}`}
                            </td>
                           <td className="px-6 py-4 text-sm text-gray-500">
                                {quote.fecha_presupuesto ? new Date(quote.fecha_presupuesto).toLocaleDateString('es-ES') : '-'}
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
                            <td className="px-6 py-4 text-center flex justify-center gap-1">
                                {userRole === 'admin' && quote.estado === 'PENDIENTE' && (
                                    <>
                                        <button onClick={() => handleStatusChange(quote.id_presupuesto || quote.id, 'ACEPTADO')} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition"><Check size={18}/></button>
                                        <button onClick={() => handleStatusChange(quote.id_presupuesto || quote.id, 'RECHAZADO')} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"><X size={18}/></button>
                                    </>
                                )}
                                <button onClick={() => handleEdit(quote.id_presupuesto || quote.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Eye size={18}/></button>
                                <button onClick={() => handleEdit(quote.id_presupuesto || quote.id, quote.estado)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18}/></button>
                                <button onClick={() => handleDeleteClick(quote.id_presupuesto || quote.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Dashboard;